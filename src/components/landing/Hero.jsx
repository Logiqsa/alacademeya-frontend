import heroImage from "../../assets/small dashbord.svg";
import heroBg from "../../assets/hero.png";

export default function Hero() {
  return (
<section className="relative w-full overflow-hidden" id="home">
  
  <img 
    src={heroBg} 
    alt="Hero Background" 
    className="absolute top-0 left-0 w-full h-[80%] lg:h-[90%] object-cover pointer-events-none" 
  />

  <div className="container-custom mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative z-10 pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
        {/* ================= TEXT SIDE ================= */}
        <div className="flex-1 text-center lg:text-right  lg:mr-10">

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            style={{
              fontFamily: "Tajawal, sans-serif",
              fontSize: "clamp(42px, 4vw, 70px)",
            }}
          >
            <span className="text-[#1F2937]">منصة واحدة</span>
            <br />
            <span className="text-(--primary)">لإدارة تعليمية متكاملة</span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-[20px] leading-7 sm:leading-8 tracking-[0%] text-[#1F2937] text-center lg:text-right font-[IBM_Plex_Sans_Arabic] max-w-full lg:max-w-xl mx-auto lg:mx-0">
            منصة متكاملة تدير الاشتراكات، الحصص، الامتحانات، حضور وغياب الطلاب،
            وتضمن تواصلًا آمنًا بين الجميع في نظام ذكي ومحمي بالكامل.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">

            <button className="
              w-full sm:w-50 lg:w-60
              h-12.5 sm:h-14
              flex items-center justify-center gap-2
              bg-[#123C91]
              transition-none duration-0
              text-white rounded-lg
              px-4 shadow-lg
              font-medium text-lg sm:text-[24px]
              font-['Tajawal'] leading-[100%]
            ">
              ابدأ الآن
            </button>

            <button className="
              w-full sm:w-50 lg:w-60
              h-12.5 sm:h-14
              flex items-center justify-center gap-2
              border border-[#1F2937]/20 bg-white
              transition-none duration-0
              text-[#123C91] rounded-lg
              px-6
              font-medium text-lg sm:text-[24px]
              font-['Tajawal'] leading-[100%]
            ">
              استكشف المنصة
            </button>

          </div>

        </div>

        {/* ================= IMAGE SIDE ================= */}
        <div className="flex-1 flex justify-center lg:justify-end">

          <img
            src={heroImage}
            alt="Hero Dashboard"
            className="
              w-70 sm:w-85 md:w-100 lg:w-105
              h-auto
              drop-shadow-2xl
              rotate-2
              hover:rotate-6
              transition-transform duration-500
              translate-y-4 sm:translate-y-6 lg:translate-y-2
            "
          />

        </div>

      </div>
    </section>
  );
}