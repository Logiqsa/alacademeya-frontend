import React from "react";
import logo from "../../assets/icons/logo.svg";
import fbIcon from "../../assets/icons/facebook.png";
import twitterIcon from "../../assets/icons/twitter.png";
import instagramIcon from "../../assets/icons/instagram.png";
import youtubeIcon from "../../assets/icons/youtube.png";

const Footer = () => {
  return (
    <footer
      dir="rtl"
      className="w-full bg-[#EAF4FF] py-10 px-4 md:px-20 border-t border-[#DBE7F5]"
      style={{ maxWidth: "1440px", margin: "0 auto" }}
    >
      <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
        
        <div className="max-w-75">
          <div className="flex items-center gap-3 w-44 h-8">
            <img src={logo} alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <p className="font-normal text-[15px] leading-6 text-right text-[#1F2937] mt-4">
            منصة متكاملة تدير الاشتراكات، الحصص، الامتحانات، حضور وغياب الطلاب، وتضمن تواصلاً آمناً بين الجميع.
          </p>
        </div>

        {/* ================= PLATFORM ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">المنصة</h2>
          <ul className="space-y-3">
            <li><a className="cursor-pointer text-primary hover:text-[#12C6B0]! transition-colors duration-300">الرئيسية</a></li>
            <li><a className="cursor-pointer text-primary hover:text-[#12C6B0]! transition-colors duration-300">المميزات</a></li>
            <li><a className="cursor-pointer text-primary hover:text-[#12C6B0]! transition-colors duration-300">الباقات</a></li>
          </ul>
        </div>

        {/* ================= SUPPORT ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">الدعم والمعلومات</h2>
          <ul className="space-y-3">
            <li><a className="cursor-pointer text-primary hover:text-[#12C6B0]! transition-colors duration-300">عن الأكاديمية</a></li>
            <li><a className="cursor-pointer text-primary hover:text-[#12C6B0]! transition-colors duration-300">الأسئلة الشائعة</a></li>
          </ul>
        </div>

        {/* ================= SOCIAL ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">تابعنا</h2>
          <div className="flex gap-4 w-44 h-8">
            {[fbIcon, twitterIcon, instagramIcon, youtubeIcon].map((icon, index) => (
              <a
                key={index}
                href="#"
                className="w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <img
                  src={icon}
                  alt="social"
                  className="w-full h-full object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="mt-12 pt-8 text-center border-t border-[#1F293733]">
        <p className="text-[16px] text-[#123C91] font-normal">
          © 2026 الأكاديمية. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;