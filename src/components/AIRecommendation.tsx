'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Sparkles, ThumbsUp, TrendingUp, Shield } from 'lucide-react';
import { getRecommendations, type CustomerProfile, type RecommendedPlan } from '@/lib/recommendation';

interface AIRecommendationProps {
  plans: any[];
  age: number;
  gender?: 'male' | 'female';
  budget: number;
  insuranceType: 'health' | 'life' | 'car';
  onSelectPlan?: (planId: string) => void;
}

export default function AIRecommendation({
  plans,
  age,
  gender = 'male',
  budget,
  insuranceType,
  onSelectPlan,
}: AIRecommendationProps) {
  const [recommendations, setRecommendations] = useState<RecommendedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile: CustomerProfile = {
      age,
      gender,
      budget,
      insuranceType,
    };

    const recs = getRecommendations(plans, profile, 3);
    setRecommendations(recs);
    setLoading(false);
  }, [plans, age, gender, budget, insuranceType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card variant="bordered" className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded"></div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card variant="bordered" className="bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Sparkles size={18} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI แนะนำสำหรับคุณ</h3>
          <p className="text-xs text-gray-500">
            วิเคราะห์จากอายุ {age} ปี และงบประมาณ {formatCurrency(budget)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((plan, index) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg p-4 border cursor-pointer transition-all hover:shadow-md ${
              index === 0 ? 'border-purple-300 ring-1 ring-purple-200' : 'border-gray-200'
            }`}
            onClick={() => onSelectPlan?.(plan.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                    <ThumbsUp size={12} />
                    แนะนำอันดับ 1
                  </span>
                )}
                {index === 1 && (
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                    ทางเลือกที่ 2
                  </span>
                )}
                {index === 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                    ทางเลือกที่ 3
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={14} className="text-green-500" />
                <span className="text-sm font-semibold text-green-600">
                  {plan.matchPercentage}%
                </span>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-1">{plan.name}</h4>
            <p className="text-sm text-gray-500 mb-2">
              {plan.company?.name || 'บริษัทประกัน'}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Shield size={14} />
                <span>{formatCurrency(plan.sum_insured || 0)}</span>
              </div>
              <span className="font-semibold text-cyan-600">
                {formatCurrency(plan.premium_yearly || 0)}/ปี
              </span>
            </div>

            {plan.reasons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">เหตุผลที่แนะนำ:</p>
                <div className="flex flex-wrap gap-1">
                  {plan.reasons.slice(0, 3).map((reason, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        * การแนะนำนี้เป็นเพียงข้อมูลเบื้องต้น ควรศึกษารายละเอียดเพิ่มเติมก่อนตัดสินใจ
      </p>
    </Card>
  );
}
