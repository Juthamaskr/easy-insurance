import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import { ArrowLeft, TrendingUp, Users, FileText, BarChart3 } from 'lucide-react';
import { getInsuranceTypeLabel } from '@/lib/utils';

export const metadata = {
  title: 'Analytics - Admin | Easy Insurance',
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin/analytics');
  }

  // Fetch statistics
  const [
    totalPlans,
    activePlans,
    totalLeads,
    totalComparisons,
    leadsByStatus,
    plansByType,
    comparisonsData,
  ] = await Promise.all([
    supabase.from('insurance_plans').select('*', { count: 'exact', head: true }),
    supabase.from('insurance_plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('comparison_history').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('status'),
    supabase.from('insurance_plans').select('type'),
    supabase.from('comparison_history').select('insurance_type'),
  ]);

  // Calculate lead status distribution
  const leadStatusCounts = (leadsByStatus.data || []).reduce((acc: Record<string, number>, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  // Calculate plan type distribution
  const planTypeCounts = (plansByType.data || []).reduce((acc: Record<string, number>, plan: any) => {
    acc[plan.type] = (acc[plan.type] || 0) + 1;
    return acc;
  }, {});

  // Calculate comparison type distribution
  const comparisonTypeCounts = (comparisonsData.data || []).reduce((acc: Record<string, number>, comp: any) => {
    acc[comp.insurance_type] = (acc[comp.insurance_type] || 0) + 1;
    return acc;
  }, {});

  const statusLabels: Record<string, string> = {
    new: 'ใหม่',
    contacted: 'ติดต่อแล้ว',
    converted: 'ปิดการขาย',
    closed: 'ปิด',
  };

  const statusColors: Record<string, string> = {
    new: 'bg-green-500',
    contacted: 'bg-blue-500',
    converted: 'bg-purple-500',
    closed: 'bg-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับ Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-purple-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">ภาพรวมสถิติการใช้งานระบบ</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="bordered">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPlans.count || 0}</p>
                <p className="text-sm text-gray-500">แผนทั้งหมด</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activePlans.count || 0}</p>
                <p className="text-sm text-gray-500">แผนที่เปิดใช้</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalLeads.count || 0}</p>
                <p className="text-sm text-gray-500">Leads ทั้งหมด</p>
              </div>
            </div>
          </Card>
          <Card variant="bordered">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalComparisons.count || 0}</p>
                <p className="text-sm text-gray-500">การเปรียบเทียบ</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lead Status Distribution */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะ Leads</h3>
            <div className="space-y-3">
              {Object.entries(leadStatusCounts).length > 0 ? (
                Object.entries(leadStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                      <span className="text-gray-700">{statusLabels[status] || status}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{count as number}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </Card>

          {/* Plans by Type */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">แผนประกันตามประเภท</h3>
            <div className="space-y-3">
              {Object.entries(planTypeCounts).length > 0 ? (
                Object.entries(planTypeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700">{getInsuranceTypeLabel(type)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{
                            width: `${((count as number) / (totalPlans.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </Card>

          {/* Comparisons by Type */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">การเปรียบเทียบตามประเภท</h3>
            <div className="space-y-3">
              {Object.entries(comparisonTypeCounts).length > 0 ? (
                Object.entries(comparisonTypeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700">{getInsuranceTypeLabel(type)}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${((count as number) / (totalComparisons.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มีข้อมูล</p>
              )}
            </div>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card variant="bordered" className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราการแปลง</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-600">
                {totalComparisons.count && totalLeads.count
                  ? ((totalLeads.count / totalComparisons.count) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">การเปรียบเทียบ → Lead</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {totalLeads.count && leadStatusCounts.converted
                  ? ((leadStatusCounts.converted / totalLeads.count) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Lead → ปิดการขาย</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {totalLeads.count && leadStatusCounts.contacted
                  ? ((leadStatusCounts.contacted / totalLeads.count) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Lead ที่ติดต่อแล้ว</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
