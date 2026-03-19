'use client';

import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import type { InsurancePlan, InsuranceType } from '@/types';
import { Share2, Heart } from 'lucide-react';
import { PDFExportButton } from './PDFExportButton';

interface CompareTableProps {
  plans: InsurancePlan[];
  insuranceType?: InsuranceType;
  onInterested?: (planId: string) => void;
  onShare?: () => void;
  onSave?: (planId: string) => void;
  savedPlanIds?: string[];
}

export function CompareTable({
  plans,
  insuranceType = 'health',
  onInterested,
  onShare,
  onSave,
  savedPlanIds = [],
}: CompareTableProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        กรุณาเลือกแผนประกันเพื่อเปรียบเทียบ
      </div>
    );
  }

  const rows = [
    { label: 'บริษัท', getValue: (p: InsurancePlan) => p.company?.name || '-' },
    { label: 'เบี้ยประกัน/ปี', getValue: (p: InsurancePlan) => formatPrice(p.premium_yearly) },
    { label: 'ทุนประกัน', getValue: (p: InsurancePlan) => formatPrice(p.sum_insured) },
    { label: 'ระยะรอคอย', getValue: (p: InsurancePlan) => p.waiting_period_days ? `${p.waiting_period_days} วัน` : '-' },
    { label: 'คะแนน', getValue: (p: InsurancePlan) => p.company?.rating ? `⭐ ${p.company.rating}` : '-' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
        <PDFExportButton plans={plans} insuranceType={insuranceType} />
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 size={16} className="mr-2" />
          แชร์ลิงก์
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500 w-32">รายการ</th>
              {plans.map((plan) => (
                <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900 min-w-[180px]">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 text-sm text-gray-500">{row.label}</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center text-sm font-medium">
                    {row.getValue(plan)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Benefits Row */}
            <tr className="bg-white">
              <td className="py-3 px-4 text-sm text-gray-500 align-top">ความคุ้มครอง</td>
              {plans.map((plan) => (
                <td key={plan.id} className="py-3 px-4 text-sm">
                  <ul className="space-y-1">
                    {plan.benefits?.slice(0, 5).map((benefit, i) => (
                      <li key={i} className="text-gray-600 text-xs">
                        ✓ {benefit}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Action Row */}
            <tr className="bg-gray-50">
              <td className="py-4 px-4"></td>
              {plans.map((plan) => (
                <td key={plan.id} className="py-4 px-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      size="sm"
                      onClick={() => onInterested?.(plan.id)}
                      className="w-full max-w-[160px]"
                    >
                      สนใจแผนนี้
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSave?.(plan.id)}
                      className={`w-full max-w-[160px] ${savedPlanIds.includes(plan.id) ? 'text-pink-600' : ''}`}
                    >
                      <Heart
                        size={16}
                        className="mr-1"
                        fill={savedPlanIds.includes(plan.id) ? 'currentColor' : 'none'}
                      />
                      {savedPlanIds.includes(plan.id) ? 'บันทึกแล้ว' : 'บันทึก'}
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
