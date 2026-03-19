import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, Button } from '@/components/ui';
import { CompareTable } from '@/components/compare';
import { getInsuranceTypeLabel } from '@/lib/utils';
import { ArrowLeft, Share2 } from 'lucide-react';

interface SharePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { code } = await params;
  return {
    title: `เปรียบเทียบประกัน - ${code} | Easy Insurance`,
    description: 'ดูผลการเปรียบเทียบแผนประกันที่ถูกแชร์มา',
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Fetch comparison from database
  const { data: comparison, error } = await supabase
    .from('comparison_history')
    .select('*')
    .eq('share_code', code)
    .single();

  if (error || !comparison) {
    notFound();
  }

  // Fetch plans from the comparison
  const { data: plans } = await supabase
    .from('insurance_plans')
    .select('*, company:insurance_companies(*)')
    .in('id', comparison.plan_ids);

  if (!plans || plans.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/compare"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            เปรียบเทียบประกันใหม่
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Share2 size={20} className="text-cyan-600" />
                <span className="text-sm text-cyan-600 font-medium">ลิงก์ที่แชร์มา</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                เปรียบเทียบ{getInsuranceTypeLabel(comparison.insurance_type)}
              </h1>
              <p className="text-gray-600">
                {plans.length} แผนประกัน • สร้างเมื่อ{' '}
                {new Date(comparison.created_at).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <Link href={`/compare/${comparison.insurance_type}`}>
              <Button>เปรียบเทียบด้วยตัวเอง</Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <Card variant="bordered" className="overflow-x-auto">
          <CompareTable
            plans={plans}
            insuranceType={comparison.insurance_type}
          />
        </Card>

        {/* CTA */}
        <Card variant="bordered" className="mt-8 text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            สนใจแผนประกันเหล่านี้?
          </h3>
          <p className="text-gray-600 mb-4">
            เริ่มต้นเปรียบเทียบประกันของคุณเอง หรือติดต่อตัวแทนเพื่อรับข้อมูลเพิ่มเติม
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/compare">
              <Button>เริ่มเปรียบเทียบ</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">สมัครสมาชิก</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
