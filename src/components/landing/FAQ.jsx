import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react'; 

const faqs = [
  { q: "كيف تعمل الأكاديمية؟", a: "الأكاديمية توفر بيئة تعليمية متكاملة عبر منصة رقمية تتيح للطلاب والمعلمين التواصل والتعلم بفاعلية." },
  { q: "هل يمكن للطالب التواصل المباشر مع المعلم؟", a: "نعم، توفر المنصة نظام تواصل آمن ومباشر بين الطالب والمعلم خلال وبعد الحصص." },
  { q: "كيف يمكن لولي الأمر متابعة الأبناء؟", a: "يمكن لولي الأمر الدخول على حساب خاص لمتابعة التقارير الدراسية والحضور والدرجات." },
  { q: "هل توفر المنصة اختبارات وواجبات؟", a: "نعم، يتم رفع الواجبات والاختبارات دورياً ومتابعتها من قبل المعلمين." },
  { q: "ماذا يحدث عند غياب الطالب أو المعلم؟", a: "يتم تنظيم مواعيد بديلة أو توفير تسجيل الحصة للطالب في حال غيابه." },
  { q: "هل يتم تسجيل الحصص الدراسية؟", a: "بالتأكيد، يتم تسجيل كافة الحصص للرجوع إليها في أي وقت." },
  { q: "كيف تتم عملية الاشتراك؟", a: "يمكنك الاشتراك بسهولة عبر اختيار الباقة المناسبة وإتمام الدفع من خلال صفحة الاشتراكات." },
];

const FAQItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border border-gray-100 rounded-2xl mb-4 bg-white shadow-[0px_4px_6px_rgba(0,0,0,0.05)] transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-right"
      >
        <span className="font-bold text-[#1F2937] text-lg">{item.q}</span>
        <div className={`transition-transform duration-300 ${isOpen ? 'text-[#12C6B0]' : 'text-[#1F2937]'}`}>
          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6 text-[#4B5563] leading-7 font-normal"
          >
            {item.a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  return (
    <section className="py-20 bg-white w-full">
      <div className="w-full px-4 md:px-12 lg:px-24 text-center">
        <h2 className="text-[40px] font-bold text-[#1F2937] mb-3">الأسئلة الشائعة</h2>
        <p className="text-[#6B7280] mb-12">كل ما تحتاج معرفته عن المنصة، الاشتراكات، وآلية الدراسة داخل الأكاديمية.</p>
        
        <div className="text-right w-full">
          {faqs.map((item, index) => (
            <FAQItem key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}