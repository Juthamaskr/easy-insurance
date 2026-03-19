import { InsuranceTypeCard } from '@/components/compare';

export const metadata = {
  title: 'เปรียบเทียบประกัน - Easy Insurance',
  description: 'เลือกประเภทประกันที่ต้องการเปรียบเทียบ',
};

export default function ComparePage() {
  const insuranceTypes = [
    {
      type: 'health' as const,
      planCount: 25,
      description: 'ประกันสุขภาพ คุ้มครองค่ารักษาพยาบาล ค่าห้อง OPD/IPD ค่าผ่าตัด',
    },
    {
      type: 'life' as const,
      planCount: 18,
      description: 'ประกันชีวิต ความคุ้มครองกรณีเสียชีวิต ทุพพลภาพ พร้อมเงินออม',
    },
    {
      type: 'car' as const,
      planCount: 32,
      description: 'ประกันรถยนต์ ชั้น 1, 2+, 3+ คุ้มครองอุบัติเหตุ รถหาย ไฟไหม้',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            เลือกประเภทประกันที่ต้องการเปรียบเทียบ
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            เริ่มต้นด้วยการเลือกประเภทประกันที่คุณสนใจ
            จากนั้นกรอกข้อมูลเพื่อค้นหาแผนประกันที่เหมาะกับคุณ
          </p>
        </div>

        {/* Insurance Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {insuranceTypes.map((item) => (
            <InsuranceTypeCard
              key={item.type}
              type={item.type}
              planCount={item.planCount}
              description={item.description}
            />
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            ข้อมูลแผนประกันอัปเดตล่าสุด: มีนาคม 2026
          </p>
        </div>
      </div>
    </div>
  );
}
