import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvalidateSessionRequest {
  sessionToken: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken }: InvalidateSessionRequest = await req.json();
    
    if (!sessionToken) {
      throw new Error('Session token is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Delete the session
    const { error } = await supabase
      .from('access_sessions')
      .delete()
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Failed to invalidate session:', error);
      throw new Error('Failed to invalidate session');
    }

    console.log(`Session invalidated: ${sessionToken}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Session invalidated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in invalidate-session:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Session invalidation failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});