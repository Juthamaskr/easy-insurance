'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  insuranceType?: 'health' | 'life' | 'car';
}

export default function ChatBot({ insuranceType }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'สวัสดีครับ! ผมเป็นผู้ช่วย AI ของ Easy Insurance ยินดีให้คำปรึกษาเรื่องประกันครับ คุณสนใจประกันประเภทใดครับ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    // Detect intent
    if (lowerMessage.includes('สุขภาพ') || lowerMessage.includes('health')) {
      // Fetch health plans
      const { data: plans } = await supabase
        .from('insurance_plans')
        .select('name, premium_yearly, sum_insured, company:insurance_companies(name)')
        .eq('type', 'health')
        .eq('is_active', true)
        .order('premium_yearly', { ascending: true })
        .limit(3);

      if (plans && plans.length > 0) {
        const planList = plans.map((p: any, i: number) =>
          `${i + 1}. ${p.name} (${p.company?.name}) - เบี้ย ${formatPrice(p.premium_yearly)}/ปี`
        ).join('\n');

        return `ยินดีครับ! นี่คือแผนประกันสุขภาพที่แนะนำ:\n\n${planList}\n\nต้องการทราบรายละเอียดเพิ่มเติมแผนไหนครับ?`;
      }
      return 'ขออภัยครับ ขณะนี้ยังไม่มีแผนประกันสุขภาพในระบบ';
    }

    if (lowerMessage.includes('ชีวิต') || lowerMessage.includes('life')) {
      const { data: plans } = await supabase
        .from('insurance_plans')
        .select('name, premium_yearly, sum_insured, company:insurance_companies(name)')
        .eq('type', 'life')
        .eq('is_active', true)
        .order('premium_yearly', { ascending: true })
        .limit(3);

      if (plans && plans.length > 0) {
        const planList = plans.map((p: any, i: number) =>
          `${i + 1}. ${p.name} (${p.company?.name}) - เบี้ย ${formatPrice(p.premium_yearly)}/ปี`
        ).join('\n');

        return `นี่คือแผนประกันชีวิตที่แนะนำ:\n\n${planList}\n\nสนใจแผนไหนเป็นพิเศษครับ?`;
      }
      return 'ขออภัยครับ ขณะนี้ยังไม่มีแผนประกันชีวิตในระบบ';
    }

    if (lowerMessage.includes('รถ') || lowerMessage.includes('car') || lowerMessage.includes('รถยนต์')) {
      const { data: plans } = await supabase
        .from('insurance_plans')
        .select('name, premium_yearly, sum_insured, company:insurance_companies(name)')
        .eq('type', 'car')
        .eq('is_active', true)
        .order('premium_yearly', { ascending: true })
        .limit(3);

      if (plans && plans.length > 0) {
        const planList = plans.map((p: any, i: number) =>
          `${i + 1}. ${p.name} (${p.company?.name}) - เบี้ย ${formatPrice(p.premium_yearly)}/ปี`
        ).join('\n');

        return `นี่คือแผนประกันรถยนต์ที่แนะนำ:\n\n${planList}\n\nต้องการข้อมูลเพิ่มเติมแผนไหนครับ?`;
      }
      return 'ขออภัยครับ ขณะนี้ยังไม่มีแผนประกันรถยนต์ในระบบ';
    }

    if (lowerMessage.includes('ราคา') || lowerMessage.includes('เบี้ย') || lowerMessage.includes('ถูก')) {
      return 'เบี้ยประกันขึ้นอยู่กับหลายปัจจัย เช่น อายุ ทุนประกัน และความคุ้มครอง คุณมีงบประมาณเท่าไหร่ครับ? ผมจะช่วยแนะนำแผนที่เหมาะสม';
    }

    if (lowerMessage.includes('เปรียบเทียบ') || lowerMessage.includes('compare')) {
      return 'คุณสามารถเปรียบเทียบแผนประกันได้ที่หน้า "เปรียบเทียบประกัน" ครับ เลือกได้สูงสุด 3 แผนเพื่อเปรียบเทียบความคุ้มครองและราคา';
    }

    if (lowerMessage.includes('ติดต่อ') || lowerMessage.includes('โทร') || lowerMessage.includes('พูดคุย')) {
      return 'หากต้องการพูดคุยกับตัวแทน กรุณากดปุ่ม "สนใจ" ที่แผนประกันที่สนใจ แล้วกรอกข้อมูลติดต่อกลับครับ ตัวแทนจะติดต่อกลับโดยเร็ว';
    }

    if (lowerMessage.includes('ขอบคุณ') || lowerMessage.includes('thanks')) {
      return 'ยินดีครับ! หากมีคำถามเพิ่มเติม สอบถามได้ตลอดเวลาครับ 😊';
    }

    // Default response
    return 'ผมช่วยแนะนำประกันได้ครับ บอกผมได้เลยว่าสนใจประกันประเภทใด:\n\n• ประกันสุขภาพ\n• ประกันชีวิต\n• ประกันรถยนต์\n\nหรือบอกงบประมาณที่ต้องการก็ได้ครับ';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'ขออภัยครับ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-semibold">AI ผู้ช่วยประกัน</h3>
                <p className="text-xs text-white/80">ออนไลน์ตลอด 24 ชม.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-cyan-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 size={20} className="animate-spin text-cyan-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm dark:bg-gray-800 dark:text-white"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by Easy Insurance AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
