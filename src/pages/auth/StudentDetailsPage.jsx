import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

// ─── Static data ────────────────────────────────────────────────────────────

const GRADES_BY_LEVEL = {
    primary: [
        { value: "1", label: "الصف الأول الابتدائي" },
        { value: "2", label: "الصف الثاني الابتدائي" },
        { value: "3", label: "الصف الثالث الابتدائي" },
        { value: "4", label: "الصف الرابع الابتدائي" },
        { value: "5", label: "الصف الخامس الابتدائي" },
        { value: "6", label: "الصف السادس الابتدائي" },
    ],
    middle: [
        { value: "7", label: "الصف الأول الإعدادي" },
        { value: "8", label: "الصف الثاني الإعدادي" },
        { value: "9", label: "الصف الثالث الإعدادي" },
    ],
    high: [
        { value: "10", label: "الصف الأول الثانوي" },
        { value: "11", label: "الصف الثاني الثانوي" },
        { value: "12", label: "الصف الثالث الثانوي" },
    ],
};

const LANGUAGES = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "الإنجليزية" },
    { value: "fr", label: "الفرنسية" },
];

const CURRICULA = [
    { value: "egyptian", label: "المنهج المصري" },
    { value: "british", label: "المنهج البريطاني" },
    { value: "american", label: "المنهج الأمريكي" },
    { value: "ig", label: "IGCSE" },
    { value: "ib", label: "IB" },
    { value: "french", label: "المنهج الفرنسي" },
    { value: "other", label: "منهج آخر" },
];

// ─── Simple custom select ────────────────────────────────────────────────────

const CustomSelect = ({ label, value, onChange, options, placeholder }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative">
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] flex items-center justify-between transition-colors"
            >
                <span className={selected ? "text-[#1F2937]" : "text-[#9CA3AF]"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#1F293733] rounded-lg shadow-lg z-50 overflow-hidden">
                    <ul className="max-h-48 overflow-y-auto">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-[#F0F4FC] transition-colors ${
                                    value === opt.value ? "text-[#123C91] font-medium bg-[#F0F4FC]" : "text-[#1F2937]"
                                }`}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const StudentDetailsPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const { email, role, academicLevel, countryId } = state || {};

    const [serviceType, setServiceType] = useState("private"); // private | group
    const [grade, setGrade] = useState("");
    const [language, setLanguage] = useState("");
    const [curriculum, setCurriculum] = useState("");
    const [loading, setLoading] = useState(false);

    const gradeOptions = GRADES_BY_LEVEL[academicLevel] || GRADES_BY_LEVEL.high;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!grade) { toast.error("يرجى اختيار الصف الدراسي"); return; }
        if (!language) { toast.error("يرجى اختيار لغة التعلم المفضلة"); return; }
        if (!curriculum) { toast.error("يرجى اختيار المنهج الدراسي"); return; }

        setLoading(true);
        try {
            // TODO: send to API if needed
            // await saveStudentDetails({ grade, language, curriculum, serviceType });

            navigate("/register/subjects", {
                state: {
                    email,
                    role,
                    academicLevel,
                    countryId,
                    grade,
                    language,
                    curriculum,
                    serviceType,
                },
            });
        } catch {
            toast.error("حدث خطأ، حاول مرة أخرى");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md mx-auto p-8" dir="rtl">
                <img src={logo} alt="logo" className="w-44 h-8 mb-5 cursor-pointer" />
                <h2
                    className="text-[24px] font-bold mb-6 text-[#1F2937]"
                    style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                    مرحباً بك...
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Service type toggle */}
                    <div>
                        <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                            اختر نوع الخدمة
                        </label>
                        <div className="grid grid-cols-2 gap-0 border border-[#1F293733] rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setServiceType("private")}
                                className={`h-12 text-[14px] font-medium transition-colors ${
                                    serviceType === "private"
                                        ? "bg-[#123C91] text-white"
                                        : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                                }`}
                            >
                                خاص
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType("group")}
                                className={`h-12 text-[14px] font-medium transition-colors border-r border-[#1F293733] ${
                                    serviceType === "group"
                                        ? "bg-[#123C91] text-white"
                                        : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                                }`}
                            >
                                مجموعة
                            </button>
                        </div>
                    </div>

                    {/* Grade */}
                    <CustomSelect
                        label="الصف الدراسي"
                        value={grade}
                        onChange={setGrade}
                        options={gradeOptions}
                        placeholder="اختر الصف الدراسي"
                    />

                    {/* Language */}
                    <CustomSelect
                        label="لغة التعلم المفضلة"
                        value={language}
                        onChange={setLanguage}
                        options={LANGUAGES}
                        placeholder="اختر لغة التعلم"
                    />

                    {/* Curriculum */}
                    <CustomSelect
                        label="المنهج الدراسي"
                        value={curriculum}
                        onChange={setCurriculum}
                        options={CURRICULA}
                        placeholder="اختر المنهج"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-lg bg-[#123C91] text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
                        style={{ fontFamily: "Tajawal, sans-serif" }}
                    >
                        {loading ? "جاري الحفظ..." : "التالي"}
                    </button>

                    <div className="flex items-center justify-center gap-1 pt-1">
                        <span className="text-[14px] text-[#1F2937]">لديك حساب؟</span>
                        <Link
                            to="/login"
                            className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
                        >
                            تسجيل دخول
                        </Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
};

export default StudentDetailsPage;