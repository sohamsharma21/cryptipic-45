import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetAuditLogsRequest {
  sessionToken?: string;
  limit?: number;
  offset?: number;
  ipAddress?: string;
  dateFrom?: string;
  dateTo?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken, limit = 100, offset = 0, ipAddress, dateFrom, dateTo }: GetAuditLogsRequest = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify session if provided (for admin access)
    if (sessionToken) {
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
    }

    // Build query
    let query = supabase
      .from('access_attempts')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (ipAddress) {
      query = query.eq('ip_address', ipAddress);
    }
    if (dateFrom) {
      query = query.gte('timestamp', dateFrom);
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        logs: logs || [],
        count: logs?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-audit-logs:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to retrieve audit logs',
        logs: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});