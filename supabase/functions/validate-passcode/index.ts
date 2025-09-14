import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidatePasscodeRequest {
  passcode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { passcode }: ValidatePasscodeRequest = await req.json();
    
    if (!passcode) {
      throw new Error('Passcode is required');
    }

    // Get the stored passcode from environment
    const storedPasscode = Deno.env.get('CRYPTIPIC_ACCESS_PASSCODE');
    
    if (!storedPasscode) {
      console.error('CRYPTIPIC_ACCESS_PASSCODE environment variable not set');
      throw new Error('Server configuration error');
    }

    // Simple comparison for now - in production, this should use secure comparison
    // and potentially hash comparison
    const isValid = passcode === storedPasscode;
    
    let sessionToken = '';
    if (isValid) {
      // Generate a secure session token
      sessionToken = crypto.randomUUID() + '-' + Date.now();
      
      // Store session in Supabase (you could also use a separate sessions table)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Store session data (this could be in a dedicated sessions table)
      await supabase
        .from('access_sessions')
        .insert({
          session_token: sessionToken,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        });
    }

    // Log the attempt
    console.log(`Passcode validation attempt: ${isValid ? 'SUCCESS' : 'FAILED'} from ${req.headers.get('x-forwarded-for') || 'unknown'}`);

    return new Response(
      JSON.stringify({ 
        valid: isValid,
        sessionToken: isValid ? sessionToken : undefined,
        message: isValid ? 'Access granted' : 'Invalid passcode'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isValid ? 200 : 401
      }
    );

  } catch (error) {
    console.error('Error in validate-passcode:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message || 'Authentication failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});