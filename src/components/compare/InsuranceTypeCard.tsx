import Link from 'next/link';
import { Card } from '@/components/ui';
import { cn, getInsuranceTypeIcon, getInsuranceTypeLabel } from '@/lib/utils';
import type { InsuranceType } from '@/types';

interface InsuranceTypeCardProps {
  type: InsuranceType;
  planCount?: number;
  description?: string;
}

export function InsuranceTypeCard({ type, planCount, description }: InsuranceTypeCardProps) {
  const colors: Record<InsuranceType, string> = {
    health: 'from-blue-500 to-cyan-500',
    life: 'from-emerald-500 to-green-500',
    car: 'from-orange-500 to-amber-500',
  };

  return (
    <Link href={`/compare/${type}`} className="block touch-manipulation">
      <Card
        variant="bordered"
        className={cn(
          'group transition-all cursor-pointer overflow-hidden',
          'hover:shadow-lg active:scale-[0.98]',
          'h-full' // Ensure equal height in grid
        )}
      >
        {/* Gradient Top */}
        <div className={cn(
          'h-2 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-3 sm:mb-4 bg-gradient-to-r',
          colors[type]
        )} />

        {/* Icon */}
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
          {getInsuranceTypeIcon(type)}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-cyan-600 transition-colors">
          {getInsuranceTypeLabel(type)}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">{description}</p>
        )}

        {/* Plan Count */}
        {planCount !== undefined && (
          <p className="text-xs sm:text-sm text-cyan-600 font-medium">
            {planCount} แผนประกัน
          </p>
        )}

        {/* Arrow */}
        <div className="mt-3 sm:mt-4 text-sm text-gray-400 group-hover:text-cyan-600 group-active:text-cyan-700 transition-colors font-medium">
          เปรียบเทียบ →
        </div>
      </Card>
    </Link>
  );
}
