import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtendSessionRequest {
  sessionToken: string;
  extensionHours?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, extensionHours = 12 }: ExtendSessionRequest = await req.json();
    
    if (!sessionToken) {
      throw new Error('Session token is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First validate the session exists and is not expired
    const { data: session, error: fetchError } = await supabase
      .from('access_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (fetchError || !session) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Session not found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Check if session has already expired
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      // Clean up expired session
      await supabase
        .from('access_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Session has expired and cannot be extended' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Extend the session
    const newExpiresAt = new Date(Date.now() + extensionHours * 60 * 60 * 1000);
    
    const { error: updateError } = await supabase
      .from('access_sessions')
      .update({ 
        expires_at: newExpiresAt.toISOString(),
        last_accessed: new Date().toISOString()
      })
      .eq('session_token', sessionToken);

    if (updateError) {
      throw new Error('Failed to extend session');
    }

    console.log(`Session extended: ${sessionToken} until ${newExpiresAt.toISOString()}`);

    return new Response(
      JSON.stringify({ 
        valid: true,
        message: 'Session extended successfully',
        newExpiresAt: newExpiresAt.toISOString(),
        extensionHours
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in extend-session:', error);
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message || 'Session extension failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});