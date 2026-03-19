import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, Button } from '@/components/ui';
import { Heart, History, Settings, Search } from 'lucide-react';
import { formatPrice, getInsuranceTypeLabel } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard - Easy Insurance',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch saved plans count
  const { count: savedCount } = await supabase
    .from('saved_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch comparison history count
  const { count: historyCount } = await supabase
    .from('comparison_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch recent saved plans
  const { data: recentSaved } = await supabase
    .from('saved_plans')
    .select(`
      *,
      plan:insurance_plans(name, type, company:insurance_companies(name))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const stats = [
    {
      icon: Heart,
      label: 'แผนที่บันทึกไว้',
      value: String(savedCount || 0),
      href: '/dashboard/saved',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: History,
      label: 'ประวัติการเปรียบเทียบ',
      value: String(historyCount || 0),
      href: '/dashboard/history',
      color: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            สวัสดี, {user.user_metadata?.full_name || user.email}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link href="/compare">
            <Button size="lg">
              <Search size={20} className="mr-2" />
              เปรียบเทียบประกันใหม่
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card variant="bordered" className="hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Settings */}
          <Link href="/dashboard/settings">
            <Card variant="bordered" className="hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">ตั้งค่า</p>
                  <p className="text-sm text-gray-600">จัดการบัญชีของคุณ</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Saved Plans */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">แผนที่บันทึกล่าสุด</h2>
          <div className="space-y-4">
            {recentSaved && recentSaved.length > 0 ? (
              <>
                {recentSaved.map((saved: any) => (
                  <div key={saved.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Heart size={18} className="text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{saved.plan?.name}</p>
                        <p className="text-sm text-gray-500">
                          {getInsuranceTypeLabel(saved.plan?.type || 'health')} • {saved.plan?.company?.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(saved.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
                <div className="text-center py-4">
                  <Link href="/dashboard/saved" className="text-cyan-600 hover:text-cyan-700 text-sm">
                    ดูทั้งหมด →
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Heart size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm mb-3">ยังไม่มีแผนที่บันทึก</p>
                <Link href="/compare">
                  <Button variant="outline" size="sm">เริ่มเปรียบเทียบ</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
