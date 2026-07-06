import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  getSubjects,
  completeStudentProfile,
  getAccountState,
} from "../../services/APIService";

const normalizeSubjects = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((s) => ({
    id: s.id ?? s._id,
    name: s.name?.ar || s.name?.en || s.name || "—",
  }));
};

// ── Adjust these two to match your actual router/backend contract ──
const DASHBOARD_ROUTE = "/student-dashboard";
const PENDING_ROUTE = "/register/success";

// Reads the approval status out of an /auth/account-state response.
const extractStatus = (res) => {
  const raw =
    res?.data?.status ??
    res?.data?.data?.status ??
    res?.data?.registrationStatus ??
    res?.data?.data?.registrationStatus ??
    "";
  return String(raw).toLowerCase();
};

const isApprovedStatus = (status) =>
  ["approved", "active", "accepted"].includes(status);

const StudentSubjectsPages = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    email,
    role,
    academicLevel,
    countryId,
    curriculumId,
    stageId,
    gradeId,
    studentType,
  } = state || {};

  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [studyLanguage, setStudyLanguage] = useState("ar");
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gradeId || !stageId || !curriculumId) {
      navigate("/select-account-type");
      return;
    }

    const load = async () => {
      setLoadingSubjects(true);
      try {
        const res = await getSubjects({
          curriculum: curriculumId,
          stage: stageId,
          grade: gradeId,
        });
        setSubjects(normalizeSubjects(res.data));
      } catch {
        toast.error("تعذر تحميل المواد، حاول مرة أخرى");
      } finally {
        setLoadingSubjects(false);
      }
    };
    load();
  }, [gradeId, stageId, curriculumId, navigate]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error("يرجى اختيار مادة واحدة على الأقل");
      return;
    }
    if (!birthDate) {
      toast.error("يرجى إدخال تاريخ الميلاد");
      return;
    }

    setLoading(true);
    try {
      // studentType جاية من المرحلة الدراسية اللي اخترها المستخدم في
      // أول خطوة بالتسجيل (RegisterForm)، مش زرار منفصل.
      await completeStudentProfile({
        birthDate,
        studyLanguage,
        curriculum: curriculumId,
        stage: stageId,
        grade: gradeId,
        studentType: studentType || "school",
        preferredSubjects: selected,
      });

      // نتأكد بعد كده هل الحساب متوافق عليه ولا لسه pending.
      let approved = false;
      try {
        const stateRes = await getAccountState();
        approved = isApprovedStatus(extractStatus(stateRes));
      } catch (err) {
        console.log(
          "account-state error:",
          err.response?.status,
          err.response?.data,
        );
      }

      toast.success("تم إنشاء الحساب بنجاح!");

      if (approved) {
        navigate(DASHBOARD_ROUTE);
      } else {
        navigate(PENDING_ROUTE, { state: { role: "student" } });
      }
    } catch (err) {
      console.log(
        "completeStudentProfile error:",
        err.response?.status,
        err.response?.data,
      );
      toast.error(err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative w-full max-w-175 mx-auto p-6" dir="rtl">
        <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
        <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">
          مرحباً بك...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              تاريخ الميلاد
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] text-[#1F2937]"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              لغة الدراسة
            </label>
            <div className="grid grid-cols-2 gap-0 border border-[#1F293733] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setStudyLanguage("ar")}
                className={`h-12 text-[14px] font-medium transition-colors ${
                  studyLanguage === "ar"
                    ? "bg-[#123C91] text-white [&_svg]:text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setStudyLanguage("en")}
                className={`h-12 text-[14px] font-medium transition-colors border-r border-[#1F293733] ${
                  studyLanguage === "en"
                    ? "bg-[#123C91] text-white [&_svg]:text-white"
                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                }`}
              >
                إنجليزي
              </button>
            </div>
          </div>
        </div>

        <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
          المواد التي ترغب في الالتحاق بها
        </label>

        {loadingSubjects ? (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-[#9CA3AF]">جاري تحميل المواد...</p>
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-[14px] text-[#9CA3AF] mb-6">
            لا توجد مواد متاحة لهذا الصف حالياً
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-8">
            {subjects.map((subject) => {
              const isSelected = selected.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggle(subject.id)}
                  className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-colors ${
                    isSelected
                      ? "bg-[#123C91] text-white [&_svg]:text-white border-[#123C91]"
                      : "bg-white text-[#1F2937] border-[#1F293733] hover:border-[#123C91]"
                  }`}
                >
                  {subject.name}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || loadingSubjects}
          className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </button>

        <div className="flex items-center justify-center gap-1 pt-4">
          <span className="text-[14px] text-[#1F2937]">لديك حساب؟</span>
          <button
            onClick={() => navigate("/login")}
            className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentSubjectsPages;
