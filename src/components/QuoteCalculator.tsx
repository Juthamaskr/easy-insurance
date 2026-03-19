'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { Calculator, User, Calendar } from 'lucide-react';

interface QuoteCalculatorProps {
  basePremium: number;
  planName: string;
  planType: 'health' | 'life' | 'car';
  onCalculate?: (premium: number) => void;
}

// Age factors for premium calculation
const AGE_FACTORS: Record<string, Record<string, number>> = {
  health: {
    '0-17': 0.7,
    '18-25': 0.8,
    '26-35': 1.0,
    '36-45': 1.3,
    '46-55': 1.6,
    '56-65': 2.0,
    '66+': 2.5,
  },
  life: {
    '0-17': 0.5,
    '18-25': 0.7,
    '26-35': 1.0,
    '36-45': 1.4,
    '46-55': 1.9,
    '56-65': 2.5,
    '66+': 3.2,
  },
  car: {
    '18-25': 1.3,
    '26-35': 1.0,
    '36-45': 0.95,
    '46-55': 1.0,
    '56-65': 1.1,
    '66+': 1.3,
  },
};

// Gender factors
const GENDER_FACTORS: Record<string, Record<string, number>> = {
  health: { male: 1.0, female: 0.95 },
  life: { male: 1.1, female: 0.9 },
  car: { male: 1.15, female: 0.95 },
};

function getAgeGroup(age: number): string {
  if (age < 18) return '0-17';
  if (age <= 25) return '18-25';
  if (age <= 35) return '26-35';
  if (age <= 45) return '36-45';
  if (age <= 55) return '46-55';
  if (age <= 65) return '56-65';
  return '66+';
}

export default function QuoteCalculator({
  basePremium,
  planName,
  planType,
  onCalculate,
}: QuoteCalculatorProps) {
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [calculatedPremium, setCalculatedPremium] = useState<number>(basePremium);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    calculatePremium();
  }, [age, gender, basePremium]);

  const calculatePremium = () => {
    const ageGroup = getAgeGroup(age);
    const ageFactor = AGE_FACTORS[planType]?.[ageGroup] || 1.0;
    const genderFactor = GENDER_FACTORS[planType]?.[gender] || 1.0;

    const premium = Math.round(basePremium * ageFactor * genderFactor);
    setCalculatedPremium(premium);
    onCalculate?.(premium);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const ageGroup = getAgeGroup(age);
  const ageFactor = AGE_FACTORS[planType]?.[ageGroup] || 1.0;
  const genderFactor = GENDER_FACTORS[planType]?.[gender] || 1.0;

  return (
    <Card variant="bordered" className="bg-gradient-to-br from-cyan-50 to-white">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={20} className="text-cyan-600" />
        <h3 className="font-semibold text-gray-900">คำนวณเบี้ยประกัน</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">{planName}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar size={14} className="inline mr-1" />
            อายุ (ปี)
          </label>
          <Input
            type="number"
            min={1}
            max={99}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="text-center"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User size={14} className="inline mr-1" />
            เพศ
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setGender('male')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                gender === 'male'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ชาย
            </button>
            <button
              onClick={() => setGender('female')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                gender === 'female'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              หญิง
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-white rounded-lg p-4 border border-cyan-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">เบี้ยประกันโดยประมาณ</p>
          <p className="text-3xl font-bold text-cyan-600">
            {formatCurrency(calculatedPremium)}
          </p>
          <p className="text-xs text-gray-400 mt-1">ต่อปี</p>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs text-cyan-600 hover:text-cyan-700 mt-3 w-full text-center"
        >
          {showBreakdown ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดการคำนวณ'}
        </button>

        {showBreakdown && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>เบี้ยพื้นฐาน:</span>
              <span>{formatCurrency(basePremium)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ตัวคูณอายุ ({ageGroup}):</span>
              <span>x{ageFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ตัวคูณเพศ ({gender === 'male' ? 'ชาย' : 'หญิง'}):</span>
              <span>x{genderFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 mt-2 pt-2 border-t">
              <span>รวม:</span>
              <span>{formatCurrency(calculatedPremium)}</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        * เบี้ยประกันจริงอาจแตกต่างขึ้นอยู่กับเงื่อนไขของแต่ละบริษัท
      </p>
    </Card>
  );
}
