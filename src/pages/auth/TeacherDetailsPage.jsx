import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  completeTeacherProfile,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getAllSubjects,
} from "../../services/APIService";

// Single-select dropdown
const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
}) => {
  const display = (o) => {
    if (typeof o === "object" && o !== null)
      return o.name?.ar || o.name?.en || o.name || "";
    return o.name ?? o;
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#1F2937]">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full h-12 px-4 appearance-none rounded-xl border border-[#1F293733] bg-[#F9FAFA] text-[14px] outline-none cursor-pointer focus:border-[#123C91] transition-colors disabled:opacity-50"
        >
          <option value="" disabled>
            {disabled ? "جاري التحميل..." : placeholder}
          </option>
          {Array.isArray(options) &&
            options.map((o) => (
              <option key={o.id ?? o} value={o.id ?? o}>
                {display(o)}
              </option>
            ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
        />
      </div>
    </div>
  );
};

// Multi-select chips field
const MultiSelectField = ({
  label,
  options = [],
  selected,
  onChange,
  placeholder,
  disabled,
}) => {
  const display = (o) => {
    if (typeof o === "object" && o !== null)
      return o.name?.ar || o.name?.en || o.name || "";
    return o.name ?? o;
  };

  const toggle = (option) => {
    const ids = option.ids ?? [option.id ?? option];
    const allSelected = ids.every((id) => selected.includes(id));
    onChange(
      allSelected
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])],
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#1F2937]">{label}</label>
      <div
        className={`min-h-12 px-3 py-2 rounded-xl border border-[#1F293733] bg-[#F9FAFA] flex flex-wrap gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {disabled && (
          <span className="text-[14px] text-[#9CA3AF] self-center">
            جاري التحميل...
          </span>
        )}
        {!disabled && options.length === 0 && (
          <span className="text-[14px] text-[#9CA3AF] self-center">
            {placeholder}
          </span>
        )}
        {!disabled &&
          options.map((o) => {
            const id = o.id ?? o;
            const ids = o.ids ?? [id];
            const active = ids.every((subjectId) => selected.includes(subjectId));
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(o)}
                className={`px-3 py-1 rounded-lg text-[13px] font-medium border transition-colors ${
                  active
                    ? "bg-[#123C91] text-white border-[#123C91]"
                    : "bg-white text-[#6B7280] border-[#1F293733] hover:border-[#123C91]"
                }`}
              >
                {display(o)}
              </button>
            );
          })}
      </div>
    </div>
  );
};

const subjectName = (subject) =>
  subject?.name?.ar || subject?.name?.en || subject?.name || "";

const groupSubjectsByName = (items) => {
  const groups = new Map();
  items.forEach((subject) => {
    const id = subject.id ?? subject._id;
    const name = subjectName(subject).trim();
    if (!id || !name) return;
    const key = name.toLocaleLowerCase("ar");
    const existing = groups.get(key);
    if (existing) existing.ids.push(id);
    else groups.set(key, { ...subject, id, ids: [id] });
  });
  return [...groups.values()];
};

// Main page
const TeacherDetailsPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { user, setUser } = useContext(AuthContext);
  console.log("token:", localStorage.getItem("token"));
  console.log("user:", localStorage.getItem("user"));

  const [submitting, setSubmitting] = useState(false);
  const [loadingCurricula, setLoadingCurricula] = useState(true);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [curricula, setCurricula] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    curriculum: "",
    stage: "",
    grades: [],
    subjects: [],
    experienceYears: "",
  });

  const [fileName, setFileName] = useState("");
  const [fileObj, setFileObj] = useState(null);

  // Load curricula once
  useEffect(() => {
    getCurriculums()
      .then((res) => setCurricula(res.data?.data || res.data || []))
      .catch(() => toast.error("فشل تحميل المناهج"))
      .finally(() => setLoadingCurricula(false));
  }, []);

  // Load stages when curriculum changes
  useEffect(() => {
    if (!form.curriculum) {
      setStages([]);
      setGrades([]);
      setSubjects([]);
      return;
    }
    setLoadingStages(true);
    setStages([]);
    setGrades([]);
    setSubjects([]);
    setForm((p) => ({ ...p, stage: "", grades: [], subjects: [] }));

    getCurriculumStages(form.curriculum)
      .then((res) => setStages(res.data?.data || res.data || []))
      .catch(() => toast.error("فشل تحميل المراحل"))
      .finally(() => setLoadingStages(false));
  }, [form.curriculum]);

  // Load grades when stage changes
  useEffect(() => {
    if (!form.stage) {
      setGrades([]);
      setSubjects([]);
      return;
    }
    setLoadingGrades(true);
    setGrades([]);
    setSubjects([]);
    setForm((p) => ({ ...p, grades: [], subjects: [] }));

    getStageGrades(form.stage)
      .then((res) => setGrades(res.data?.data || res.data || []))
      .catch(() => toast.error("فشل تحميل الصفوف"))
      .finally(() => setLoadingGrades(false));
  }, [form.stage]);

  // Load subjects when grades change
  useEffect(() => {
    if (!form.grades.length) {
      setSubjects([]);
      return;
    }
    setLoadingSubjects(true);
    setSubjects([]);
    setForm((p) => ({ ...p, subjects: [] }));

    Promise.all(
      form.grades.map((gradeId) =>
        getAllSubjects({ grade: gradeId })
          .then((res) => res.data?.data || res.data || [])
          .catch(() => []),
      ),
    )
      .then((results) => {
        const merged = results.flat();
        setSubjects(groupSubjectsByName(merged));
      })
      .finally(() => setLoadingSubjects(false));
  }, [form.grades]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.curriculum ||
      !form.stage ||
      !form.grades.length ||
      !form.subjects.length
    ) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("language", "ar");
      payload.append("curriculum", form.curriculum);
      if (form.experienceYears) {
        payload.append("experienceYears", String(Number(form.experienceYears)));
      }
      form.grades.forEach((gradeId) => payload.append("grades", gradeId));
      form.subjects.forEach((subjectId) => payload.append("subjects", subjectId));
      if (fileObj) payload.append("cv", fileObj);

      const res = await completeTeacherProfile(payload);

      // ✅ لو الـ API رجّع user محدّث فيه status، احفظه
      const updatedUser = res.data?.data || res.data?.user;

      if (updatedUser && updatedUser.status) {
        // الـ backend رجّع user object كامل
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        // الـ backend مش بيرجع user — نحدّث الـ status يدوياً
        const patched = { ...user, status: "pending" };
        setUser(patched);
        localStorage.setItem("user", JSON.stringify(patched));
      }

      navigate("/pending");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full mx-auto px-1 py-8" dir="rtl">
        <h2
          className="text-[26px] font-bold mb-2 text-[#1F2937]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          أكمل بيانات حسابك
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-6">
          نحتاج بعض التفاصيل قبل مراجعة حسابك
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Curriculum */}
          <SelectField
            label="المنهج"
            name="curriculum"
            value={form.curriculum}
            onChange={handleChange}
            options={curricula}
            placeholder="اختر المنهج"
            disabled={loadingCurricula}
          />

          {/* Stage */}
          <SelectField
            label="المرحلة الدراسية"
            name="stage"
            value={form.stage}
            onChange={handleChange}
            options={stages}
            placeholder={form.curriculum ? "اختر المرحلة" : "اختر المنهج أولاً"}
            disabled={!form.curriculum || loadingStages}
          />

          {/* Grades */}
          <MultiSelectField
            label="الصفوف الدراسية"
            options={grades}
            selected={form.grades}
            onChange={(val) =>
              setForm((p) => ({ ...p, grades: val, subjects: [] }))
            }
            placeholder={form.stage ? "اختر الصفوف" : "اختر المرحلة أولاً"}
            disabled={!form.stage || loadingGrades}
          />

          {/* Subjects */}
          <MultiSelectField
            label="المواد التي تدرّسها"
            options={subjects}
            selected={form.subjects}
            onChange={(val) => setForm((p) => ({ ...p, subjects: val }))}
            placeholder={
              form.grades.length ? "اختر المواد" : "اختر الصفوف أولاً"
            }
            disabled={!form.grades.length || loadingSubjects}
          />

          {/* Experience years */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1F2937]">
              سنوات الخبرة
            </label>
            <input
              type="number"
              name="experienceYears"
              placeholder="مثال: 5"
              min="0"
              value={form.experienceYears}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-[#1F293733] bg-[#F9FAFA] text-[14px] outline-none focus:border-[#123C91] transition-colors"
            />
          </div>

          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1F2937]">
              المستندات{" "}
              <span className="text-[#9CA3AF] font-normal">(اختياري)</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-4 border-dashed border-2 border-[#1F293733] rounded-xl flex items-center justify-center gap-2 text-[14px] text-[#6B7280] hover:border-[#123C91] hover:text-[#123C91] transition-colors"
            >
              <Upload size={16} />
              {fileName || "ارفع مستنداتك هنا"}
            </button>
            {fileName && (
              <div className="flex items-center justify-between bg-[#F0F4FF] rounded-lg px-3 py-2">
                <span className="text-[13px] text-[#123C91] truncate max-w-[80%]">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFileName("");
                    setFileObj(null);
                  }}
                >
                  <X size={14} className="text-[#6B7280]" />
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                setFileName(e.target.files[0]?.name || "");
                setFileObj(e.target.files[0] || null);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-[#123C91] text-white rounded-xl font-semibold text-[15px] hover:bg-[#0f3278] transition-colors disabled:opacity-60 mt-2"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            {submitting ? "جاري الإرسال..." : "تقديم الطلب"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TeacherDetailsPage;
