import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getMyProfile,
} from "../../services/APIService";

const Dropdown = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  loading,
  disabled,
}) => {
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
      <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          if (!loading && !disabled) setOpen(!open);
        }}
        disabled={loading || disabled}
        className={`${inputClass} flex items-center justify-between cursor-pointer text-right ${
          !value ? "text-[#9CA3AF]" : "text-[#1F2937]"
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
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`px-4 py-2.5 cursor-pointer text-[14px] hover:bg-[#F0F4FC] transition-colors ${
                  value === opt.id
                    ? "text-[#123C91] font-medium bg-[#F0F4FC]"
                    : "text-[#1F2937]"
                }`}
              >
                {opt.label}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-3 text-[13px] text-[#9CA3AF]">
                لا توجد خيارات
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const StudentDetailsPages = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const profileRefreshStarted = useRef(false);
  const canonicalUser = profileUser || user;

  const email = state?.email || canonicalUser?.email;
  const role = state?.role || canonicalUser?.role || "student";
  const academicLevel = state?.academicLevel || canonicalUser?.academicLevel;
  const countryId =
    state?.countryId ||
    canonicalUser?.country?.id ||
    canonicalUser?.country?._id ||
    canonicalUser?.country;
  const studentType = state?.studentType || canonicalUser?.studentType || "school";

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


  const toLabel = (nameObj) => nameObj?.ar || nameObj?.en || "—";

  useEffect(() => {
    if (
      profileRefreshStarted.current ||
      (user?.email && user?.academicLevel && user?.country)
    ) {
      return;
    }
    profileRefreshStarted.current = true;
    let active = true;
    getMyProfile()
      .then((response) => {
        if (!active) return;
        const data = response.data?.data || response.data;
        const freshUser = data?.user || data?.student || data;
        if (freshUser && typeof freshUser === "object") {
          const mergedUser = { ...user, ...freshUser };
          setProfileUser(mergedUser);
          updateUser?.(mergedUser);
        }
      })
      .catch(() => {
        // Existing form remains usable when profile refresh is unavailable.
      });
    return () => {
      active = false;
    };
  }, [updateUser, user]);

  useEffect(() => {
    getCurriculums()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCurriculums(list.map((c) => ({ id: c.id, label: toLabel(c.name) })));
      })
      .catch(() => toast.error("تعذر تحميل المناهج"))
      .finally(() => setLoadingCurriculums(false));
  }, []);

  useEffect(() => {
    if (!curriculumId) {
      setStages([]);
      setStageId("");
      setGrades([]);
      setGradeId("");
      return;
    }
    setLoadingStages(true);
    setStageId("");
    setGrades([]);
    setGradeId("");
    getCurriculumStages(curriculumId)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // Filter stages to match the student's academicLevel
        const levelMap = {
          primary: "primary",
          middle: "preparatory",
          high: "secondary",
        };
        const keyword = levelMap[academicLevel] || "";
        const filtered = keyword
          ? list.filter(
              (s) =>
                (s.name?.en || "").toLowerCase().includes(keyword) ||
                (s.name?.ar || "").includes(
                  keyword === "primary"
                    ? "ابتدائ"
                    : keyword === "preparatory"
                      ? "إعداد"
                      : "ثانو",
                ),
            )
          : list;
        setStages(
          (filtered.length ? filtered : list).map((s) => ({
            id: s.id,
            label: toLabel(s.name),
          })),
        );
      })
      .catch(() => toast.error("تعذر تحميل المراحل"))
      .finally(() => setLoadingStages(false));
  }, [curriculumId, academicLevel]);

  // 3. Load grades when stage changes
  useEffect(() => {
    if (!stageId) {
      setGrades([]);
      setGradeId("");
      return;
    }
    setLoadingGrades(true);
    setGradeId("");
    getStageGrades(stageId)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setGrades(list.map((g) => ({ id: g.id, label: toLabel(g.name) })));
      })
      .catch(() => toast.error("تعذر تحميل الصفوف"))
      .finally(() => setLoadingGrades(false));
  }, [stageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!curriculumId) {
      toast.error("يرجى اختيار المنهج الدراسي");
      return;
    }
    if (!stageId) {
      toast.error("يرجى اختيار المرحلة الدراسية");
      return;
    }
    if (!gradeId) {
      toast.error("يرجى اختيار الصف الدراسي");
      return;
    }

    // البيانات لسه ناقصة (preferredSubjects)، فمش بنبعت completeStudentProfile
    // هنا. بنجمع كل حاجة ونوديها لصفحة المواد المفضلة، وهي اللي هتبعت
    // الطلب النهائي بكل الحقول مع بعض.
    navigate("/register/subjects", {
      state: {
        email,
        role,
        academicLevel,
        countryId,
        curriculumId,
        stageId,
        gradeId,
        studentType,
      },
    });
  };

  return (
    <AuthLayout>
      <div className="relative w-full max-w-175 mx-auto p-6">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#123C91] hover:underline">
          <ArrowRight size={17} /> رجوع
        </button>
        <Link to="/">
          <img src={logo} alt="logo" className="w-44 h-8 mb-5 cursor-pointer" />
        </Link>
        <h2
          className="text-[24px] font-bold mb-6 text-[#1F2937]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          مرحباً بك...
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
            className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            التالي
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
