import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import { ArrowLeft, TrendingUp, Users, FileText, BarChart3, DollarSign } from 'lucide-react';
import { getInsuranceTypeLabel } from '@/lib/utils';
import {
  LeadStatusChart,
  PlanTypeChart,
  MonthlyTrendChart,
  CommissionChart,
  ConversionFunnel,
} from '@/components/AnalyticsCharts';

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
    leadsData,
    comparisonsData,
  ] = await Promise.all([
    supabase.from('insurance_plans').select('*', { count: 'exact', head: true }),
    supabase.from('insurance_plans').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('comparison_history').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('status'),
    supabase.from('insurance_plans').select('type'),
    supabase.from('leads').select('created_at, status, commission_amount'),
    supabase.from('comparison_history').select('created_at, insurance_type'),
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

  const statusLabels: Record<string, string> = {
    new: 'ใหม่',
    contacted: 'ติดต่อแล้ว',
    quoted: 'ส่งใบเสนอราคา',
    converted: 'ปิดการขาย',
    closed: 'ปิด',
  };

  const statusColors: Record<string, string> = {
    new: '#3B82F6',
    contacted: '#F59E0B',
    quoted: '#F97316',
    converted: '#10B981',
    closed: '#6B7280',
  };

  // Prepare chart data
  const leadStatusChartData = Object.entries(leadStatusCounts).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count as number,
    color: statusColors[status] || '#6B7280',
  }));

  const planTypeChartData = Object.entries(planTypeCounts).map(([type, count]) => ({
    name: getInsuranceTypeLabel(type),
    count: count as number,
  }));

  // Calculate monthly trends (last 6 months)
  const now = new Date();
  const monthlyData: Record<string, { leads: number; comparisons: number; commission: number }> = {};

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
    monthlyData[monthKey] = { leads: 0, comparisons: 0, commission: 0 };
  }

  // Count leads per month
  (leadsData.data || []).forEach((lead: any) => {
    const date = new Date(lead.created_at);
    const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].leads++;
      if (lead.status === 'converted' && lead.commission_amount) {
        monthlyData[monthKey].commission += lead.commission_amount;
      }
    }
  });

  // Count comparisons per month
  (comparisonsData.data || []).forEach((comp: any) => {
    const date = new Date(comp.created_at);
    const monthKey = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].comparisons++;
    }
  });

  const monthlyTrendData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    leads: data.leads,
    comparisons: data.comparisons,
  }));

  const commissionData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    amount: data.commission,
  }));

  // Calculate total commission
  const totalCommission = (leadsData.data || [])
    .filter((lead: any) => lead.status === 'converted')
    .reduce((sum: number, lead: any) => sum + (lead.commission_amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
          <Card variant="bordered">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCommission)}</p>
                <p className="text-sm text-gray-500">Commission รวม</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Lead Status Pie Chart */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะ Leads</h3>
            <LeadStatusChart data={leadStatusChartData} />
          </Card>

          {/* Plans by Type Bar Chart */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">แผนประกันตามประเภท</h3>
            <PlanTypeChart data={planTypeChartData} />
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trend Line Chart */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวโน้มรายเดือน (6 เดือนล่าสุด)</h3>
            <MonthlyTrendChart data={monthlyTrendData} />
          </Card>

          {/* Commission Bar Chart */}
          <Card variant="bordered">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission รายเดือน</h3>
            <CommissionChart data={commissionData} />
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card variant="bordered" className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <ConversionFunnel
            comparisons={totalComparisons.count || 0}
            leads={totalLeads.count || 0}
            converted={leadStatusCounts.converted || 0}
          />
        </Card>

        {/* Conversion Rates */}
        <Card variant="bordered">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัตราการแปลง</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-3xl font-bold text-cyan-600">
                {totalComparisons.count && totalLeads.count
                  ? ((totalLeads.count / totalComparisons.count) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">การเปรียบเทียบ → Lead</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {totalLeads.count && leadStatusCounts.converted
                  ? ((leadStatusCounts.converted / totalLeads.count) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Lead → ปิดการขาย</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {totalLeads.count && (leadStatusCounts.contacted || 0) + (leadStatusCounts.quoted || 0)
                  ? (((leadStatusCounts.contacted || 0) + (leadStatusCounts.quoted || 0)) / totalLeads.count * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Lead ที่ติดต่อแล้ว</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
