import React from "react";
import logo from "../../assets/icons/logoo.png";

import {
  Video,
  ClipboardList,
  BarChart3,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "حصص مباشرة وتفاعلية",
    desc: "إدارة الحصص المباشرة مع إمكانية مشاركة الشاشة والملفات والتفاعل داخل الدرس بسهولة.",
    icon: Video,
  },
  {
    title: "اختبارات وواجبات ذكية",
    desc: "إنشاء واجبات واختبارات مع إمكانية التصحيح اليدوي أو التلقائي لتقييم الطلاب بدقة.",
    icon: ClipboardList,
  },
  {
    title: "متابعة مستمرة للأداء",
    desc: "لوحات متابعة وإحصائيات تساعد أولياء الأمور على متابعة تقدم الأبناء بشكل مستمر.",
    icon: BarChart3,
  },
  {
    title: "إدارة مرنة للاشتراكات",
    desc: "اختيار الباقات التعليمية وإدارة الدروس والاشتراكات بسهولة من خلال المنصة.",
    icon: CreditCard,
  },
  {
    title: "بيئة تعليمية آمنة",
    desc: "نظام تواصل منظم يحافظ على خصوصية الطلاب ويوفر بيئة تعليمية آمنة تحت إشراف كامل.",
    icon: ShieldCheck,
  },
];

export default function Services() {
  return (
    <section className="bg-[#F5FBFA] ">
      <div className="container mx-auto px-4">
        <div className="relative w-full max-w-[950px] h-[550px] mx-auto">

          {/* Center Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-[110px] h-[110px] bg-white rounded-full shadow-md flex flex-col items-center justify-center">

              <img
                src={logo}
                alt="logo"
                className="w-8 h-8 mb-1"
              />

              <h2 className="text-[18px] font-bold text-[#1F2937]">
                مميزاتنا
              </h2>

            </div>
          </div>

          {/* Top Left */}
          <div className="absolute top-[20px] left-[150px]">
            <Card {...features[0]} />
          </div>

          {/* Top Right */}
          <div className="absolute top-[20px] right-[150px]">
            <Card {...features[1]} />
          </div>

          {/* Left */}
          <div className="absolute left-[60px] top-[210px]">
            <Card {...features[4]} />
          </div>

          {/* Right */}
          <div className="absolute right-[60px] top-[210px]">
            <Card {...features[3]} />
          </div>

          {/* Bottom */}
          <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2">
            <Card {...features[2]} />
          </div>
        </div>
      </div>
    </section>
  
  );
}

function Card({ title, desc, icon: Icon }) {
  return (
    <div
      className="
        w-[220px]
        h-[140px]
        bg-white
        rounded-2xl
        p-4
        shadow-sm
        border
        border-transparent
        cursor-pointer
        transition-all
        duration-300
        hover:-translate-y-2
        hover:scale-105
        hover:border-[#2563EB]
        hover:shadow-xl
      "
    >
      {/* Icon */}
      <div className="flex justify-end mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
          <Icon
            size={15}
            className="text-[#2563EB]"
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-right text-[18px] font-bold text-[#1F2937] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-right text-[12px] leading-5 text-[#6B7280]">
        {desc}
      </p>
    </div>
  
  );
}