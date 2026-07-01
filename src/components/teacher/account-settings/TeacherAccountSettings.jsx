import React, { useState, useRef, useEffect, useContext } from 'react';
import { Pencil, Eye, EyeOff, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyProfile,
  updateMyProfile,
  getCountries,
  getCurriculums,
  getAllGrades,
  getSubjects,
} from '../../../services/authService';
import { AuthContext } from '../../../context/AuthContext';

const LANG = 'ar'; // change to dynamic locale if you support i18n switching

// بيرجع نص الاسم سواء جاي كـ string عادي أو كـ object {ar, en}
const pickName = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[LANG] || val.ar || val.en || '';
};

// بيدمج شكل الريسبونس الفعلي:
// { success, data: { user: {...}, curriculums: [...], grades: [...], subjects: [...], language, status, ... } }
// في object واحد مسطّح اسمه "teacher" نقدر نستخدمه بسهولة في الكومبوننت
const extractUser = (resData) => {
  if (!resData) return null;
  const root = resData?.data || resData;
  const user = root?.user || root;
  if (!user) return null;

  // ملحوظة: root.id هو ID بتاع الـ Teacher/Parent profile document، مختلف عن user.id
  // (ID بتاع الـ User document). بنحتفظ بيهم منفصلين عشان محدش يتكتب فوق التاني بالغلط.
  const { user: _omit, id: profileId, ...restWithoutId } = root || {};

  return {
    ...user,
    ...restWithoutId, // language, status, certificates, rating, profileSlug, etc.
    profileId,
    curriculums: root?.curriculums || user.curriculums || [],
    grades: root?.grades || user.grades || [],
    subjects: root?.subjects || user.subjects || [],
  };
};

// بيستخرج array الأوبشنز من أشكال الريسبونس المختلفة اللي ممكن يرجعها الباك إند
const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root?.items || root || [];
  return Array.isArray(raw) ? raw : [];
};

// بيوحد شكل العنصر (id / label) مهما كان اسم الحقول جاي من الباك إند، وبيدعم الاسم البايلينجوال
const normalizeOption = (item) => ({
  id: item._id || item.id || item.value || item.code,
  label: pickName(item.name) || item.title || item.label || item.nameAr || item.name_ar || '',
});

const LANGUAGE_OPTIONS = [
  { id: 'ar', label: 'العربية' },
  { id: 'en', label: 'الإنجليزية' },
  { id: 'fr', label: 'الفرنسية' },
];
const EXPERIENCE_OPTIONS = [
  { id: '1', label: 'أقل من سنة' },
  { id: '3', label: '1 – 3 سنوات' },
  { id: '5', label: '3 – 5 سنوات' },
  { id: '5y', label: '5 سنين' },
  { id: '8', label: '5 – 10 سنوات' },
  { id: '10', label: 'أكثر من 10 سنوات' },
];
const PASSWORD_RULES = [
  { id: 'len', label: 'الحد الأدنى 8 أحرف', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'حرف كبير واحد على الأقل', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'حرف صغير واحد على الأقل', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'رقم واحد على الأقل', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'رمز خاص واحد على الأقل', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'nospace', label: 'لا يحتوي على مسافات', test: (p) => p.length > 0 && !/\s/.test(p) },
];

const SectionHeader = ({ title, subtitle, editing, onEditClick }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <h3 className="text-[16px] font-bold text-(--text-dark)">{title}</h3>
      {!editing && onEditClick && (
        <button type="button" onClick={onEditClick} className="flex items-center gap-1.5 text-[14px] font-medium text-(--primary) hover:text-(--primary-dark) transition-colors shrink-0">
          <Pencil size={14} />
          تعديل البيانات
        </button>
      )}
    </div>
    {subtitle && <p className="text-xs sm:text-sm text-(--text-light)">{subtitle}</p>}
  </div>
);

const ActionRow = ({ saving, onCancel, confirmLabel = 'حفظ التعديلات', error }) => (
  <>
    {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    <div className="flex items-center gap-3 mt-5">
      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:bg-(--primary-dark) transition-colors flex items-center gap-2 disabled:opacity-60">
        {saving && <Loader2 size={14} className="animate-spin" />}
        {confirmLabel}
      </button>
      <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-(--border-light) text-(--text-dark) text-sm font-medium hover:bg-(--bg-section) transition-colors">
        إلغاء
      </button>
    </div>
  </>
);

const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-[14px] mb-1 text-(--text-light)">{label}</span>
    <span className="text-sm font-semibold text-(--text-dark) wrap-break-word">{value || '—'}</span>
  </div>
);

const ViewGrid = ({ children }) => (
  <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">{children}</div>
);

const EditBox = ({ children }) => (
  <div className="border border-x-4 border-[#123C9180] rounded-xl p-5 grid grid-cols-1 gap-5">{children}</div>
);

const TextInput = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
    <input type={type} value={value ?? ''} onChange={onChange} className="w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-[14px] text-(--text-dark) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20 transition-all" />
  </div>
);

const LockedPhoneField = ({ label, value }) => (
  <div>
    <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
    <div dir="ltr" className="w-full h-11 rounded-lg border border-(--border-light) bg-(--bg-section) flex items-stretch overflow-hidden opacity-80 cursor-not-allowed">
      <span className="flex-1 px-3 flex items-center text-sm text-(--text-light) truncate">{value || '—'}</span>
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[16px] text-(--text-light) mb-1.5">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} dir="ltr" className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-[14px] text-(--text-dark) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary) focus:ring-opacity-20 transition-all" />
        <button type="button" tabIndex={-1} onClick={() => setShow((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-light)">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

const PasswordRulesList = ({ password }) => (
  <div>
    <p className="text-xs text-(--text-light) mb-2">يجب أن تتضمن كلمة المرور:</p>
    <ul className="text-xs space-y-1 list-disc pr-4">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password || '');
        return <li key={rule.id} className={met ? 'text-(--primary) font-medium' : 'text-(--text-light)'}>{rule.label}</li>;
      })}
    </ul>
  </div>
);

const Dropdown = ({ label, value, options, onChange, placeholder = 'اختر', disabled, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const isDisabled = disabled || loading;
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
      <button type="button" onClick={() => !isDisabled && setOpen((o) => !o)} disabled={isDisabled} className={`w-full h-11 px-3.5 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between transition-colors ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-(--primary)'}`}>
        <span className={selected ? 'text-(--text-dark)' : 'text-(--text-light)'}>
          {loading ? 'جاري التحميل...' : selected ? selected.label : placeholder}
        </span>
        {loading ? <Loader2 size={14} className="animate-spin text-(--text-light)" /> : <ChevronDown size={16} className={`text-(--text-light) transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && !isDisabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
          {options.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-(--text-light)">لا توجد بيانات</li>
          )}
          {options.map((opt) => (
            <li key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }} className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-(--bg-section) text-(--text-dark)">{opt.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// دروبداون اختيار متعدد عام - بنستخدمه للمواد، الصفوف، والمناهج
const MultiSelectDropdown = ({ label, value = [], options, loading, onChange, placeholder = 'اختر', emptyLabel = 'لا توجد بيانات' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  const selectedLabels = options.filter((o) => value.includes(o.id)).map((o) => o.label).join('، ');
  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-(--text-light) mb-1.5">{label}</label>
      <button type="button" onClick={() => !loading && setOpen((o) => !o)} className="w-full min-h-11 px-3.5 py-2 rounded-lg border border-(--border-light) bg-(--bg-section) text-sm text-right flex items-center justify-between gap-2 transition-colors cursor-pointer hover:border-(--primary)">
        <span className={selectedLabels ? 'text-(--text-dark)' : 'text-(--text-light)'}>
          {loading ? 'جاري التحميل...' : selectedLabels || placeholder}
        </span>
        {loading ? <Loader2 size={14} className="animate-spin text-(--text-light)" /> : <ChevronDown size={16} className={`text-(--text-light) transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && !loading && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-(--white) border border-(--border-light) rounded-lg shadow-lg">
          {options.length === 0 && (
            <li className="px-3.5 py-2.5 text-sm text-(--text-light)">{emptyLabel}</li>
          )}
          {options.map((opt) => {
            const checked = value.includes(opt.id);
            return (
              <li key={opt.id} onClick={() => toggle(opt.id)} className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-(--bg-section) text-(--text-dark) flex items-center justify-between">
                {opt.label}
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-(--primary) border-(--primary)' : 'border-(--border-light)'}`}>
                  {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const TeacherPersonalCard = ({ teacher, countryOptions, loadingCountries, onSaved }) => {
  const buildForm = () => ({
    fullName: teacher.fullName || '',
    username: teacher.username || '',
    email: teacher.email || '',
    countryId: teacher.country?._id || teacher.country?.id || teacher.country || '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);

  useEffect(() => { setForm(buildForm()); }, [teacher]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => { setForm(buildForm()); setError(''); setEditing(false); };

  // بيدور على اسم الدولة من القائمة عشان نعرضها في وضع العرض (لإن الريسبونس بيرجع ID بس)
  const countryLabel =
    pickName(teacher.country?.name) ||
    countryOptions.find((c) => c.id === (teacher.country?._id || teacher.country?.id || teacher.country))?.label ||
    '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, username: form.username, email: form.email, country: form.countryId };
      await updateMyProfile(payload);
      toast.success('تم تعديل البيانات بنجاح');
      await onSaved(); // بيعمل fetch كامل من السيرفر بدل ما نخمن شكل الريسبونس
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تعديل البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6">
      <SectionHeader title="البيانات الشخصية" subtitle="هذا القسم يحتوي على بياناتك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة." editing={editing} onEditClick={() => setEditing(true)} />
      {!editing ? (
        <ViewGrid>
          <ViewField label="الاسم الكامل" value={teacher.fullName} />
          <ViewField label="اسم المستخدم" value={teacher.username} />
          <ViewField label="البريد الإلكتروني" value={teacher.email} />
          <ViewField label="رقم الهاتف" value={teacher.phone} />
          <ViewField label="الدولة" value={countryLabel} />
        </ViewGrid>
      ) : (
        <EditBox>
          <TextInput label="الاسم بالكامل" value={form.fullName} onChange={handleChange('fullName')} />
          <TextInput label="اسم المستخدم" value={form.username} onChange={handleChange('username')} />
          <TextInput label="البريد الإلكتروني" value={form.email} onChange={handleChange('email')} type="email" />
          <Dropdown
            label="الدولة"
            value={form.countryId}
            options={countryOptions}
            loading={loadingCountries}
            onChange={(id) => setForm((prev) => ({ ...prev, countryId: id }))}
            placeholder="اختر الدولة"
          />
          <LockedPhoneField label="رقم الهاتف" value={teacher.phone} />
        </EditBox>
      )}
      {editing && (
        <>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">تغيير البريد الإلكتروني سيتطلب تسجيل الدخول مرة أخرى.</p>
          <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تعديل البيانات" />
        </>
      )}
    </form>
  );
};

const TeacherProfessionalCard = ({ teacher, onSaved }) => {
  // "curriculums" و "grades" و "subjects" كلها arrays في رد السيرفر، فبنعاملهم كلهم
  // كاختيار متعدد بشكل متسق، بدل ما نفترض إن فيه اختيار واحد بس (ده كان بيضيع باقي الصفوف عند الحفظ).
  const buildForm = () => ({
    studyLanguage: teacher.language || 'ar',
    curriculumIds: (teacher.curriculums || []).map((c) => c._id || c.id),
    gradeIds: (teacher.grades || []).map((g) => g._id || g.id),
    experience: teacher.experience || '',
    subjects: (teacher.subjects || []).map((s) => s._id || s.id),
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);

  const [curriculumOptions, setCurriculumOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => { setForm(buildForm()); }, [teacher]);

  // بنحمل المناهج والصفوف والمواد مرة واحدة بمجرد فتح وضع التعديل
  useEffect(() => {
    if (!editing) return;
    if (curriculumOptions.length === 0) {
      setLoadingCurriculums(true);
      getCurriculums()
        .then((res) => setCurriculumOptions(extractList(res.data).map(normalizeOption)))
        .catch(() => toast.error('تعذر تحميل قائمة المناهج'))
        .finally(() => setLoadingCurriculums(false));
    }
    if (gradeOptions.length === 0) {
      setLoadingGrades(true);
      getAllGrades()
        .then((res) => setGradeOptions(extractList(res.data).map(normalizeOption)))
        .catch(() => toast.error('تعذر تحميل المراحل الدراسية'))
        .finally(() => setLoadingGrades(false));
    }
    if (subjectOptions.length === 0) {
      setLoadingSubjects(true);
      getSubjects()
        .then((res) => setSubjectOptions(extractList(res.data).map(normalizeOption)))
        .catch(() => toast.error('تعذر تحميل المواد الدراسية'))
        .finally(() => setLoadingSubjects(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const handleCancel = () => { setForm(buildForm()); setError(''); setEditing(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // ملحوظة: أسماء الحقول هنا (curriculums / grades) متطابقة مع أسماء الحقول
      // في رد الـ GET. لو الباك إند فعليًا مستني اسم مختلف (زي curriculum/grade مفرد)
      // محتاج تتأكد من فريق الباك إند وتظبط الأسماء دي.
      const payload = {
        language: form.studyLanguage,
        curriculums: form.curriculumIds,
        grades: form.gradeIds,
        experience: form.experience,
        subjects: form.subjects,
      };
      await updateMyProfile(payload);
      toast.success('تم تعديل البيانات بنجاح');
      await onSaved();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تعديل البيانات');
    } finally {
      setSaving(false);
    }
  };

  const langLabel = (id) => LANGUAGE_OPTIONS.find((l) => l.id === id)?.label || '—';
  const experienceLabel = (id) => EXPERIENCE_OPTIONS.find((o) => o.id === id)?.label || '—';
  const joinedNames = (arr) => (arr?.length ? arr.map((i) => pickName(i.name)).filter(Boolean).join('، ') : '—');

  return (
    <form onSubmit={handleSubmit} className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6">
      <SectionHeader title="البيانات الأكاديمية" subtitle="يتضمن هذا القسم بياناتك التعليمية والمهنية الأساسية، والتي تُستخدم لإدارة الحصص والمجموعات الدراسية والتواصل مع الطلاب داخل المنصة." editing={editing} onEditClick={() => setEditing(true)} />
      {!editing ? (
        <ViewGrid>
          <ViewField label="اللغة" value={langLabel(teacher.language)} />
          <ViewField label="المنهج الدراسي" value={joinedNames(teacher.curriculums)} />
          <ViewField label="المرحلة الدراسية" value={joinedNames(teacher.grades)} />
          <ViewField label="سنوات الخبرة" value={experienceLabel(teacher.experience)} />
          <ViewField label="المواد" value={joinedNames(teacher.subjects)} />
        </ViewGrid>
      ) : (
        <EditBox>
          <Dropdown label="اللغة" value={form.studyLanguage} options={LANGUAGE_OPTIONS} onChange={(id) => setForm((prev) => ({ ...prev, studyLanguage: id }))} placeholder="اختر اللغة" />
          <MultiSelectDropdown
            label="المنهج الدراسي"
            value={form.curriculumIds}
            options={curriculumOptions}
            loading={loadingCurriculums}
            onChange={(ids) => setForm((prev) => ({ ...prev, curriculumIds: ids }))}
            placeholder="اختر المنهج الدراسي"
            emptyLabel="لا توجد مناهج"
          />
          <MultiSelectDropdown
            label="المرحلة الدراسية"
            value={form.gradeIds}
            options={gradeOptions}
            loading={loadingGrades}
            onChange={(ids) => setForm((prev) => ({ ...prev, gradeIds: ids }))}
            placeholder="اختر المرحلة الدراسية"
            emptyLabel="لا توجد مراحل"
          />
          <Dropdown label="سنوات الخبرة" value={form.experience} options={EXPERIENCE_OPTIONS} onChange={(id) => setForm((prev) => ({ ...prev, experience: id }))} placeholder="اختر سنوات الخبرة" />
          <MultiSelectDropdown
            label="المواد الدراسية"
            value={form.subjects}
            options={subjectOptions}
            loading={loadingSubjects}
            onChange={(ids) => setForm((prev) => ({ ...prev, subjects: ids }))}
            placeholder="اختر المواد الدراسية"
            emptyLabel="لا توجد مواد"
          />
        </EditBox>
      )}
      {editing && <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تعديل البيانات" />}
    </form>
  );
};

const SecurityCard = ({ lastPasswordChange }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ currentPassword: '', password: '', passwordConfirm: '' });

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => { setForm({ currentPassword: '', password: '', passwordConfirm: '' }); setError(''); setEditing(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.password) { setError('أدخل كلمة المرور الجديدة'); return; }
    if (form.password !== form.passwordConfirm) { setError('كلمة المرور وتأكيدها غير متطابقين'); return; }
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) { setError('كلمة المرور الجديدة لا تستوفي جميع الشروط المطلوبة'); return; }
    setSaving(true);
    try {
      await updateMyProfile({ currentPassword: form.currentPassword, password: form.password, passwordConfirm: form.passwordConfirm });
      toast.success('تم تغيير كلمة المرور بنجاح');
      handleCancel();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) p-6">
      <SectionHeader title="الأمان وكلمة المرور" subtitle="تغيير كلمة المرور وإعدادات الأمان" editing={editing} onEditClick={() => setEditing(true)} />
      {!editing ? (
        <div className="border border-x-4 border-[#123C9180] rounded-xl p-5">
          <p className="text-xs text-(--text-light) mb-1.5">كلمة المرور</p>
          <p className="text-sm font-semibold text-(--text-dark) mb-1 tracking-widest">••••••••</p>
          <p className="text-xs text-(--text-light)">{lastPasswordChange}</p>
        </div>
      ) : (
        <EditBox>
          <PasswordField label="كلمة المرور الحالية" value={form.currentPassword} onChange={handleChange('currentPassword')} />
          <PasswordField label="كلمة المرور الجديدة" value={form.password} onChange={handleChange('password')} />
          <PasswordRulesList password={form.password} />
          <PasswordField label="تأكيد كلمة المرور الجديدة" value={form.passwordConfirm} onChange={handleChange('passwordConfirm')} />
        </EditBox>
      )}
      {editing && <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تغيير كلمة المرور" />}
    </form>
  );
};

// دايرة فيها أول حرف من اسم المعلم بدل رفع صورة
const AvatarInitial = ({ name }) => {
  const initial = (name || '').trim().charAt(0).toUpperCase() || '؟';
  return (
    <div className="w-16 h-16 rounded-full shrink-0 bg-(--primary) text-white flex items-center justify-center text-2xl font-bold select-none">
      {initial}
    </div>
  );
};

const TeacherAccountSettings = () => {
  const { user: ctxUser, updateUser } = useContext(AuthContext) || {};
  const [teacher, setTeacher] = useState(ctxUser || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // قائمة الدول بنحملها مرة واحدة هنا عشان نستخدمها في العرض والتعديل مع
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await getMyProfile();
      const userData = extractUser(res.data);
      if (userData) {
        setTeacher(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        updateUser?.(userData);
      }
    } catch (err) {
      setLoadError(err.response?.data?.message || 'تعذر تحميل بيانات الحساب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    setLoadingCountries(true);
    getCountries()
      .then((res) => setCountryOptions(extractList(res.data).map(normalizeOption)))
      .catch(() => toast.error('تعذر تحميل قائمة الدول'))
      .finally(() => setLoadingCountries(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20" dir="rtl"><Loader2 size={28} className="animate-spin text-(--primary)" /></div>;
  }
  if (loadError || !teacher) {
    return <div className="text-center py-20 text-red-500" dir="rtl">{loadError || 'تعذر تحميل البيانات'}</div>;
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="max-w-7xl mx-auto p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">إعدادات الحساب</h1>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">إدارة معلومات حسابك وتفضيلاتك</p>
      </div>

      <div className="bg-(--white) border border-(--border-light) rounded-2xl shadow-(--shadow) overflow-hidden">
        <div className="p-6 flex items-center gap-4">
          <AvatarInitial name={teacher.fullName} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-(--text-dark) truncate">{teacher.fullName}</h2>
            <p className="text-sm text-(--text-light) truncate">{teacher.email}</p>
          </div>
        </div>
      </div>

      <TeacherPersonalCard teacher={teacher} countryOptions={countryOptions} loadingCountries={loadingCountries} onSaved={fetchProfile} />
      <TeacherProfessionalCard teacher={teacher} onSaved={fetchProfile} />
      <SecurityCard lastPasswordChange={teacher.lastPasswordChange || 'آخر تحديث غير متاح'} />
    </div>
  );
};

export default TeacherAccountSettings;