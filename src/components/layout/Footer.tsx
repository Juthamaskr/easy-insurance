import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🛡️</span>
              <span className="font-bold text-xl text-white">Easy Insurance</span>
            </div>
            <p className="text-sm max-w-md">
              ระบบเปรียบเทียบประกันที่ใช้งานง่าย ช่วยให้คุณเลือกแผนประกันที่เหมาะสมที่สุด
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">ประเภทประกัน</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/compare/health" className="hover:text-white transition-colors">
                  ประกันสุขภาพ
                </Link>
              </li>
              <li>
                <Link href="/compare/life" className="hover:text-white transition-colors">
                  ประกันชีวิต
                </Link>
              </li>
              <li>
                <Link href="/compare/car" className="hover:text-white transition-colors">
                  ประกันรถยนต์
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm">
              <li>โทร: 02-xxx-xxxx</li>
              <li>Line: @easyinsurance</li>
              <li>Email: contact@easyinsurance.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {currentYear} Easy Insurance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
