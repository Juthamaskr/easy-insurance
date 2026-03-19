'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/components/ui';

const schema = z.object({
  age: z.coerce.number().min(1, 'กรุณากรอกอายุ').max(70, 'อายุต้องไม่เกิน 70'),
  gender: z.enum(['male', 'female'], { message: 'กรุณาเลือกเพศ' }),
  marital_status: z.enum(['single', 'married', 'divorced']).optional(),
  monthly_income: z.coerce.number().optional(),
  sum_insured: z.coerce.number().min(100000, 'ทุนประกันขั้นต่ำ 100,000 บาท'),
});

type FormData = z.infer<typeof schema>;

interface LifeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function LifeForm({ onSubmit, isLoading }: LifeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      gender: 'male',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="อายุ (ปี)"
          type="number"
          placeholder="เช่น 35"
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
        <Select
          label="สถานะสมรส"
          options={[
            { label: 'เลือกสถานะ', value: '' },
            { label: 'โสด', value: 'single' },
            { label: 'สมรส', value: 'married' },
            { label: 'หย่าร้าง', value: 'divorced' },
          ]}
          {...register('marital_status')}
        />

        <Input
          label="รายได้ต่อเดือน (บาท)"
          type="number"
          placeholder="ไม่บังคับ"
          {...register('monthly_income')}
        />
      </div>

      <Select
        label="ทุนประกันที่ต้องการ"
        options={[
          { label: 'เลือกทุนประกัน', value: '' },
          { label: '100,000 บาท', value: '100000' },
          { label: '500,000 บาท', value: '500000' },
          { label: '1,000,000 บาท', value: '1000000' },
          { label: '2,000,000 บาท', value: '2000000' },
          { label: '5,000,000 บาท', value: '5000000' },
          { label: '10,000,000 บาท+', value: '10000000' },
        ]}
        error={errors.sum_insured?.message}
        {...register('sum_insured')}
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        ค้นหาแผนประกัน
      </Button>
    </form>
  );
}
