'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, useToast } from '@/components/ui';
import { ArrowLeft, Bell, Phone, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Reminder {
  id: string;
  name: string;
  phone: string;
  plan_name: string;
  follow_up_date: string;
  status: string;
  notes: string;
  isOverdue: boolean;
  isToday: boolean;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const { showToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          plan:insurance_plans(name)
        `)
        .not('follow_up_date', 'is', null)
        .order('follow_up_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formattedReminders: Reminder[] = (data || []).map((lead) => {
        const followUpDate = new Date(lead.follow_up_date);
        followUpDate.setHours(0, 0, 0, 0);

        return {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          plan_name: lead.plan?.name || 'ไม่ระบุ',
          follow_up_date: lead.follow_up_date,
          status: lead.status,
          notes: lead.notes || '',
          isOverdue: followUpDate < today && lead.status !== 'converted' && lead.status !== 'closed',
          isToday: followUpDate.getTime() === today.getTime(),
        };
      });

      setReminders(formattedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูลได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'today') return reminder.isToday;
    if (filter === 'overdue') return reminder.isOverdue;
    if (filter === 'upcoming') return !reminder.isOverdue && !reminder.isToday;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const overdueCount = reminders.filter(r => r.isOverdue).length;
  const todayCount = reminders.filter(r => r.isToday).length;
  const upcomingCount = reminders.filter(r => !r.isOverdue && !r.isToday).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Bell size={28} className="text-cyan-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แจ้งเตือนติดตาม</h1>
              <p className="text-gray-600">รายการลูกค้าที่ต้องติดตาม</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card
            variant="bordered"
            className={`cursor-pointer transition-all ${filter === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setFilter('overdue')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                <p className="text-sm text-gray-500">เลยกำหนด</p>
              </div>
            </div>
          </Card>

          <Card
            variant="bordered"
            className={`cursor-pointer transition-all ${filter === 'today' ? 'ring-2 ring-yellow-500' : ''}`}
            onClick={() => setFilter('today')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{todayCount}</p>
                <p className="text-sm text-gray-500">วันนี้</p>
              </div>
            </div>
          </Card>

          <Card
            variant="bordered"
            className={`cursor-pointer transition-all ${filter === 'upcoming' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{upcomingCount}</p>
                <p className="text-sm text-gray-500">กำลังจะถึง</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            ทั้งหมด ({reminders.length})
          </Button>
          <Button
            variant={filter === 'overdue' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('overdue')}
          >
            เลยกำหนด ({overdueCount})
          </Button>
          <Button
            variant={filter === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('today')}
          >
            วันนี้ ({todayCount})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            กำลังจะถึง ({upcomingCount})
          </Button>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {filteredReminders.map((reminder) => (
            <Card
              key={reminder.id}
              variant="bordered"
              className={`${
                reminder.isOverdue
                  ? 'border-red-200 bg-red-50'
                  : reminder.isToday
                  ? 'border-yellow-200 bg-yellow-50'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{reminder.name}</h3>
                    {reminder.isOverdue && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                        เลยกำหนด
                      </span>
                    )}
                    {reminder.isToday && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        วันนี้
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyan-600 mb-2">{reminder.plan_name}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Phone size={14} className="mr-1" />
                      {reminder.phone}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(reminder.follow_up_date)}
                    </span>
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded">
                      {reminder.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => callCustomer(reminder.phone)}
                  >
                    <Phone size={14} className="mr-1" />
                    โทรหา
                  </Button>
                  <Link href={`/admin/leads?id=${reminder.id}`}>
                    <Button size="sm">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          {filteredReminders.length === 0 && (
            <Card variant="bordered" className="text-center py-12">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all'
                  ? 'ยังไม่มีรายการติดตาม'
                  : 'ไม่มีรายการในหมวดนี้'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
