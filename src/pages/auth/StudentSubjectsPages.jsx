import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { getSubjects, saveStudentInterests } from "../../services/authService";

const normalizeSubjects = (raw) => {
    const list = Array.isArray(raw) ? raw : (raw?.data || []);
    return list.map((s) => ({
        id: s.id ?? s._id,
        name: s.name?.ar || s.name?.en || s.name || "—",
    }));
};

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
        serviceType,
    } = state || {};

    const [subjects, setSubjects] = useState([]);
    const [selected, setSelected] = useState([]);
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
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

   const handleSubmit = async () => {
    if (selected.length === 0) {
        toast.error("يرجى اختيار مادة واحدة على الأقل");
        return;
    }
    setLoading(true);
    try {
        const selectedSubjects = subjects.filter(s => selected.includes(s.id));
        navigate("/register/success", { 
            state: { 
                role: "student",
                interests: selectedSubjects // ✅ بعت المواد المختارة في الـ state
            } 
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <AuthLayout>
            <div className="relative w-full max-w-175 mx-auto p-6" dir="rtl">
                <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
                <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">مرحباً بك...</h2>

                <label className="block text-[13px] font-medium text-[#1F2937] mb-2">
                    المواد المفضلة
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
                                            ? "bg-[#123C91] text-white border-[#123C91]"
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
                    className="w-full h-14 rounded-lg bg-[#123C91] text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
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