'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { InsurancePlan } from '@/types';

// Register Thai font (using Sarabun from Google Fonts CDN)
Font.register({
  family: 'Sarabun',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKEr37c9YL5rik8s6w.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/sarabun/v13/DtVjJx26TKEr37c9YOZqik8s6w.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Sarabun',
    padding: 40,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0891B2',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  labelCell: {
    width: '25%',
    padding: 8,
    fontWeight: 700,
    color: '#374151',
  },
  valueCell: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
  },
  planName: {
    fontWeight: 700,
    color: '#1F2937',
    fontSize: 11,
  },
  companyName: {
    color: '#6B7280',
    fontSize: 9,
  },
  price: {
    fontWeight: 700,
    color: '#0891B2',
    fontSize: 12,
  },
  benefitList: {
    marginTop: 4,
  },
  benefitItem: {
    fontSize: 8,
    color: '#374151',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  logo: {
    fontSize: 14,
    marginBottom: 4,
  },
});

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(price);
};

interface ComparisonPDFProps {
  plans: InsurancePlan[];
  insuranceType: string;
  generatedAt: Date;
}

export function ComparisonPDF({ plans, insuranceType, generatedAt }: ComparisonPDFProps) {
  const typeLabels: Record<string, string> = {
    health: 'ประกันสุขภาพ',
    life: 'ประกันชีวิต',
    car: 'ประกันรถยนต์',
  };

  const rows = [
    { label: 'บริษัท', getValue: (p: InsurancePlan) => p.company?.name || '-' },
    { label: 'เบี้ยประกัน/ปี', getValue: (p: InsurancePlan) => formatPrice(p.premium_yearly), isPrice: true },
    { label: 'ทุนประกัน', getValue: (p: InsurancePlan) => formatPrice(p.sum_insured) },
    { label: 'ระยะรอคอย', getValue: (p: InsurancePlan) => p.waiting_period_days ? `${p.waiting_period_days} วัน` : '-' },
    { label: 'อายุที่รับ', getValue: (p: InsurancePlan) => {
      if (p.min_age && p.max_age) return `${p.min_age}-${p.max_age} ปี`;
      if (p.min_age) return `${p.min_age}+ ปี`;
      return '-';
    }},
    { label: 'คะแนน', getValue: (p: InsurancePlan) => p.company?.rating ? `${p.company.rating}/5` : '-' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.title}>Easy Insurance</Text>
          <Text style={styles.subtitle}>
            ผลการเปรียบเทียบ{typeLabels[insuranceType] || insuranceType}
          </Text>
        </View>

        {/* Plans Header */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.labelCell}>
              <Text>รายการ</Text>
            </View>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.valueCell}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.companyName}>{plan.company?.name}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {rows.map((row, index) => (
            <View
              key={row.label}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <View style={styles.labelCell}>
                <Text>{row.label}</Text>
              </View>
              {plans.map((plan) => (
                <View key={plan.id} style={styles.valueCell}>
                  <Text style={row.isPrice ? styles.price : undefined}>
                    {row.getValue(plan)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Benefits Row */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text>ความคุ้มครอง</Text>
            </View>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.valueCell}>
                <View style={styles.benefitList}>
                  {plan.benefits?.slice(0, 5).map((benefit, i) => (
                    <Text key={i} style={styles.benefitItem}>
                      • {benefit}
                    </Text>
                  ))}
                  {plan.benefits && plan.benefits.length > 5 && (
                    <Text style={styles.benefitItem}>
                      และอีก {plan.benefits.length - 5} รายการ
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            สร้างโดย Easy Insurance | {generatedAt.toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text>ข้อมูลนี้เป็นเพียงการเปรียบเทียบเบื้องต้น กรุณาตรวจสอบรายละเอียดกับบริษัทประกันโดยตรง</Text>
        </View>
      </Page>
    </Document>
  );
}
