import { useContext, useEffect, useState } from "react";
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
  const toggleSubject = (subjectId) => {
    change(
      "preferredSubjects",
      form.preferredSubjects.includes(subjectId)
        ? form.preferredSubjects.filter((id) => id !== subjectId)
        : [...form.preferredSubjects, subjectId],
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    const required = ["fullName", "username", "password", "passwordConfirm", "countryCode", "curriculum", "stage", "grade"];
    const nextErrors = Object.fromEntries(required.filter((key) => !form[key]).map((key) => [key, "هذا الحقل مطلوب"]));
    if (form.password !== form.passwordConfirm) nextErrors.passwordConfirm = "كلمتا المرور غير متطابقتين";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(
          ([, value]) =>
            value !== "" && (!Array.isArray(value) || value.length),
        ),
      );
      const response = await createStudent(payload);
      const data = response.data?.data || response.data;
      const createdStudent = {
        studentId: data.studentId,
        userId: data.userId,
        name: form.fullName,
        form: { ...form },
      };
      setCreated(createdStudent);
      toast.success("تم إنشاء الطالب بنجاح");
    } catch (error) {
      const bodyErrors = error.response?.data?.errors;
      if (bodyErrors && typeof bodyErrors === "object") setErrors(bodyErrors);
      toast.error(adminApiErrorMessage(error, "تعذر إنشاء الطالب"));
    } finally { setSubmitting(false); }
  };

  if (user?.role !== "super-admin") return <Navigate to="/admin/users" replace />;

  return <AdminLayout><Breadcrumbs homeTo="/admin-dashboard" /><main dir="rtl" className="mx-auto w-full max-w-6xl p-3 font-['IBM_Plex_Sans_Arabic'] sm:p-6">
    <div className="rounded-2xl bg-gradient-to-l from-[#123C91] to-[#1D55B3] px-5 py-4 text-white shadow-sm sm:px-6">
      <h1 className="text-xl font-bold sm:text-2xl">إنشاء طالب جديد</h1>
      <p className="mt-1 text-sm text-blue-100">أدخل بيانات الحساب والبيانات الدراسية للطالب.</p>
    </div>
    {created ? <div className="mt-6 rounded-2xl border border-green-200 bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-green-700">تم إنشاء الطالب بنجاح</h2>
      <p className="mt-2 text-sm text-gray-600">{created.name}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button className="rounded-xl bg-[#123C91] px-5 py-2.5 text-white" onClick={() => navigate(`/admin/subscriptions/add?studentId=${created.studentId}`)}>إنشاء اشتراك</button>
        <button className="rounded-xl border px-5 py-2.5" onClick={() => navigate("/admin/users")}>تم</button>
      </div>
    </div> : <form onSubmit={submit} className="mt-3 space-y-3">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 border-b border-gray-100 pb-2"><h2 className="font-bold text-[#1F2937]">بيانات الحساب</h2><p className="mt-0.5 text-xs text-[#8C9198]">البيانات الأساسية وبيانات تسجيل الدخول</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[["fullName","الاسم الكامل","text"],["username","اسم المستخدم","text"],["email","البريد الإلكتروني","email"],["phone","رقم الهاتف","tel"],["password","كلمة المرور","password"],["passwordConfirm","تأكيد كلمة المرور","password"]].map(([key,label,type]) => <Field key={key} label={label} required={["fullName","username","password","passwordConfirm"].includes(key)} error={errors[key]}><input className={inputClass} type={type} value={form[key]} onChange={(e) => change(key,e.target.value)} /></Field>)}
        </div>
      </div>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 border-b border-gray-100 pb-2"><h2 className="font-bold text-[#1F2937]">البيانات الدراسية</h2><p className="mt-0.5 text-xs text-[#8C9198]">حدد المنهج والمرحلة والصف بشكل مستقل عن دولة الإقامة</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="دولة الإقامة" required error={errors.countryCode}><select className={inputClass} value={form.countryCode} onChange={(e) => change("countryCode",e.target.value)}><option value="">اختر دولة الإقامة</option>{countries.map((c)=><option key={idOf(c)} value={c.code || c.countryCode}>{nameOf(c)}</option>)}</select></Field>
          <Field label="المنهج" required error={errors.curriculum}><select className={inputClass} value={form.curriculum} onChange={(e)=>selectCurriculum(e.target.value)}><option value="">اختر المنهج</option>{curriculums.map((c)=><option key={idOf(c)} value={idOf(c)}>{nameOf(c)}</option>)}</select></Field>
          <Field label="المرحلة" required error={errors.stage}><select className={inputClass} value={form.stage} onChange={(e)=>selectStage(e.target.value)} disabled={!form.curriculum}><option value="">اختر المرحلة</option>{stages.map((s)=><option key={idOf(s)} value={idOf(s)}>{nameOf(s)}</option>)}</select></Field>
          <Field label="الصف" required error={errors.grade}><select className={inputClass} value={form.grade} onChange={(e)=>selectGrade(e.target.value)} disabled={!form.stage}><option value="">اختر الصف</option>{grades.map((g)=><option key={idOf(g)} value={idOf(g)}>{nameOf(g)}</option>)}</select></Field>
          <Field label="لغة الدراسة"><select className={inputClass} value={form.studyLanguage} onChange={(e)=>change("studyLanguage",e.target.value)}><option value="">غير محدد</option><option value="ar">العربية</option><option value="en">الإنجليزية</option><option value="fr">الفرنسية</option></select></Field>
          <Field label="تاريخ الميلاد"><input className={inputClass} type="date" value={form.birthDate} onChange={(e)=>change("birthDate",e.target.value)} /></Field>
        </div>
        <div className="mt-4"><p className="text-sm font-medium text-[#374151]">المواد المفضلة</p><p className="mt-0.5 text-xs text-[#8C9198]">يمكنك اختيار أكثر من مادة</p>
          {!form.grade ? <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">اختر الصف أولًا لعرض المواد</div> : subjects.length ? <div className="mt-3 flex flex-wrap gap-2.5">{subjects.map((subject) => { const subjectId=idOf(subject), selected=form.preferredSubjects.includes(subjectId); return <button key={subjectId} type="button" aria-pressed={selected} onClick={()=>toggleSubject(subjectId)} className={`min-w-28 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${selected ? "border-[#123C91] bg-[#EAF1FF] text-[#123C91] shadow-sm" : "border-gray-200 bg-white text-[#575F69] hover:border-[#123C91]/50 hover:bg-gray-50"}`}>{nameOf(subject)}{selected && <span className="mr-2">✓</span>}</button>})}</div> : <div className="mt-3 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-400">لا توجد مواد متاحة لهذا الصف</div>}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:justify-end"><button type="button" className="h-11 rounded-xl border border-gray-200 px-7 text-[#575F69] hover:bg-gray-50" onClick={()=>navigate("/admin/users")}>إلغاء</button><button disabled={submitting} className="h-11 rounded-xl bg-[#123C91] px-8 font-medium text-white shadow-sm hover:bg-[#0F3279] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "جاري الإنشاء..." : "إنشاء الطالب"}</button></div>
    </form>}
  </main></AdminLayout>;
}
