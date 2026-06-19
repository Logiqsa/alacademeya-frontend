import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { saveStudentInterests } from "../../services/authService";

const INTERESTS = [
  "الأكاديمية",
  "الاقتصاد",
  "الإدارة",
  "الهندسة",
  "الطب",
  "القانون",
  "التربية",
  "الفنون",
  "اللغات",
  "التقنية",
];

const StudentInterestsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (interest) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error("يرجى اختيار مجال واحد على الأقل");
      return;
    }
    setLoading(true);
    try {
      await saveStudentInterests({ interests: selected });
      navigate("/pending", { state: { role: "student" } });
    } catch {
      toast.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 flex flex-col" dir="rtl">
        <img src={logo} alt="logo" className="w-44 h-8 mb-5 cursor-pointer" />
        <h2
          className="text-[22px] font-bold text-[#1F2937] mb-1"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          اختر مجالات اهتمامك
        </h2>
        <p className="text-[13px] text-[#6B7280] mb-6">
          سيساعدنا ذلك في تخصيص تجربتك التعليمية
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {INTERESTS.map((item) => {
            const isSelected = selected.includes(item);
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-colors ${
                  isSelected
                    ? "bg-[#123C91] text-white border-[#123C91]"
                    : "bg-white text-[#1F2937] border-[#1F293733] hover:border-[#123C91]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-[#123C91] text-white font-medium text-[16px] disabled:opacity-70"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {loading ? "جاري الحفظ..." : "إتمام التسجيل"}
        </button>
      </div>
    </AuthLayout>
  );
};

export default StudentInterestsPage;