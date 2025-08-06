import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth callback handler for Google and GitHub authentication
 * This route handles the redirect from OAuth providers
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(
        errorDescription || error
      )}`
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=authentication_failed`
        );
      }

      if (data.user) {
        // Check if this is a new user (first time OAuth login)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // User doesn't exist, create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || 
                        data.user.user_metadata?.name || 
                        data.user.email?.split('@')[0] || 
                        'New User',
              avatar_url: data.user.user_metadata?.avatar_url || 
                         data.user.user_metadata?.picture,
              language: 'en',
              timezone: 'Asia/Hong_Kong',
              email_verified: true, // OAuth emails are pre-verified
            });

          if (insertError) {
            console.error('Profile creation error:', insertError);
          }

          // Assign default role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'member',
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
          }

          // Log new user registration
          await supabase.from('security_events').insert({
            event_type: 'oauth_registration',
            severity: 'low',
            user_id: data.user.id,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
            details: {
              provider: data.user.app_metadata?.provider,
              email: data.user.email,
              timestamp: new Date().toISOString(),
            },
          });
        }

        // Log successful OAuth login
        await supabase.from('security_events').insert({
          event_type: 'oauth_login_success',
          severity: 'low',
          user_id: data.user.id,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          details: {
            provider: data.user.app_metadata?.provider,
            email: data.user.email,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Redirect to dashboard or return URL
      const returnUrl = requestUrl.searchParams.get('returnTo') || '/dashboard';
      return NextResponse.redirect(`${requestUrl.origin}${returnUrl}`);
    } catch (error) {
      console.error('Callback processing error:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=callback_processing_failed`
      );
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}