'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button, useToast } from '@/components/ui';
import { ComparisonPDF } from '@/lib/pdf';
import type { InsurancePlan, InsuranceType } from '@/types';

interface PDFExportButtonProps {
  plans: InsurancePlan[];
  insuranceType: InsuranceType;
}

export function PDFExportButton({ plans, insuranceType }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    if (plans.length === 0) return;

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <ComparisonPDF
          plans={plans}
          insuranceType={insuranceType}
          generatedAt={new Date()}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `easy-insurance-compare-${insuranceType}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'ดาวน์โหลด PDF สำเร็จ',
        message: 'ไฟล์ PDF ถูกบันทึกแล้ว',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast({
        type: 'error',
        title: 'สร้าง PDF ไม่สำเร็จ',
        message: 'กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isGenerating || plans.length === 0}
      isLoading={isGenerating}
    >
      <Download size={16} className="mr-2" />
      {isGenerating ? 'กำลังสร้าง PDF...' : 'Export PDF'}
    </Button>
  );
}
