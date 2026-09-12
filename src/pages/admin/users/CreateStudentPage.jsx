import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { AuthContext } from "../../../context/AuthContext";
import {
  createStudent,
  getAllSubjects,
  getCountries,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
} from "../../../services/APIService";
import { adminApiErrorMessage, apiList, idOf, nameOf } from "../../../utils/adminSubscription";

const emptyForm = {
  fullName: "", username: "", email: "", phone: "", password: "",
  passwordConfirm: "", countryCode: "", curriculum: "", stage: "", grade: "",
  studyLanguage: "", birthDate: "", preferredSubjects: [],
};

const Field = ({ label, required, error, children }) => (
  <label className="block text-sm text-[#374151]">
    <span className="mb-1.5 block font-medium">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);
const inputClass = "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-[#123C91]";

export default function CreateStudentPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [countries, setCountries] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    Promise.all([getCountries(), getCurriculums()]).then(([countryRes, curriculumRes]) => {
      setCountries(apiList(countryRes, ["countries"]));
      setCurriculums(apiList(curriculumRes, ["curriculums"]));
    }).catch(() => toast.error("تعذر تحميل بيانات النموذج"));
  }, []);

  const country = useMemo(() => countries.find((item) => idOf(item) === form.countryCode || item.code === form.countryCode), [countries, form.countryCode]);
  const availableCurriculums = curriculums.filter((item) => {
    const linked = idOf(item.country);
    return !linked || linked === idOf(country);
  });

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };
  const selectCurriculum = async (value) => {
    setForm((current) => ({ ...current, curriculum: value, stage: "", grade: "", preferredSubjects: [] }));
    setStages([]); setGrades([]); setSubjects([]);
    if (value) getCurriculumStages(value).then((res) => setStages(apiList(res, ["stages"])));
  };
  const selectStage = async (value) => {
    setForm((current) => ({ ...current, stage: value, grade: "", preferredSubjects: [] }));
    setGrades([]); setSubjects([]);
    if (value) getStageGrades(value).then((res) => setGrades(apiList(res, ["grades"])));
  };
  const selectGrade = async (value) => {
    setForm((current) => ({ ...current, grade: value, preferredSubjects: [] }));
    setSubjects([]);
    if (value) getAllSubjects({ grade: value }).then((res) => setSubjects(apiList(res, ["subjects"])));
  };

  const submit = async (event) => {
    event.preventDefault();
    const required = ["fullName", "username", "password", "passwordConfirm", "countryCode", "curriculum", "stage", "grade"];
    const nextErrors = Object.fromEntries(required.filter((key) => !form[key]).map((key) => [key, "هذا الحقل مطلوب"]));
    if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = "كلمتا المرور غير متطابقتين";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "" && (!Array.isArray(value) || value.length)));
      const response = await createStudent(payload);
      const data = response.data?.data || response.data;
      setCreated({ studentId: data.studentId, name: form.fullName });
      toast.success("تم إنشاء الطالب بنجاح");
    } catch (error) {
      const bodyErrors = error.response?.data?.errors;
      if (bodyErrors && typeof bodyErrors === "object") setErrors(bodyErrors);
      toast.error(adminApiErrorMessage(error, "تعذر إنشاء الطالب"));
    } finally { setSubmitting(false); }
  };

  if (user?.role !== "super-admin") return <Navigate to="/admin/users" replace />;

  return <AdminLayout><Breadcrumbs homeTo="/admin-dashboard" /><main dir="rtl" className="p-3 sm:p-6 font-['IBM_Plex_Sans_Arabic']">
    <h1 className="text-xl font-semibold text-[#123C91]">إنشاء طالب</h1>
    <p className="mt-1 text-sm text-[#575F69]">إنشاء حساب وملف طالب مدرسي جديد.</p>
    {created ? <section className="mt-6 rounded-2xl border border-green-200 bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-green-700">تم إنشاء الطالب بنجاح</h2>
      <p className="mt-2 text-sm text-gray-600">{created.name}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button className="rounded-xl bg-[#123C91] px-5 py-2.5 text-white" onClick={() => navigate(`/admin/subscriptions/add?studentId=${created.studentId}`)}>إنشاء اشتراك</button>
        <button className="rounded-xl border px-5 py-2.5" onClick={() => navigate("/admin/users")}>تم</button>
      </div>
    </section> : <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">
      {[["fullName","الاسم الكامل","text"],["username","اسم المستخدم","text"],["email","البريد الإلكتروني","email"],["phone","رقم الهاتف","tel"],["password","كلمة المرور","password"],["passwordConfirm","تأكيد كلمة المرور","password"]].map(([key,label,type]) => <Field key={key} label={label} required={["fullName","username","password","passwordConfirm"].includes(key)} error={errors[key]}><input className={inputClass} type={type} value={form[key]} onChange={(e) => change(key,e.target.value)} /></Field>)}
      <Field label="الدولة" required error={errors.countryCode}><select className={inputClass} value={form.countryCode} onChange={(e) => { change("countryCode",e.target.value); setForm((c)=>({...c,curriculum:"",stage:"",grade:"",preferredSubjects:[]})); }}><option value="">اختر الدولة</option>{countries.map((c)=><option key={idOf(c)} value={c.code || c.countryCode}>{nameOf(c)}</option>)}</select></Field>
      <Field label="المنهج" required error={errors.curriculum}><select className={inputClass} value={form.curriculum} onChange={(e)=>selectCurriculum(e.target.value)}><option value="">اختر المنهج</option>{availableCurriculums.map((c)=><option key={idOf(c)} value={idOf(c)}>{nameOf(c)}</option>)}</select></Field>
      <Field label="المرحلة" required error={errors.stage}><select className={inputClass} value={form.stage} onChange={(e)=>selectStage(e.target.value)} disabled={!form.curriculum}><option value="">اختر المرحلة</option>{stages.map((s)=><option key={idOf(s)} value={idOf(s)}>{nameOf(s)}</option>)}</select></Field>
      <Field label="الصف" required error={errors.grade}><select className={inputClass} value={form.grade} onChange={(e)=>selectGrade(e.target.value)} disabled={!form.stage}><option value="">اختر الصف</option>{grades.map((g)=><option key={idOf(g)} value={idOf(g)}>{nameOf(g)}</option>)}</select></Field>
      <Field label="لغة الدراسة"><select className={inputClass} value={form.studyLanguage} onChange={(e)=>change("studyLanguage",e.target.value)}><option value="">غير محدد</option><option value="ar">العربية</option><option value="en">الإنجليزية</option><option value="fr">الفرنسية</option></select></Field>
      <Field label="تاريخ الميلاد"><input className={inputClass} type="date" value={form.birthDate} onChange={(e)=>change("birthDate",e.target.value)} /></Field>
      <Field label="المواد المفضلة"><select multiple className={`${inputClass} h-28 py-2`} value={form.preferredSubjects} onChange={(e)=>change("preferredSubjects",Array.from(e.target.selectedOptions, o=>o.value))} disabled={!form.grade}>{subjects.map((s)=><option key={idOf(s)} value={idOf(s)}>{nameOf(s)}</option>)}</select></Field>
      <div className="flex items-end gap-3"><button disabled={submitting} className="h-11 rounded-xl bg-[#123C91] px-6 text-white disabled:opacity-50">{submitting ? "جاري الإنشاء..." : "إنشاء الطالب"}</button><button type="button" className="h-11 rounded-xl border px-6" onClick={()=>navigate("/admin/users")}>إلغاء</button></div>
    </form>}
  </main></AdminLayout>;
}
