import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint can be called by Supabase Database Webhooks
// when a new lead is inserted into the leads table

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Supabase webhook payload structure
    const { type, table, record } = body;

    // Verify it's an INSERT on leads table
    if (type !== 'INSERT' || table !== 'leads') {
      return NextResponse.json({ message: 'Ignored' }, { status: 200 });
    }

    const lead = record;

    // Log the new lead (for debugging)
    console.log('New lead received:', {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      plan_id: lead.plan_id,
      created_at: lead.created_at,
    });

    // TODO: Integrate with email service
    // Options (all have free tiers):
    // 1. Resend (recommended) - 100 emails/day free
    // 2. SendGrid - 100 emails/day free
    // 3. Mailgun - 5,000 emails/month free for 3 months
    // 4. AWS SES - 62,000 emails/month free (if using AWS)

    // Example with Resend (uncomment when ready):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Fetch plan details
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: plan } = await supabase
      .from('insurance_plans')
      .select('name, company:insurance_companies(name)')
      .eq('id', lead.plan_id)
      .single();

    await resend.emails.send({
      from: 'Easy Insurance <noreply@your-domain.com>',
      to: [process.env.ADMIN_EMAIL!],
      subject: `🔔 Lead ใหม่: ${lead.name} สนใจ ${plan?.name}`,
      html: `
        <h2>มี Lead ใหม่!</h2>
        <p><strong>ชื่อ:</strong> ${lead.name}</p>
        <p><strong>เบอร์โทร:</strong> ${lead.phone}</p>
        <p><strong>แผนที่สนใจ:</strong> ${plan?.name} (${plan?.company?.name})</p>
        <p><strong>ข้อความ:</strong> ${lead.message || '-'}</p>
        <p><strong>เวลา:</strong> ${new Date(lead.created_at).toLocaleString('th-TH')}</p>
        <hr>
        <p>ระบบ Easy Insurance</p>
      `,
    });
    */

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Lead notification processed',
      lead_id: lead.id,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'new-lead webhook',
    description: 'Configure Supabase Database Webhook to call this endpoint on INSERT to leads table',
  });
}
