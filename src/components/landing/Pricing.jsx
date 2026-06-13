import React, { useState } from "react";
import { Check, Crown } from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      title: "التجربة المجانية",
      sub: "مثالية للتجربة والتعرف على المنصة",
      price: "مجانية",
      period: "وصول محدود لمدة 7 أيام",
      features: ["حضور حصة تجريبية مجانية", "تصفح المواد والمدرسين", "مشاهدة جدول الدروس", "التواصل مع الإدارة فقط"],
      button: "ابدأ مجانا الآن",
      variant: "outline"
    },
    {
      title: "المتقدمة",
      sub: "أفضل اختيار للمتابعة الكاملة والتفوق الدراسي",
      price: isAnnual ? "EGP 15,588" : "EGP 1,499",
      period: "حق 24 ساعة شهرياً",
      features: ["جميع مميزات الباقة الأساسية", "مواد دراسية متعددة", "أولوية حجز الدروس", "تقارير أداء تفصيلية", "دعم أسرع من الإدارة", "اختبارات وتمارين متقدمة", "متابعة مستمرة لتحسن الطالب", "إحصائيات تفصيلية للحضور والأداء"],
      button: "الترقية للباقة المتقدمة",
      variant: "solid",
      isPopular: true
    },
    {
      title: "الأساسية",
      sub: "مناسبة للمتابعة الدراسية المنتظمة",
      price: isAnnual ? "EGP 7,188" : "EGP 699",
      period: "حق 8 ساعات شهرياً",
      features: ["جميع مميزات الباقة المجانية", "حضور الدروس المباشرة", "مشاهدة تسجيلات الحصص", "الواجبات والاختبارات", "تقييمات وتقارير أداء", "تواصل ولي الأمر مع المدرس", "تحميل ملفات الدروس", "إشعارات الغياب والمواعيد"],
      button: "اشترك الآن",
      variant: "outline"
    }
  ];

  return (
    <section className="py-20 font-sans" dir="rtl" id="pricing">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="font-['Tajawal'] font-bold text-[48px] leading-14 text-[#1F2937] p-4 rounded-lg text-center">
          الباقات و الأسعار
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[18px] leading-6 text-[#1F2937B2] p-4 rounded-lg text-center mb-8">
          اختر الباقة المناسبة لك ولأبنائك واستمتع بتجربة تعليمية متميزة
        </p>

       
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-semibold text-[16px] ${!isAnnual ? "text-[#123C91]" : "text-gray-500"}`}>
            شهرياً
          </span>

          <div className="relative">
         
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-[#EBF4FF] text-[#123C91] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#123C91] transition-opacity duration-300 ${isAnnual ? "opacity-100" : "opacity-0"}`}>
              وفّر 20%
            </div>
            
            <button 
              onClick={() => setIsAnnual(!isAnnual)} 
              className={`w-14 h-7 rounded-full p-1 transition-all duration-300 flex items-center ${isAnnual ? "bg-[#123C91]" : "bg-gray-300"}`}
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                  isAnnual ? "-translate-x-7" : "translate-x-0"
                }`} 
              />
            </button>
          </div>

          <span className={`font-semibold text-[16px] ${isAnnual ? "text-[#123C91]" : "text-gray-500"}`}>
            سنوياً
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div key={i} className={`flex flex-col relative p-6 rounded-2xl border transition-shadow ${plan.isPopular ? "border-[#123C91] shadow-2xl" : "border-[#1F293733] bg-[#FFFFFF]"}`}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#EAF4FF] text-[#123C91] text-xs font-bold px-4 py-1 rounded-full border border-[#123C91] flex items-center gap-1">
                  <Crown size={12} /> الأكثر اختياراً
                </div>
              )}

              <h3 className="font-['Tajawal'] font-bold text-[27px] text-[#1F2937] text-right">{plan.title}</h3>
              <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937] text-right mt-1">{plan.sub}</p>
              <div className="font-['Tajawal'] font-bold text-[32px] text-[#1F2937] text-right mt-2">{plan.price}</div>
              <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#5D3A82] text-right mt-1 mb-6">{plan.period}</p>

              <ul className="text-right space-y-3 mb-8 grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937]">
                    <Check size={16} className="text-[#123C91] shrink-0" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button className={`h-12 rounded-lg font-['Tajawal'] font-medium text-[16px] transition-all ${plan.variant === "solid" ? "bg-[#123C91] text-white" : "bg-white text-[#123C91] border border-[#123C91] hover:bg-[#123C91] hover:text-white"}`}>
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;