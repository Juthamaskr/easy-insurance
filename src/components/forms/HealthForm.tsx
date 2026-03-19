'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/components/ui';

const schema = z.object({
  age: z.coerce.number().min(1, 'กรุณากรอกอายุ').max(99, 'อายุต้องไม่เกิน 99'),
  gender: z.enum(['male', 'female'], { message: 'กรุณาเลือกเพศ' }),
  budget_min: z.coerce.number().optional(),
  budget_max: z.coerce.number().optional(),
  sum_insured: z.coerce.number().optional(),
  has_preexisting: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface HealthFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function HealthForm({ onSubmit, isLoading }: HealthFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      gender: 'male',
      has_preexisting: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="อายุ (ปี)"
          type="number"
          placeholder="เช่น 30"
          error={errors.age?.message}
          {...register('age')}
        />

        <Select
          label="เพศ"
          options={[
            { label: 'ชาย', value: 'male' },
            { label: 'หญิง', value: 'female' },
          ]}
          error={errors.gender?.message}
          {...register('gender')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="งบประมาณต่ำสุด (บาท/ปี)"
          type="number"
          placeholder="ไม่บังคับ"
          {...register('budget_min')}
        />

        <Input
          label="งบประมาณสูงสุด (บาท/ปี)"
          type="number"
          placeholder="ไม่บังคับ"
          {...register('budget_max')}
        />
      </div>

      <Select
        label="ทุนประกันที่ต้องการ"
        options={[
          { label: 'เลือกทุนประกัน', value: '' },
          { label: '100,000 บาท', value: '100000' },
          { label: '300,000 บาท', value: '300000' },
          { label: '500,000 บาท', value: '500000' },
          { label: '1,000,000 บาท', value: '1000000' },
          { label: '2,000,000 บาท', value: '2000000' },
          { label: '5,000,000 บาท+', value: '5000000' },
        ]}
        {...register('sum_insured')}
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="has_preexisting"
          className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
          {...register('has_preexisting')}
        />
        <label htmlFor="has_preexisting" className="text-sm text-gray-700">
          มีโรคประจำตัว
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        ค้นหาแผนประกัน
      </Button>
    </form>
  );
}
