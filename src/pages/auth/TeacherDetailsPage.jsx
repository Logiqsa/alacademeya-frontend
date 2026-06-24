import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Upload } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
// import {
//   completeTeacherProfile,
//   getCurriculums,
//   getCurriculumStages,
//   getAllSubjects,
// } from "../../services/authService";

const SelectField = ({ label, name, value, onChange, options = [], placeholder, disabled }) => {
  const getDisplayValue = (o) => {
    // If the API returns an object for name, extract the Arabic property
    if (typeof o === 'object' && o !== null) {
      return o.name?.ar || o.name?.en || o.name || JSON.stringify(o);
    }
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
          <option value="" disabled>{disabled ? "جاري التحميل..." : placeholder}</option>
          {Array.isArray(options) && options.map((o) => (
            <option key={o.id ?? o} value={o.id ?? o}>
              {getDisplayValue(o)}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
      </div>
    </div>
  );
};

const TeacherDetailsPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCurricula, setLoadingCurricula] = useState(true);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [curricula, setCurricula] = useState([]);
  const [stages, setStages] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileObj, setFileObj] = useState(null);
  const [form, setForm] = useState({ curriculum: "", stage: "", subject: "", experience: "" });

  useEffect(() => {
    getCurriculums().then(res => setCurricula(res.data?.data || res.data || [])).catch(() => toast.error("فشل تحميل المناهج")).finally(() => setLoadingCurricula(false));
  }, []);

  useEffect(() => {
    if (!form.curriculum) { setStages([]); setSubjects([]); return; }
    setLoadingStages(true);
    getCurriculumStages(form.curriculum).then(res => setStages(res.data?.data || res.data || [])).catch(() => toast.error("فشل تحميل المراحل")).finally(() => setLoadingStages(false));
  }, [form.curriculum]);

  useEffect(() => {
    if (!form.stage) { setSubjects([]); return; }
    setLoadingSubjects(true);
    getAllSubjects({ stage: form.stage, curriculum: form.curriculum }).then(res => setSubjects(res.data?.data || res.data || [])).catch(() => toast.error("فشل تحميل المواد")).finally(() => setLoadingSubjects(false));
  }, [form.stage]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append("curriculum", form.curriculum);
    payload.append("stage", form.stage);
    payload.append("subject", form.subject);
    if (form.experience) payload.append("experience", form.experience);
    if (fileObj) payload.append("documents", fileObj);

    try {
      await completeTeacherProfile(payload);
      navigate("/register/pending", { state: { role: "teacher" } });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto px-6 py-8" dir="rtl">
        <h2 className="text-[26px] font-bold mb-6">مرحباً بك...</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectField label="المنهج" name="curriculum" value={form.curriculum} onChange={handleChange} options={curricula} placeholder="اختر المنهج" disabled={loadingCurricula} />
          <SelectField label="المرحلة" name="stage" value={form.stage} onChange={handleChange} options={stages} placeholder="اختر المرحلة" disabled={!form.curriculum || loadingStages} />
          <SelectField label="المادة" name="subject" value={form.subject} onChange={handleChange} options={subjects} placeholder="اختر المادة" disabled={!form.stage || loadingSubjects} />
          <input name="experience" placeholder="سنوات الخبرة" value={form.experience} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border border-[#1F293733]" />
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-5 border-dashed border-2 rounded-xl">{fileName || "ارفع الملفات"}</button>
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => { setFileName(e.target.files[0]?.name); setFileObj(e.target.files[0]); }} />
          <button type="submit" disabled={submitting} className="w-full h-14 bg-[#123C91] text-white rounded-xl">
            {submitting ? "جاري الإرسال..." : "تقديم الطلب"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TeacherDetailsPage;