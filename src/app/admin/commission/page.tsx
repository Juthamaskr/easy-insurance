'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, useToast } from '@/components/ui';
import { ArrowLeft, DollarSign, TrendingUp, Users, Calculator } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CommissionData {
  totalCommission: number;
  monthlyCommission: number;
  convertedLeads: number;
  pendingLeads: number;
  commissionByType: {
    type: string;
    amount: number;
    count: number;
  }[];
  recentCommissions: {
    id: string;
    name: string;
    planName: string;
    commission: number;
    date: string;
  }[];
}

export default function CommissionPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CommissionData>({
    totalCommission: 0,
    monthlyCommission: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    commissionByType: [],
    recentCommissions: [],
  });
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const fetchCommissionData = async () => {
    try {
      // Fetch converted leads with plan info
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          plan:insurance_plans(name, type, premium_yearly, commission_rate)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedLeads = leads?.filter(l => l.status === 'converted') || [];
      const pendingLeads = leads?.filter(l => l.status !== 'converted' && l.status !== 'closed') || [];

      // Calculate commissions
      let totalCommission = 0;
      let monthlyCommission = 0;
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const commissionByTypeMap: Record<string, { amount: number; count: number }> = {};

      const recentCommissions = convertedLeads.slice(0, 10).map(lead => {
        const premium = lead.plan?.premium_yearly || 0;
        const rate = lead.plan?.commission_rate || 0;
        const commission = (premium * rate) / 100;
        const leadDate = new Date(lead.created_at);

        totalCommission += commission;

        if (leadDate.getMonth() === thisMonth && leadDate.getFullYear() === thisYear) {
          monthlyCommission += commission;
        }

        const type = lead.plan?.type || 'other';
        if (!commissionByTypeMap[type]) {
          commissionByTypeMap[type] = { amount: 0, count: 0 };
        }
        commissionByTypeMap[type].amount += commission;
        commissionByTypeMap[type].count += 1;

        return {
          id: lead.id,
          name: lead.name,
          planName: lead.plan?.name || 'ไม่ระบุ',
          commission,
          date: new Date(lead.created_at).toLocaleDateString('th-TH'),
        };
      });

      const commissionByType = Object.entries(commissionByTypeMap).map(([type, data]) => ({
        type,
        amount: data.amount,
        count: data.count,
      }));

      setData({
        totalCommission,
        monthlyCommission,
        convertedLeads: convertedLeads.length,
        pendingLeads: pendingLeads.length,
        commissionByType,
        recentCommissions,
      });
    } catch (error) {
      console.error('Error fetching commission data:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูลค่าคอมมิชชั่นได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const typeLabels: Record<string, string> = {
    health: 'สุขภาพ',
    life: 'ชีวิต',
    car: 'รถยนต์',
    other: 'อื่นๆ',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Commission Tracker</h1>
          <p className="text-gray-600">ติดตามค่าคอมมิชชั่นของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ค่าคอมทั้งหมด</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.totalCommission)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ค่าคอมเดือนนี้</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {formatCurrency(data.monthlyCommission)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-cyan-600" />
              </div>
            </div>
          </Card>

          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ปิดการขายแล้ว</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.convertedLeads} ราย
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>

          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">รอติดตาม</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.pendingLeads} ราย
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Calculator size={24} className="text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commission by Type */}
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ค่าคอมตามประเภทประกัน</h2>
            {data.commissionByType.length > 0 ? (
              <div className="space-y-4">
                {data.commissionByType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.type === 'health' ? 'bg-blue-500' :
                        item.type === 'life' ? 'bg-green-500' :
                        item.type === 'car' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-gray-700">{typeLabels[item.type] || item.type}</span>
                      <span className="text-sm text-gray-500">({item.count} ราย)</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลค่าคอมมิชชั่น</p>
            )}
          </Card>

          {/* Recent Commissions */}
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ค่าคอมล่าสุด</h2>
            {data.recentCommissions.length > 0 ? (
              <div className="space-y-3">
                {data.recentCommissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.commission)}
                      </p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">ยังไม่มีการปิดการขาย</p>
            )}
          </Card>
        </div>

        {/* Commission Rates Info */}
        <Card variant="bordered" className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">อัตราค่าคอมมิชชั่น</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600 mb-1">ประกันสุขภาพ</p>
              <p className="text-2xl font-bold text-blue-700">15%</p>
              <p className="text-xs text-blue-500">ของเบี้ยประกันรายปี</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600 mb-1">ประกันชีวิต</p>
              <p className="text-2xl font-bold text-green-700">25%</p>
              <p className="text-xs text-green-500">ของเบี้ยประกันรายปี</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-yellow-600 mb-1">ประกันรถยนต์</p>
              <p className="text-2xl font-bold text-yellow-700">10%</p>
              <p className="text-xs text-yellow-500">ของเบี้ยประกันรายปี</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
