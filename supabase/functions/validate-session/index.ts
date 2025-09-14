import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateSessionRequest {
  sessionToken: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken }: ValidateSessionRequest = await req.json();
    
    if (!sessionToken) {
      throw new Error('Session token is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if session exists and is valid
    const { data: session, error } = await supabase
      .from('access_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      console.log('Session not found:', sessionToken);
      return new Response(
        JSON.stringify({ valid: false, message: 'Session not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Check if session has expired
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      // Clean up expired session
      await supabase
        .from('access_sessions')
        .delete()
        .eq('session_token', sessionToken);

      console.log('Session expired:', sessionToken);
      return new Response(
        JSON.stringify({ valid: false, message: 'Session expired' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Update last accessed time
    await supabase
      .from('access_sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('session_token', sessionToken);

    console.log('Session validated successfully:', sessionToken);

    return new Response(
      JSON.stringify({ 
        valid: true,
        session: {
          token: session.session_token,
          createdAt: session.created_at,
          expiresAt: session.expires_at,
          lastAccessed: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in validate-session:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message || 'Session validation failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});