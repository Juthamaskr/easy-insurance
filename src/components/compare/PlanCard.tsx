'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import type { InsurancePlan } from '@/types';

interface PlanCardProps {
  plan: InsurancePlan;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewDetail?: () => void;
}

export function PlanCard({ plan, isSelected, onSelect, onViewDetail }: PlanCardProps) {
  return (
    <Card
      variant="bordered"
      className={cn(
        'relative cursor-pointer transition-all',
        'active:scale-[0.98] hover:shadow-md',
        'touch-manipulation', // Improves touch response
        isSelected && 'ring-2 ring-cyan-500 border-cyan-500 bg-cyan-50/30'
      )}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center">
          <Check size={16} className="text-white sm:w-[14px] sm:h-[14px]" />
        </div>
      )}

      {/* Selection hint for unselected */}
      {!isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 sm:w-6 sm:h-6 border-2 border-gray-200 rounded-full" />
      )}

      {/* Company Logo/Name */}
      <div className="flex items-center space-x-3 mb-4">
        {plan.company?.logo_url ? (
          <img
            src={plan.company.logo_url}
            alt={plan.company.name}
            className="w-14 h-14 sm:w-12 sm:h-12 object-contain"
          />
        ) : (
          <div className="w-14 h-14 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl sm:text-xl">
            🏢
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{plan.company?.name}</p>
          <h3 className="font-semibold text-gray-900 text-base sm:text-sm leading-tight">{plan.name}</h3>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-2xl sm:text-xl font-bold text-cyan-600">
          {formatPrice(plan.premium_yearly)}
          <span className="text-sm font-normal text-gray-500">/ปี</span>
        </p>
        {plan.premium_monthly && (
          <p className="text-sm text-gray-500">
            หรือ {formatPrice(plan.premium_monthly)}/เดือน
          </p>
        )}
      </div>

      {/* Key Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ทุนประกัน</span>
          <span className="font-medium">{formatPrice(plan.sum_insured)}</span>
        </div>
        {plan.company?.rating && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">คะแนน</span>
            <span className="font-medium">⭐ {plan.company.rating}</span>
          </div>
        )}
        {plan.waiting_period_days != null && plan.waiting_period_days > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ระยะรอคอย</span>
            <span className="font-medium">{plan.waiting_period_days} วัน</span>
          </div>
        )}
      </div>

      {/* Benefits Preview */}
      {plan.benefits && plan.benefits.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">ความคุ้มครองหลัก:</p>
          <ul className="space-y-1.5 sm:space-y-1">
            {plan.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="text-sm sm:text-xs text-gray-600 flex items-start">
                <Check size={14} className="text-emerald-500 mr-1.5 mt-0.5 flex-shrink-0 sm:w-3 sm:h-3" />
                <span className="line-clamp-1">{benefit}</span>
              </li>
            ))}
            {plan.benefits.length > 3 && (
              <li className="text-sm sm:text-xs text-cyan-600 font-medium">
                +{plan.benefits.length - 3} รายการ
              </li>
            )}
          </ul>
        </div>
      )}

      {/* View Detail Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail?.();
        }}
        className="w-full py-3 sm:py-2 text-sm text-cyan-600 hover:text-cyan-700 active:text-cyan-800 font-medium border-t border-gray-100 -mx-4 px-4 -mb-4 mt-2 rounded-b-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        ดูรายละเอียด →
      </button>
    </Card>
  );
}
