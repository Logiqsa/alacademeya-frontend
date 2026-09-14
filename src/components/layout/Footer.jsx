import { MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTelegram, FaTiktok, FaXTwitter, FaYoutube } from "react-icons/fa6";
import logo from "../../assets/icons/logo.svg";
import useContactSettings, { whatsappLink } from "../../hooks/useContactSettings";

const SOCIAL_META = {
  facebook: { label: "فيسبوك", icon: FaFacebookF },
  instagram: { label: "إنستجرام", icon: FaInstagram },
  youtube: { label: "يوتيوب", icon: FaYoutube },
  tiktok: { label: "تيك توك", icon: FaTiktok },
  x: { label: "X", icon: FaXTwitter },
  linkedin: { label: "لينكدإن", icon: FaLinkedinIn },
  telegram: { label: "تليجرام", icon: FaTelegram },
};

const Footer = () => {
  const { contactSettings } = useContactSettings();
  const socialLinks = (contactSettings?.socialLinks || []).filter((link) => link.enabled !== false && SOCIAL_META[link.platform]);
  const handleScroll = (id) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer
      dir="rtl"
      className="w-full bg-[#EAF4FF] py-10 px-4 md:px-20 border-t border-[#DBE7F5]"
      style={{ maxWidth: "1440px", margin: "0 auto" }}
    >
      <div className="flex flex-wrap lg:flex-nowrap justify-between items-start gap-6">
        
        <div className="max-w-75">
          <div className="flex items-center gap-3 w-44 h-8 cursor-pointer" onClick={() => handleScroll("top")}>
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
            <li><button onClick={() => handleScroll("top")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الرئيسية</button></li>
            <li><button onClick={() => handleScroll("features")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">المميزات</button></li>
            <li><button onClick={() => handleScroll("pricing")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الباقات</button></li>
          </ul>
        </div>

        {/* ================= SUPPORT ================= */}
        <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">الدعم والمعلومات</h2>
          <ul className="space-y-3">
            <li><button onClick={() => handleScroll("features")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">عن الأكاديمية</button></li>
            <li><button onClick={() => handleScroll("faq")} className="text-primary hover:text-[#12C6B0] transition-colors duration-300">الأسئلة الشائعة</button></li>
          </ul>
        </div>

        {/* ================= SOCIAL ================= */}
        {(contactSettings?.email || contactSettings?.whatsappNumber) && (
          <div>
            <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">تواصل معنا</h2>
            <div className="space-y-3">
              {contactSettings.email && (
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="flex items-center gap-2 text-[#123C91] hover:text-[#12C6B0]"
                  dir="ltr"
                >
                  <MdEmail size={20} className="shrink-0" />
                  <span>{contactSettings.email}</span>
                </a>
              )}
              {contactSettings.whatsappNumber && (
                <a
                  href={whatsappLink(contactSettings.whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#123C91] hover:text-[#25D366]"
                  dir="ltr"
                >
                  <FaWhatsapp size={20} className="shrink-0 text-[#25D366]" />
                  <span>{contactSettings.whatsappNumber}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* ================= SOCIAL ================= */}
        {!!socialLinks.length && <div>
          <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937] mb-5">تابعنا</h2>
          <div className="flex max-w-52 flex-wrap gap-3">
            {socialLinks.map((link) => { const meta = SOCIAL_META[link.platform]; const Icon = meta.icon; return <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={meta.label} title={meta.label} className="grid size-10 place-items-center rounded-xl bg-white text-[#123C91] shadow-sm ring-1 ring-[#D6E3F2] transition hover:-translate-y-0.5 hover:bg-[#123C91] hover:text-white"><Icon size={19} /></a>; })}
          </div>
        </div>}
      </div>

      <div className="mt-12 pt-8 text-center border-t border-[#1F293733]">
        <p className="text-[16px] text-[#123C91] font-normal">
          © 2026 الأكاديمية. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
