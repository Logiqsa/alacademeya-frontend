import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { saveTeacherDetails } from "../../services/authService";

const TeacherDetailsPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^1[0125][0-9]{8}$/.test(phone)) {
      toast.error("يرجى إدخال رقم هاتف مصري صحيح");
      return;
    }
    setLoading(true);
    try {
      await saveTeacherDetails({ phone: `+20${phone}` });
      navigate("/pending", { state: { role: "teacher" } });
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
          معلومات إضافية
        </h2>
        <p className="text-[13px] text-[#6B7280] mb-6">
          نحتاج رقم هاتفك للتواصل معك بعد مراجعة طلبك
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
              رقم الهاتف
            </label>
            <div
              dir="ltr"
              className="flex w-full h-12 rounded-xl overflow-hidden border border-[#1F293733] bg-[#F9FAFA] focus-within:border-[#123C91] transition-colors"
            >
              <div className="w-14 shrink-0 flex items-center justify-center bg-[#E5E7EB] text-[#9CA3AF] text-[13px] border-r border-[#1F293733]">
                +20
              </div>
              <input
                type="tel"
                maxLength={11}
                inputMode="numeric"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                className="flex-1 h-full px-3 bg-transparent outline-none text-[14px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-[#123C91] text-white font-medium text-[16px] disabled:opacity-70"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            {loading ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TeacherDetailsPage;