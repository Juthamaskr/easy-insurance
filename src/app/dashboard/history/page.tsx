'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Skeleton, useToast } from '@/components/ui';
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Trash2,
  Heart,
  Car,
  Shield,
  Clock,
  Copy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ComparisonHistory, InsuranceType } from '@/types';

const typeLabels: Record<InsuranceType, { name: string; icon: typeof Heart }> = {
  health: { name: 'ประกันสุขภาพ', icon: Heart },
  life: { name: 'ประกันชีวิต', icon: Shield },
  car: { name: 'ประกันรถยนต์', icon: Car },
};

type HistoryItem = ComparisonHistory & {
  plan_names?: string[];
};

export default function DashboardHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const supabase = createClient();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/dashboard/history');
        return;
      }

      const { data, error } = await supabase
        .from('comparison_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch plan names for each history item
      const historyWithNames: HistoryItem[] = await Promise.all(
        (data || []).map(async (item) => {
          if (item.plan_ids && item.plan_ids.length > 0) {
            const { data: plans } = await supabase
              .from('insurance_plans')
              .select('name')
              .in('id', item.plan_ids);

            return {
              ...item,
              plan_names: plans?.map((p) => p.name) || [],
            };
          }
          return { ...item, plan_names: [] };
        })
      );

      setHistory(historyWithNames);
    } catch (error) {
      console.error('Error fetching history:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดประวัติได้',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบประวัตินี้?')) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('comparison_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(history.filter((h) => h.id !== id));
      showToast({
        type: 'success',
        title: 'ลบแล้ว',
        message: 'ลบประวัติเรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error deleting:', error);
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถลบได้',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyLink = async (shareCode: string) => {
    const url = `${window.location.origin}/share/${shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast({
        type: 'success',
        title: 'คัดลอกแล้ว',
        message: 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถคัดลอกได้',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} วันที่แล้ว`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} สัปดาห์ที่แล้ว`;
    const months = Math.floor(days / 30);
    return `${months} เดือนที่แล้ว`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไป Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ประวัติการเปรียบเทียบ</h1>
          <p className="text-gray-600">
            ดูและจัดการประวัติการเปรียบเทียบแผนประกันของคุณ
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="bordered" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ยังไม่มีประวัติการเปรียบเทียบ
            </h3>
            <p className="text-gray-600 mb-6">
              เริ่มเปรียบเทียบแผนประกันเพื่อบันทึกประวัติ
            </p>
            <Link href="/compare">
              <Button>เริ่มเปรียบเทียบ</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const TypeIcon = typeLabels[item.insurance_type]?.icon || Shield;

              return (
                <Card
                  key={item.id}
                  variant="bordered"
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <TypeIcon size={20} className="text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {typeLabels[item.insurance_type]?.name || 'ประกัน'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.plan_ids?.length || 0} แผน
                          </p>
                        </div>
                      </div>

                      {/* Plan names */}
                      {item.plan_names && item.plan_names.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.plan_names.map((name, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Time */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{getTimeAgo(item.created_at)}</span>
                        <span className="text-gray-300">|</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/share/${item.share_code}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink size={16} className="mr-1" />
                          ดู
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(item.share_code)}
                      >
                        <Copy size={16} className="mr-1" />
                        คัดลอก
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
