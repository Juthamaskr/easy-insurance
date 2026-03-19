'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Trash2, Loader2 } from 'lucide-react';
import { Card, Button, useToast, SkeletonCard } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, getInsuranceTypeLabel } from '@/lib/utils';
import type { SavedPlan, InsurancePlan } from '@/types';

export default function SavedPlansPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [savedPlans, setSavedPlans] = useState<(SavedPlan & { plan: InsurancePlan })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchSavedPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/dashboard/saved');
        return;
      }

      const { data, error } = await supabase
        .from('saved_plans')
        .select(`
          *,
          plan:insurance_plans(
            *,
            company:insurance_companies(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: 'ไม่สามารถโหลดข้อมูลได้',
        });
      } else {
        setSavedPlans(data || []);
      }

      setLoading(false);
    };

    fetchSavedPlans();
  }, []);

  const handleDelete = async (savedPlanId: string) => {
    setDeletingId(savedPlanId);

    const { error } = await supabase
      .from('saved_plans')
      .delete()
      .eq('id', savedPlanId);

    if (error) {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถลบได้',
      });
    } else {
      setSavedPlans(savedPlans.filter(sp => sp.id !== savedPlanId));
      showToast({
        type: 'success',
        title: 'ลบแล้ว',
        message: 'นำแผนประกันออกจากรายการบันทึกแล้ว',
      });
    }

    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับ Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="text-pink-500" fill="currentColor" />
            แผนที่บันทึกไว้
          </h1>
          <p className="text-gray-600 mt-1">
            {savedPlans.length} แผนประกัน
          </p>
        </div>

        {/* Saved Plans List */}
        {savedPlans.length > 0 ? (
          <div className="space-y-4">
            {savedPlans.map((savedPlan) => (
              <Card key={savedPlan.id} variant="bordered" className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {savedPlan.plan?.company?.logo_url ? (
                    <img
                      src={savedPlan.plan.company.logo_url}
                      alt={savedPlan.plan.company.name}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      🏢
                    </div>
                  )}
                </div>

                {/* Plan Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">
                      {getInsuranceTypeLabel(savedPlan.plan?.type || 'health')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {savedPlan.plan?.company?.name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {savedPlan.plan?.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-lg font-bold text-cyan-600">
                      {formatPrice(savedPlan.plan?.premium_yearly || 0)}/ปี
                    </span>
                    <span className="text-sm text-gray-500">
                      ทุนประกัน {formatPrice(savedPlan.plan?.sum_insured || 0)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <Link href={`/compare/${savedPlan.plan?.type}/results`}>
                    <Button variant="outline" size="sm">
                      เปรียบเทียบ
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(savedPlan.id)}
                    disabled={deletingId === savedPlan.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {deletingId === savedPlan.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ยังไม่มีแผนที่บันทึกไว้
            </h3>
            <p className="text-gray-500 mb-4">
              เริ่มเปรียบเทียบและบันทึกแผนประกันที่คุณสนใจ
            </p>
            <Link href="/compare">
              <Button>เปรียบเทียบประกัน</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
