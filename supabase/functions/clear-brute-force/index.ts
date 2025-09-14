import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClearBruteForceRequest {
  sessionToken: string;
  ipAddress?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, ipAddress }: ClearBruteForceRequest = await req.json();
    
    if (!sessionToken) {
      throw new Error('Session token is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin session
    const { data: session } = await supabase
      .from('access_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (!session || new Date(session.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (ipAddress) {
      // Clear brute force state for specific IP
      const { error } = await supabase
        .from('brute_force_protection')
        .delete()
        .eq('ip_address', ipAddress);

      if (error) throw error;

      console.log(`Brute force protection cleared for IP: ${ipAddress}`);
    } else {
      // Clear all brute force states (admin action)
      const { error } = await supabase
        .from('brute_force_protection')
        .delete()
        .neq('ip_address', ''); // Delete all records

      if (error) throw error;

      console.log('All brute force protection states cleared');
    }

    // Log the admin action
    await supabase
      .from('access_attempts')
      .insert({
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
        success: true,
        method: 'admin',
        user_agent: req.headers.get('user-agent') || 'unknown',
        failure_reason: `Brute force cleared${ipAddress ? ` for ${ipAddress}` : ' (all)'}`
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: ipAddress 
          ? `Brute force protection cleared for ${ipAddress}` 
          : 'All brute force protection cleared'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in clear-brute-force:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to clear brute force protection'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});