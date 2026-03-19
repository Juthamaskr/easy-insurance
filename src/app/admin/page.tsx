import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import { FileText, Users, BarChart3, Settings, UserCog } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

export const metadata = {
  title: 'Admin Dashboard - Easy Insurance',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Fetch real statistics
  const [plansCount, leadsCount, comparisonsCount, usersCount, recentLeads] = await Promise.all([
    supabase.from('insurance_plans').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('comparison_history').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('leads')
      .select('*, plan:insurance_plans(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Count today's leads
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const stats = [
    {
      icon: FileText,
      label: 'แผนประกันทั้งหมด',
      value: String(plansCount.count || 0),
      change: 'active',
      href: '/admin/plans',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      label: 'Leads ทั้งหมด',
      value: String(leadsCount.count || 0),
      change: `+${todayLeads || 0} วันนี้`,
      href: '/admin/leads',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: BarChart3,
      label: 'การเปรียบเทียบ',
      value: String(comparisonsCount.count || 0),
      change: 'total',
      href: '/admin/analytics',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: UserCog,
      label: 'ผู้ใช้งาน',
      value: String(usersCount.count || 0),
      change: 'คน',
      href: '/admin/users',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">จัดการแผนประกันและดูข้อมูลลูกค้า</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card variant="bordered" className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={28} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <Card variant="bordered">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Leads ล่าสุด</h2>
              <Link href="/admin/leads" className="text-sm text-cyan-600 hover:text-cyan-700">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="space-y-3">
              {recentLeads.data && recentLeads.data.length > 0 ? (
                recentLeads.data.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.plan?.name || 'ไม่ระบุแผน'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        lead.status === 'new' ? 'bg-green-100 text-green-700' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'converted' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.status === 'new' ? 'ใหม่' :
                         lead.status === 'contacted' ? 'ติดต่อแล้ว' :
                         lead.status === 'converted' ? 'ปิดการขาย' : 'ปิด'}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(lead.created_at))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">ยังไม่มี lead</p>
              )}
            </div>
          </Card>

          {/* Quick Links */}
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">จัดการระบบ</h2>
            <div className="space-y-2">
              <Link
                href="/admin/plans"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">จัดการแผนประกัน</p>
                  <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบ แผนประกัน</p>
                </div>
              </Link>
              <Link
                href="/admin/leads"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">จัดการ Leads</p>
                  <p className="text-sm text-gray-500">ดูรายชื่อลูกค้าที่สนใจ</p>
                </div>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserCog size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">จัดการผู้ใช้งาน</p>
                  <p className="text-sm text-gray-500">กำหนดสิทธิ์ Admin, Agent, Customer</p>
                </div>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">ตั้งค่าระบบ</p>
                  <p className="text-sm text-gray-500">ตั้งค่าบัญชีและการแจ้งเตือน</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
