'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/components/ui';

const currentYear = new Date().getFullYear();

const schema = z.object({
  car_type: z.enum(['sedan', 'pickup', 'suv', 'other'], { message: 'กรุณาเลือกประเภทรถ' }),
  brand: z.string().min(1, 'กรุณาเลือกยี่ห้อรถ'),
  year: z.coerce.number().min(2000, 'ปีรถต้องตั้งแต่ 2000').max(currentYear + 1, 'ปีรถไม่ถูกต้อง'),
  sum_insured: z.coerce.number().min(100000, 'ทุนประกันขั้นต่ำ 100,000 บาท'),
  insurance_class: z.enum(['1', '2+', '3+'], { message: 'กรุณาเลือกชั้นประกัน' }),
});

type FormData = z.infer<typeof schema>;

interface CarFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function CarForm({ onSubmit, isLoading }: CarFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const carBrands = [
    'Toyota', 'Honda', 'Isuzu', 'Mitsubishi', 'Mazda',
    'Nissan', 'Ford', 'MG', 'Suzuki', 'Mercedes-Benz',
    'BMW', 'Audi', 'Lexus', 'Hyundai', 'Kia', 'อื่นๆ'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="ประเภทรถ"
          options={[
            { label: 'เลือกประเภทรถ', value: '' },
            { label: 'รถเก๋ง', value: 'sedan' },
            { label: 'รถกระบะ', value: 'pickup' },
            { label: 'รถ SUV/PPV', value: 'suv' },
            { label: 'อื่นๆ', value: 'other' },
          ]}
          error={errors.car_type?.message}
          {...register('car_type')}
        />

        <Select
          label="ยี่ห้อรถ"
          options={[
            { label: 'เลือกยี่ห้อ', value: '' },
            ...carBrands.map(brand => ({ label: brand, value: brand.toLowerCase() }))
          ]}
          error={errors.brand?.message}
          {...register('brand')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="ปีรถ (ค.ศ.)"
          type="number"
          placeholder={`เช่น ${currentYear}`}
          error={errors.year?.message}
          {...register('year')}
        />

        <Input
          label="ทุนประกัน (บาท)"
          type="number"
          placeholder="เช่น 500000"
          error={errors.sum_insured?.message}
          {...register('sum_insured')}
        />
      </div>

      <Select
        label="ชั้นประกัน"
        options={[
          { label: 'เลือกชั้นประกัน', value: '' },
          { label: 'ประกันชั้น 1 (คุ้มครองสูงสุด)', value: '1' },
          { label: 'ประกันชั้น 2+ (คุ้มครองปานกลาง)', value: '2+' },
          { label: 'ประกันชั้น 3+ (คุ้มครองพื้นฐาน)', value: '3+' },
        ]}
        error={errors.insurance_class?.message}
        {...register('insurance_class')}
      />

      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <strong>หมายเหตุ:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>ชั้น 1: คุ้มครองทุกกรณี รวมรถหาย ไฟไหม้</li>
          <li>ชั้น 2+: คุ้มครองอุบัติเหตุ ไม่คุ้มครองรถหาย</li>
          <li>ชั้น 3+: คุ้มครองเฉพาะคู่กรณี</li>
        </ul>
      </div>

      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        ค้นหาแผนประกัน
      </Button>
    </form>
  );
}
