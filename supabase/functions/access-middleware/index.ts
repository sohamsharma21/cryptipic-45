import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token',
};

interface AccessCheckRequest {
  sessionToken?: string;
  path?: string;
  method?: string;
  requiredRole?: string;
  requiredClearance?: string;
}

const PROTECTED_PATHS = [
  '/hide',
  '/reveal', 
  '/metadata',
  '/defense',
  '/settings',
  '/dashboard'
];

const ROLE_HIERARCHY = {
  'viewer': 1,
  'operator': 2,
  'supervisor': 3,
  'admin': 4
};

const CLEARANCE_LEVELS = {
  'UNCLASSIFIED': 1,
  'CUI': 2,
  'CONFIDENTIAL': 3,
  'SECRET': 4,
  'TOP_SECRET': 5
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sessionToken, 
      path = '/', 
      method = 'GET',
      requiredRole,
      requiredClearance 
    }: AccessCheckRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if path requires protection
    const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
      path.startsWith(protectedPath)
    );

    if (!isProtectedPath && !requiredRole && !requiredClearance) {
      // Public path, no authentication required
      return new Response(
        JSON.stringify({ 
          authorized: true,
          reason: 'Public path'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ 
          authorized: false,
          reason: 'No session token provided',
          requiresAuth: true
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate session
    const { data: session, error } = await supabase
      .from('access_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      return new Response(
        JSON.stringify({ 
          authorized: false,
          reason: 'Invalid session token',
          requiresAuth: true
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check session expiration
    if (new Date(session.expires_at) <= new Date()) {
      // Clean up expired session
      await supabase
        .from('access_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return new Response(
        JSON.stringify({ 
          authorized: false,
          reason: 'Session expired',
          requiresAuth: true
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update last accessed time
    await supabase
      .from('access_sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('session_token', sessionToken);

    // Check role-based access if required
    if (requiredRole && session.user_role) {
      const userRoleLevel = ROLE_HIERARCHY[session.user_role as keyof typeof ROLE_HIERARCHY] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 999;
      
      if (userRoleLevel < requiredRoleLevel) {
        return new Response(
          JSON.stringify({ 
            authorized: false,
            reason: `Insufficient role. Required: ${requiredRole}, Current: ${session.user_role}`,
            requiresRole: requiredRole
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Check clearance level if required
    if (requiredClearance && session.clearance_level) {
      const userClearanceLevel = CLEARANCE_LEVELS[session.clearance_level as keyof typeof CLEARANCE_LEVELS] || 0;
      const requiredClearanceLevel = CLEARANCE_LEVELS[requiredClearance as keyof typeof CLEARANCE_LEVELS] || 999;
      
      if (userClearanceLevel < requiredClearanceLevel) {
        return new Response(
          JSON.stringify({ 
            authorized: false,
            reason: `Insufficient clearance. Required: ${requiredClearance}, Current: ${session.clearance_level}`,
            requiresClearance: requiredClearance
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        authorized: true,
        session: {
          userId: session.user_id,
          role: session.user_role,
          clearance: session.clearance_level,
          expiresAt: session.expires_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in access-middleware:', error);
    return new Response(
      JSON.stringify({ 
        authorized: false,
        error: error.message || 'Access check failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});