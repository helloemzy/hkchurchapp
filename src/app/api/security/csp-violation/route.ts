import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const violation = await request.json();
    const supabase = createAdminClient();

    // Log CSP violation as security event
    const { error } = await supabase.from('security_events').insert({
      event_type: 'csp_violation',
      severity: 'medium',
      user_id: null, // CSP violations don't have user context
      ip_address: headersList.get('x-forwarded-for') || 
                  headersList.get('x-real-ip') || 
                  'unknown',
      user_agent: headersList.get('user-agent') || 'unknown',
      details: {
        blocked_uri: violation['blocked-uri'],
        document_uri: violation['document-uri'],
        original_policy: violation['original-policy'],
        referrer: violation.referrer,
        violated_directive: violation['violated-directive'],
        line_number: violation['line-number'],
        column_number: violation['column-number'],
        source_file: violation['source-file'],
        timestamp: new Date().toISOString(),
      },
    });

    if (error) {
      console.error('Error logging CSP violation:', error);
    }

    // Check for suspicious patterns that might indicate an attack
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /eval\(/i,
      /document\.write/i,
    ];

    const blockedUri = violation['blocked-uri'] || '';
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(blockedUri)
    );

    if (isSuspicious) {
      // Log as high severity security event
      await supabase.from('security_events').insert({
        event_type: 'suspicious_csp_violation',
        severity: 'high',
        user_id: null,
        ip_address: headersList.get('x-forwarded-for') || 'unknown',
        user_agent: headersList.get('user-agent') || 'unknown',
        details: {
          ...violation,
          reason: 'Suspicious pattern detected in blocked URI',
          patterns_matched: suspiciousPatterns
            .filter(pattern => pattern.test(blockedUri))
            .map(pattern => pattern.source),
        },
      });

      // In production, this could trigger additional security measures
      // like temporary IP blocking or alerting security team
    }

    return NextResponse.json({ status: 'logged' }, { status: 200 });
  } catch (error) {
    console.error('CSP violation processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}