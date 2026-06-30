import React from "react";

const WelcomeHeader = ({ studentName = "محمد" }) => {
  return (
    <div dir="rtl" className="mb-6">
      <h2
        className="text-[#123C91] font-bold text-[20px] sm:text-[22px] mb-2"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        مرحباً بك يا {studentName}
      </h2>
      <p
        className="text-[#575F69] text-[13px] sm:text-[14px]"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        هنا يمكنك الوصول إلى محتوى دروسك، متابعة جدول الحصص، تسليم الواجبات، ومراقبة تقدمك الدراسي ودرجاتك بسهولة.
      </p>
    </div>
  );
};

export default WelcomeHeader;