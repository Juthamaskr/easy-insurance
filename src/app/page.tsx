import Link from 'next/link';
import { Button } from '@/components/ui';
import { InsuranceTypeCard } from '@/components/compare';
import { Shield, CheckCircle, Clock, Users } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'เปรียบเทียบง่าย',
      description: 'เปรียบเทียบแผนประกันจากหลายบริษัทในที่เดียว',
    },
    {
      icon: CheckCircle,
      title: 'ข้อมูลครบถ้วน',
      description: 'ดูความคุ้มครอง เบี้ยประกัน และเงื่อนไขแบบละเอียด',
    },
    {
      icon: Clock,
      title: 'ประหยัดเวลา',
      description: 'ไม่ต้องเสียเวลาติดต่อทีละบริษัท',
    },
    {
      icon: Users,
      title: 'บริการฟรี',
      description: 'ใช้งานได้ฟรี ไม่มีค่าใช้จ่ายใดๆ',
    },
  ];

  const insuranceTypes = [
    {
      type: 'health' as const,
      planCount: 25,
      description: 'ค่ารักษาพยาบาล ค่าห้อง OPD/IPD',
    },
    {
      type: 'life' as const,
      planCount: 18,
      description: 'ความคุ้มครองชีวิต เงินออม ลดหย่อนภาษี',
    },
    {
      type: 'car' as const,
      planCount: 32,
      description: 'ประกันรถยนต์ชั้น 1, 2+, 3+',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              เปรียบเทียบประกัน
              <br />
              <span className="text-cyan-100">ง่ายแค่ไม่กี่คลิก</span>
            </h1>
            <p className="text-lg lg:text-xl text-sky-100 mb-8">
              ค้นหาและเปรียบเทียบแผนประกันที่เหมาะกับคุณ
              จากหลายบริษัทประกันชั้นนำ
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/compare">
                <Button size="lg" className="bg-white text-cyan-700 hover:bg-cyan-50">
                  เริ่มเปรียบเทียบเลย
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" size="lg" className="border-2 border-white text-white hover:bg-white/10">
                  ดูวิธีใช้งาน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              เลือกประเภทประกันที่ต้องการเปรียบเทียบ
            </h2>
            <p className="text-gray-600">
              เรามีแผนประกันหลากหลายให้คุณเลือก
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {insuranceTypes.map((item) => (
              <InsuranceTypeCard
                key={item.type}
                type={item.type}
                planCount={item.planCount}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ทำไมต้อง Easy Insurance?
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              วิธีใช้งาน
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { step: 1, title: 'เลือกประเภทประกัน', desc: 'เลือกว่าต้องการประกันสุขภาพ ชีวิต หรือรถยนต์' },
              { step: 2, title: 'กรอกข้อมูล', desc: 'ใส่ข้อมูลเบื้องต้นเช่น อายุ เพศ งบประมาณ' },
              { step: 3, title: 'เปรียบเทียบแผน', desc: 'ดูและเปรียบเทียบแผนประกันที่ตรงกับความต้องการ' },
              { step: 4, title: 'ติดต่อซื้อ', desc: 'เลือกแผนที่ชอบ แล้วติดต่อเพื่อซื้อประกัน' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-cyan-600 to-sky-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเริ่มต้นหาประกันที่ใช่แล้วหรือยัง?
          </h2>
          <p className="text-cyan-100 mb-8">
            เปรียบเทียบประกันจากหลายบริษัทได้ฟรี ไม่มีค่าใช้จ่าย
          </p>
          <Link href="/compare">
            <Button size="lg" className="bg-white text-cyan-700 hover:bg-cyan-50">
              เริ่มเปรียบเทียบเลย
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
