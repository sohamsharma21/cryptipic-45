import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccessAttempt {
  id: string;
  ipAddress: string;
  timestamp: string;
  success: boolean;
  method: 'passcode' | 'auth' | 'mfa';
  failureReason?: string;
  userAgent?: string;
  geolocation?: {
    ip: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const attempt: AccessAttempt = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Enhanced IP detection
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    attempt.ipAddress || 
                    'unknown';

    // Get geolocation data (optional - could integrate with IP geolocation service)
    let geolocation = attempt.geolocation;
    
    try {
      // You could integrate with a service like ipapi.co, maxmind, etc.
      // For now, just log the IP
      geolocation = {
        ip: clientIP,
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      };
    } catch (geoError) {
      console.log('Geolocation lookup failed:', geoError);
    }

    // Store the access attempt
    const { error } = await supabase
      .from('access_attempts')
      .insert({
        id: attempt.id,
        ip_address: clientIP,
        timestamp: attempt.timestamp,
        success: attempt.success,
        method: attempt.method,
        failure_reason: attempt.failureReason,
        user_agent: attempt.userAgent || req.headers.get('user-agent') || 'unknown',
        geolocation: geolocation,
        headers: {
          'user-agent': req.headers.get('user-agent'),
          'accept-language': req.headers.get('accept-language'),
          'accept-encoding': req.headers.get('accept-encoding'),
        }
      });

    if (error) {
      console.error('Failed to log access attempt:', error);
    }

    // Log security events for monitoring
    const logLevel = attempt.success ? 'INFO' : 'WARN';
    const message = `${attempt.method.toUpperCase()} attempt from ${clientIP}: ${
      attempt.success ? 'SUCCESS' : `FAILED (${attempt.failureReason || 'Unknown reason'})`
    }`;
    
    console.log(`[${logLevel}] ${message}`);

    // Check for suspicious patterns (multiple failures from same IP)
    if (!attempt.success) {
      const { data: recentAttempts } = await supabase
        .from('access_attempts')
        .select('*')
        .eq('ip_address', clientIP)
        .eq('success', false)
        .gte('timestamp', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
        .order('timestamp', { ascending: false });

      if (recentAttempts && recentAttempts.length >= 3) {
        console.log(`[ALERT] Multiple failed attempts from ${clientIP}: ${recentAttempts.length} failures in 15 minutes`);
        
        // Could trigger additional security measures here:
        // - Send alert to security team
        // - Automatically block IP
        // - Trigger CAPTCHA requirement
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Access attempt logged successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in log-access-attempt:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to log access attempt' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});