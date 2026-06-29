import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import {
    getCurriculums,
    getCurriculumStages,
    getStageGrades,
    completeStudentProfile,
    getAccountState,
} from "../../services/authService";


const Dropdown = ({ label, placeholder, value, onChange, options, loading, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find((o) => o.id === value);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const inputClass =
        "w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] transition-colors";

    return (
        <div ref={ref} className="relative">
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">{label}</label>
            <button
                type="button"
                onClick={() => { if (!loading && !disabled) setOpen(!open); }}
                disabled={loading || disabled}
                className={`${inputClass} flex items-center justify-between cursor-pointer text-right ${!value ? "text-[#9CA3AF]" : "text-[#1F2937]"
                    } ${loading || disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                <span>
                    {loading
                        ? "جاري التحميل..."
                        : selected
                            ? selected.label
                            : placeholder}
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
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setOpen(false); }}
                                className={`px-4 py-2.5 cursor-pointer text-[14px] hover:bg-[#F0F4FC] transition-colors ${value === opt.id ? "text-[#123C91] font-medium bg-[#F0F4FC]" : "text-[#1F2937]"
                                    }`}
                            >
                                {opt.label}
                            </li>
                        ))}
                        {options.length === 0 && (
                            <li className="px-4 py-3 text-[13px] text-[#9CA3AF]">لا توجد خيارات</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// ── Adjust these two to match your actual router/backend contract ──
// Where an approved student should land.
const DASHBOARD_ROUTE = "/dashboard";
// Where a student who is still awaiting approval should land.
const PENDING_ROUTE = "/register/pending";

// Reads the approval status out of an /auth/account-state response.
// Tries a couple of common shapes ({ status } or { data: { status } })
// since the exact field name/casing wasn't confirmed against the live
// backend response — adjust this one function if the real field differs.
const extractStatus = (res) => {
    const raw =
        res?.data?.status ??
        res?.data?.data?.status ??
        res?.data?.profileStatus ??
        res?.data?.data?.profileStatus ??
        "";
    return String(raw).toLowerCase();
};

const isApprovedStatus = (status) =>
    ["approved", "active", "accepted"].includes(status);

const StudentDetailsPages = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const { email, role, academicLevel, countryId } = state || {};

   
    const [serviceType, setServiceType] = useState("private");
    const [curriculumId, setCurriculumId] = useState("");
    const [stageId, setStageId] = useState("");
    const [gradeId, setGradeId] = useState("");

    // ── API data ──
    const [curriculums, setCurriculums] = useState([]);
    const [stages, setStages] = useState([]);
    const [grades, setGrades] = useState([]);

    // ── Loading flags ──
    const [loadingCurriculums, setLoadingCurriculums] = useState(true);
    const [loadingStages, setLoadingStages] = useState(false);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const [loading, setLoading] = useState(false);

    const toLabel = (nameObj) => nameObj?.ar || nameObj?.en || "—";

  
    useEffect(() => {
        if (!countryId) {
            console.log("countryId is empty:", countryId);
            return;
        }
        console.log("loading curriculums for countryId:", countryId);
        setLoadingCurriculums(true);
        getCurriculums(countryId)
            .then((res) => {
                console.log("curriculums raw response:", JSON.stringify(res.data));
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                console.log("curriculums list:", list);
                setCurriculums(list.map((c) => ({ id: c.id, label: toLabel(c.name) })));
            })
            .catch((err) => {
                console.log("curriculums error:", err.response?.status, err.response?.data);
            })
            .finally(() => setLoadingCurriculums(false));
    }, [countryId]);

    
    useEffect(() => {
        if (!curriculumId) { setStages([]); setStageId(""); setGrades([]); setGradeId(""); return; }
        setLoadingStages(true);
        setStageId("");
        setGrades([]);
        setGradeId("");
        getCurriculumStages(curriculumId)
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                // Filter stages to match the student's academicLevel
                const levelMap = { primary: "primary", middle: "preparatory", high: "secondary" };
                const keyword = levelMap[academicLevel] || "";
                const filtered = keyword
                    ? list.filter((s) =>
                        (s.name?.en || "").toLowerCase().includes(keyword) ||
                        (s.name?.ar || "").includes(keyword === "primary" ? "ابتدائ" : keyword === "preparatory" ? "إعداد" : "ثانو")
                    )
                    : list;
                setStages((filtered.length ? filtered : list).map((s) => ({ id: s.id, label: toLabel(s.name) })));
            })
            .catch(() => toast.error("تعذر تحميل المراحل"))
            .finally(() => setLoadingStages(false));
    }, [curriculumId, academicLevel]);

    // 3. Load grades when stage changes
    useEffect(() => {
        if (!stageId) { setGrades([]); setGradeId(""); return; }
        setLoadingGrades(true);
        setGradeId("");
        getStageGrades(stageId)
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setGrades(list.map((g) => ({ id: g.id, label: toLabel(g.name) })));
            })
            .catch(() => toast.error("تعذر تحميل الصفوف"))
            .finally(() => setLoadingGrades(false));
    }, [stageId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!curriculumId) { toast.error("يرجى اختيار المنهج الدراسي"); return; }
        if (!stageId) { toast.error("يرجى اختيار المرحلة الدراسية"); return; }
        if (!gradeId) { toast.error("يرجى اختيار الصف الدراسي"); return; }

        setLoading(true);
        try {
            // 1) Actually persist the profile — this was missing before,
            // which is why nothing reached the database.
            await completeStudentProfile({
                email,
                role,
                academicLevel,
                countryId,
                curriculumId,
                stageId,
                gradeId,
                serviceType,
            });

            // 2) Find out whether this student account is already approved.
            let approved = false;
            try {
                const stateRes = await getAccountState();
                approved = isApprovedStatus(extractStatus(stateRes));
            } catch (err) {
                console.log("account-state error:", err.response?.status, err.response?.data);
            }

            toast.success("تم حفظ بيانات الطالب بنجاح!");

            if (approved) {
                navigate(DASHBOARD_ROUTE);
            } else {
                navigate(PENDING_ROUTE, {
                    state: { email, role, academicLevel, countryId, curriculumId, stageId, gradeId, serviceType },
                });
            }
        } catch (err) {
            console.log("completeStudentProfile error:", err.response?.status, err.response?.data);
            toast.error(err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="relative w-full max-w-175 mx-auto p-6">
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
                                className={`h-12 text-[14px] font-medium transition-colors ${serviceType === "private"
                                    ? "bg-[#123C91] text-white"
                                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                                    }`}
                            >
                                خاص
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceType("group")}
                                className={`h-12 text-[14px] font-medium transition-colors border-r border-[#1F293733] ${serviceType === "group"
                                    ? "bg-[#123C91] text-white"
                                    : "bg-white text-[#6B7280] hover:bg-[#F9FAFA]"
                                    }`}
                            >
                                مجموعة
                            </button>
                        </div>
                    </div>

                    {/* Curriculum */}
                    <Dropdown
                        label="المنهج الدراسي"
                        placeholder="اختر المنهج"
                        value={curriculumId}
                        onChange={setCurriculumId}
                        options={curriculums}
                        loading={loadingCurriculums}
                    />

                    {/* Stage */}
                    <Dropdown
                        label="المرحلة الدراسية"
                        placeholder="اختر المرحلة"
                        value={stageId}
                        onChange={setStageId}
                        options={stages}
                        loading={loadingStages}
                        disabled={!curriculumId}
                    />

                    {/* Grade */}
                    <Dropdown
                        label="الصف الدراسي"
                        placeholder="اختر الصف"
                        value={gradeId}
                        onChange={setGradeId}
                        options={grades}
                        loading={loadingGrades}
                        disabled={!stageId}
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

export default StudentDetailsPages;