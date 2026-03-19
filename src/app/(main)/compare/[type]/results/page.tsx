'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal, Loader2, Heart } from 'lucide-react';
import { Card, Button, Select, Modal, Input, useToast, SkeletonCard } from '@/components/ui';
import { PlanCard, CompareTable } from '@/components/compare';
import { getInsuranceTypeLabel, formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { InsuranceType, InsurancePlan } from '@/types';

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = params.type as InsuranceType;
  const { showToast } = useToast();

  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('price_asc');
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestedPlanId, setInterestedPlanId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  const supabase = createClient();

  // Check current user and fetch saved plans
  useEffect(() => {
    const checkUserAndSavedPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id });
        // Fetch saved plans
        const { data: savedPlans } = await supabase
          .from('saved_plans')
          .select('plan_id')
          .eq('user_id', user.id);

        if (savedPlans) {
          setSavedPlanIds(savedPlans.map(sp => sp.plan_id));
        }
      }
    };
    checkUserAndSavedPlans();
  }, []);

  // Get filter params
  const age = searchParams.get('age');
  const budget_max = searchParams.get('budget_max');

  // Fetch plans from Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);

      let query = supabase
        .from('insurance_plans')
        .select('*, company:insurance_companies(*)')
        .eq('type', type)
        .eq('is_active', true);

      // Filter by budget if provided
      if (budget_max) {
        query = query.lte('premium_yearly', parseInt(budget_max));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching plans:', error);
      } else if (data) {
        // Filter by age client-side (more flexible)
        let filteredData = data;
        if (age) {
          const ageNum = parseInt(age);
          filteredData = data.filter(
            (p) => (!p.min_age || ageNum >= p.min_age) && (!p.max_age || ageNum <= p.max_age)
          );
        }
        setPlans(filteredData);
      }

      setLoading(false);
    };

    fetchPlans();
  }, [type, age, budget_max]);

  // Sort plans
  const sortedPlans = useMemo(() => {
    const sorted = [...plans];
    switch (sortBy) {
      case 'price_asc':
        sorted.sort((a, b) => a.premium_yearly - b.premium_yearly);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.premium_yearly - a.premium_yearly);
        break;
      case 'coverage_desc':
        sorted.sort((a, b) => b.sum_insured - a.sum_insured);
        break;
      case 'rating_desc':
        sorted.sort((a, b) => (b.company?.rating || 0) - (a.company?.rating || 0));
        break;
    }
    return sorted;
  }, [plans, sortBy]);

  const selectedPlans = plans.filter((p) => selectedPlanIds.includes(p.id));

  const togglePlanSelection = (planId: string) => {
    if (selectedPlanIds.includes(planId)) {
      setSelectedPlanIds(selectedPlanIds.filter((id) => id !== planId));
    } else if (selectedPlanIds.length < 3) {
      setSelectedPlanIds([...selectedPlanIds, planId]);
    }
  };

  const handleInterested = (planId: string) => {
    setInterestedPlanId(planId);
    setShowInterestModal(true);
  };

  const handleSubmitInterest = async () => {
    if (!contactForm.name || !contactForm.phone) {
      showToast({
        type: 'warning',
        title: 'กรุณากรอกข้อมูล',
        message: 'กรุณากรอกชื่อและเบอร์โทรศัพท์',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('leads')
      .insert({
        plan_id: interestedPlanId,
        name: contactForm.name,
        phone: contactForm.phone,
        message: contactForm.message,
        status: 'new',
      });

    setSubmitting(false);

    if (error) {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่',
      });
    } else {
      showToast({
        type: 'success',
        title: 'ส่งข้อมูลสำเร็จ!',
        message: 'ตัวแทนจะติดต่อกลับโดยเร็ว',
      });
      setShowInterestModal(false);
      setContactForm({ name: '', phone: '', message: '' });
    }
  };

  const handleSavePlan = useCallback(async (planId: string) => {
    if (!currentUser) {
      showToast({
        type: 'info',
        title: 'กรุณาเข้าสู่ระบบ',
        message: 'ต้องเข้าสู่ระบบก่อนบันทึกแผนประกัน',
      });
      return;
    }

    // Check if already saved
    if (savedPlanIds.includes(planId)) {
      // Remove from saved
      const { error } = await supabase
        .from('saved_plans')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('plan_id', planId);

      if (error) {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: 'ไม่สามารถยกเลิกการบันทึกได้',
        });
      } else {
        setSavedPlanIds(savedPlanIds.filter(id => id !== planId));
        showToast({
          type: 'success',
          title: 'ยกเลิกการบันทึก',
          message: 'นำแผนประกันออกจากรายการบันทึกแล้ว',
        });
      }
    } else {
      // Add to saved
      const { error } = await supabase
        .from('saved_plans')
        .insert({
          user_id: currentUser.id,
          plan_id: planId,
        });

      if (error) {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: 'ไม่สามารถบันทึกแผนได้',
        });
      } else {
        setSavedPlanIds([...savedPlanIds, planId]);
        showToast({
          type: 'success',
          title: 'บันทึกแล้ว!',
          message: 'เพิ่มแผนประกันในรายการบันทึกแล้ว',
        });
      }
    }
  }, [currentUser, savedPlanIds, showToast]);

  const handleShare = useCallback(async () => {
    if (selectedPlanIds.length === 0) return;

    // Generate unique share code
    const shareCode = Math.random().toString(36).substring(2, 10);

    // Save to comparison_history
    const { error } = await supabase
      .from('comparison_history')
      .insert({
        user_id: currentUser?.id || null,
        plan_ids: selectedPlanIds,
        share_code: shareCode,
        insurance_type: type,
        filters: { age, budget_max },
      });

    if (error) {
      showToast({
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถสร้างลิงก์แชร์ได้',
      });
      return;
    }

    const shareUrl = `${window.location.origin}/share/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    showToast({
      type: 'success',
      title: 'คัดลอกลิงก์แล้ว!',
      message: 'สามารถแชร์ลิงก์ให้คนอื่นได้',
    });
  }, [selectedPlanIds, currentUser, type, age, budget_max, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/compare/${type}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            แก้ไขข้อมูล
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ผลการค้นหา {getInsuranceTypeLabel(type)}
              </h1>
              <p className="text-gray-600">
                พบ {sortedPlans.length} แผนประกัน
                {age && ` สำหรับอายุ ${age} ปี`}
                {budget_max && ` งบประมาณไม่เกิน ${formatPrice(parseInt(budget_max))}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Select
                options={[
                  { label: 'ราคาต่ำ-สูง', value: 'price_asc' },
                  { label: 'ราคาสูง-ต่ำ', value: 'price_desc' },
                  { label: 'ทุนประกันสูงสุด', value: 'coverage_desc' },
                  { label: 'คะแนนสูงสุด', value: 'rating_desc' },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* Selection Bar */}
        {selectedPlanIds.length > 0 && (
          <Card
            variant="bordered"
            className="mb-6 flex items-center justify-between bg-cyan-50 border-cyan-200"
          >
            <p className="text-cyan-700">
              เลือกแล้ว {selectedPlanIds.length}/3 แผน
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlanIds([])}
              >
                ล้างทั้งหมด
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCompareModal(true)}
                disabled={selectedPlanIds.length < 2}
              >
                <SlidersHorizontal size={16} className="mr-2" />
                เปรียบเทียบ ({selectedPlanIds.length})
              </Button>
            </div>
          </Card>
        )}

        {/* Plans Grid */}
        {sortedPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanIds.includes(plan.id)}
                onSelect={() => togglePlanSelection(plan.id)}
                onViewDetail={() => window.open(`/plan/${plan.id}`, '_blank')}
              />
            ))}
          </div>
        ) : (
          <Card variant="bordered" className="text-center py-12">
            <p className="text-gray-500 mb-4">
              ไม่พบแผนประกันที่ตรงกับเงื่อนไขของคุณ
            </p>
            <Link href={`/compare/${type}`}>
              <Button variant="outline">ลองปรับเงื่อนไขใหม่</Button>
            </Link>
          </Card>
        )}

        {/* Compare Modal */}
        <Modal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          title="เปรียบเทียบแผนประกัน"
          size="xl"
        >
          <CompareTable
            plans={selectedPlans}
            insuranceType={type}
            onInterested={handleInterested}
            onShare={handleShare}
            onSave={handleSavePlan}
            savedPlanIds={savedPlanIds}
          />
        </Modal>

        {/* Interest Modal */}
        <Modal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          title="สนใจแผนประกัน"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              กรุณากรอกข้อมูลเพื่อให้ตัวแทนติดต่อกลับ
            </p>
            <input
              type="text"
              placeholder="ชื่อ-นามสกุล"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <input
              type="tel"
              placeholder="เบอร์โทรศัพท์"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <textarea
              placeholder="ข้อความเพิ่มเติม (ไม่บังคับ)"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              rows={3}
            />
            <Button
              className="w-full"
              onClick={handleSubmitInterest}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่งข้อมูล'
              )}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
