'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { HealthForm } from '@/components/forms/HealthForm';
import { LifeForm } from '@/components/forms/LifeForm';
import { CarForm } from '@/components/forms/CarForm';
import { getInsuranceTypeLabel, getInsuranceTypeIcon } from '@/lib/utils';
import type { InsuranceType, HealthFormData, LifeFormData, CarFormData } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InsuranceFormPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as InsuranceType;

  const validTypes = ['health', 'life', 'car'];
  if (!validTypes.includes(type)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="bordered" className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบประเภทประกัน</h2>
          <p className="text-gray-600 mb-4">กรุณาเลือกประเภทประกันจากหน้าหลัก</p>
          <Link href="/compare" className="text-cyan-600 hover:text-cyan-700">
            กลับไปหน้าเลือกประเภท
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = (data: HealthFormData | LifeFormData | CarFormData) => {
    // Convert form data to query params
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    router.push(`/compare/${type}/results?${params.toString()}`);
  };

  const renderForm = () => {
    switch (type) {
      case 'health':
        return <HealthForm onSubmit={handleSubmit} />;
      case 'life':
        return <LifeForm onSubmit={handleSubmit} />;
      case 'car':
        return <CarForm onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/compare"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          กลับไปเลือกประเภทประกัน
        </Link>

        {/* Form Card */}
        <Card variant="elevated" className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">{getInsuranceTypeIcon(type)}</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getInsuranceTypeLabel(type)}
            </h1>
            <p className="text-gray-600">
              กรอกข้อมูลเพื่อค้นหาแผนประกันที่เหมาะกับคุณ
            </p>
          </div>

          {/* Form */}
          {renderForm()}
        </Card>

        {/* Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการค้นหาแผนประกันเท่านั้น
        </p>
      </div>
    </div>
  );
}
