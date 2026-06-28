import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { getCurriculumStages, getStageGrades } from '../../../services/authService';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Pulls a displayable name off an API record, whatever shape it comes in
// ({ name: { ar, en } } or { name: "string" }).
function nameOf(obj) {
  if (!obj) return '';
  const n = obj.name;
  if (!n) return '';
  if (typeof n === 'string') return n;
  return n.ar || n.en || '';
}

// id of a field that might be a populated object ({ id, name }) or a bare id string.
function idOf(value) {
  if (!value) return '';
  if (typeof value === 'object') return value?.id ?? '';
  return value;
}

// Display label for a field that might be a populated object, an id string
// that matches something in `list`, or already a plain label string.
function resolveDisplay(value, list) {
  if (!value) return '—';
  if (typeof value === 'object') return nameOf(value) || value.id || '—';
  const match = list?.find((item) => item.id === value);
  if (match) return nameOf(match) || value;
  return value;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

function toInputDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

// Splits a stored phone number ("+201000123456") into the dial-code chip
// and the rest of the number, so the locked field can render them apart.
function splitPhone(phone, knownCode) {
  if (!phone) return { code: '', rest: '' };
  const clean = String(phone).trim();
  if (knownCode && clean.startsWith(knownCode)) {
    return { code: knownCode, rest: clean.slice(knownCode.length).trim() };
  }
  const m = clean.match(/^(\+\d{1,4})\s*(.*)$/);
  if (m) return { code: m[1], rest: m[2] };
  return { code: '', rest: clean };
}

const LANGUAGE_OPTIONS = [
  { id: 'ar', label: 'العربية' },
  { id: 'en', label: 'الإنجليزية' },
  { id: 'fr', label: 'الفرنسية' },
];
function langLabel(code) {
  return LANGUAGE_OPTIONS.find((l) => l.id === code)?.label || (code || '—');
}

const PASSWORD_RULES = [
  { id: 'len', label: 'الحد الأدنى 8 أحرف', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'حرف كبير واحد على الأقل', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'حرف صغير واحد على الأقل', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'رقم واحد على الأقل', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'رمز خاص واحد على الأقل', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'nospace', label: 'لا يحتوي على مسافات', test: (p) => p.length > 0 && !/\s/.test(p) },
];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, subtitle, editing, onEditClick }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-3 mb-0.5">
      <h3 className="text-base font-bold text-[var(--text-dark)]">{title}</h3>
      {!editing && onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors shrink-0"
        >
          <Pencil size={14} />
          تعديل البيانات
        </button>
      )}
    </div>
    {subtitle && <p className="text-xs sm:text-sm text-[var(--text-light)]">{subtitle}</p>}
  </div>
);

const ActionRow = ({ saving, onCancel, error, confirmLabel = 'حفظ التعديلات' }) => (
  <>
    {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    <div className="flex items-center gap-3 mt-5">
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 rounded-lg border border-[var(--border-light)] text-[var(--text-dark)] text-sm font-medium hover:bg-[var(--bg-section)] transition-colors"
      >
        إلغاء
      </button>
    </div>
  </>
);

/* ---- view mode: plain label/value, 2-col grid inside one bordered box ---- */
const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-xs text-[var(--text-light)]">{label}</span>
    <span className="text-sm font-semibold text-[var(--text-dark)] break-words">{value || '—'}</span>
  </div>
);

const ViewGrid = ({ children }) => (
  <div className="border border-[var(--border-light)] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
    {children}
  </div>
);

/* ---- edit mode: real inputs, single column, inside a primary-tinted box ---- */
const EditBox = ({ children }) => (
  <div className="border border-[var(--primary)]/40 rounded-xl p-5 grid grid-cols-1 gap-5">{children}</div>
);

const TextInput = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-xs text-[var(--text-light)] mb-1.5">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      className="w-full h-11 px-3.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-section)] text-sm text-[var(--text-dark)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition-all"
    />
  </div>
);

// Phone is never editable from here (changing it requires re-verification),
// so it always renders as a locked field with the dial-code chip.
const LockedPhoneField = ({ label, code, number }) => (
  <div>
    <label className="block text-xs text-[var(--text-light)] mb-1.5">{label}</label>
    <div
      dir="ltr"
      className="w-full h-11 rounded-lg border border-[var(--border-light)] bg-[var(--bg-section)] flex items-stretch overflow-hidden opacity-80 cursor-not-allowed"
    >
      {code && (
        <span className="px-3 flex items-center bg-[var(--border-light)] text-[var(--text-light)] text-sm shrink-0">
          {code}
        </span>
      )}
      <span className="flex-1 px-3 flex items-center text-sm text-[var(--text-light)] truncate">
        {number || '—'}
      </span>
    </div>
  </div>
);

const PasswordField = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs text-[var(--text-light)] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          dir="ltr"
          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-section)] text-sm text-[var(--text-dark)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

const PasswordRulesList = ({ password }) => (
  <div>
    <p className="text-xs text-[var(--text-light)] mb-2">يجب أن تتضمن كلمة المرور:</p>
    <ul className="text-xs space-y-1 list-disc pr-4">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password || '');
        return (
          <li key={rule.id} className={met ? 'text-[var(--primary)] font-medium' : 'text-[var(--text-light)]'}>
            {rule.label}
          </li>
        );
      })}
    </ul>
  </div>
);

/* ---- custom select dropdown (country / curriculum / stage / grade / language) ---- */
const Dropdown = ({ label, value, options, onChange, placeholder = 'اختر', loading, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDisabled = disabled || loading;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs text-[var(--text-light)] mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((o) => !o)}
        disabled={isDisabled}
        className={`w-full h-11 px-3.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-section)] text-sm text-right flex items-center justify-between transition-colors ${
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--primary)]'
        }`}
      >
        <span className={selected ? 'text-[var(--text-dark)]' : 'text-[var(--text-light)]'}>
          {loading ? 'جارٍ التحميل...' : selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-[var(--text-light)] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !isDisabled && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-[var(--white)] border border-[var(--border-light)] rounded-lg shadow-lg">
          {options.length === 0 && <li className="px-3.5 py-2.5 text-sm text-[var(--text-light)]">لا توجد عناصر</li>}
          {options.map((opt) => (
            <li
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-[var(--bg-section)] text-[var(--text-dark)]"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ================================================================== */
/* ParentProfileCard                                                   */
/* ================================================================== */
export const ParentProfileCard = ({ parent, onSave }) => {
  const buildForm = () => ({
    fullName: parent?.fullName || '',
    username: parent?.username || '',
    email: parent?.email || '',
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);

  useEffect(() => { setForm(buildForm()); }, [parent]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => { setForm(buildForm()); setError(''); setEditing(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, username: form.username, email: form.email };
      const changedSensitive = payload.email !== (parent?.email || '') || payload.username !== (parent?.username || '');
      await onSave(payload, changedSensitive);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const { code: phoneCode, rest: phoneRest } = splitPhone(parent?.phone);

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] p-6">
      <SectionHeader
        title="البيانات الشخصية"
        subtitle="هذا القسم يحتوي على بياناتك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField label="الاسم الكامل" value={parent?.fullName} />
          <ViewField label="اسم المستخدم" value={parent?.username} />
          <ViewField label="البريد الإلكتروني" value={parent?.email} />
          <ViewField label="رقم الهاتف" value={parent?.phone} />
        </ViewGrid>
      ) : (
        <EditBox>
          <TextInput label="الاسم بالكامل" value={form.fullName} onChange={handleChange('fullName')} />
          <TextInput label="اسم المستخدم" value={form.username} onChange={handleChange('username')} />
          <TextInput label="البريد الإلكتروني" value={form.email} onChange={handleChange('email')} type="email" />
          <LockedPhoneField label="رقم الهاتف" code={phoneCode} number={phoneRest} />
        </EditBox>
      )}

      {editing && (
        <>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
            تغيير البريد الإلكتروني أو اسم المستخدم سيتطلب تسجيل الدخول مرة أخرى.
          </p>
          <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تعديل البيانات" />
        </>
      )}
    </form>
  );
};

/* ================================================================== */
/* StudentPersonalCard                                                 */
/* ================================================================== */
export const StudentPersonalCard = ({ student, countries = [], loadingCountries, onSave }) => {
  const u = student?.user || {};

  const resolveCountryId = () => {
    if (!countries.length) return '';
    const byId = countries.find((c) => c.id === student?.country);
    if (byId) return byId.id;
    const byCode = countries.find((c) => c.code === student?.countryCode);
    return byCode?.id || '';
  };

  const buildForm = () => ({
    fullName: u.fullName || student?.fullName || '',
    username: student?.username || u.username || '',
    birthDate: toInputDate(student?.birthDate || u.birthDate),
    countryId: resolveCountryId(),
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(buildForm);

  useEffect(() => { setForm(buildForm()); }, [student, countries]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => { setForm(buildForm()); setError(''); setEditing(false); };

  const selectedCountry = countries.find((c) => c.id === form.countryId);
  const countryDisplay = (() => {
    const current = countries.find((c) => c.id === resolveCountryId());
    return current?.name || student?.countryCode || u.countryCode || '—';
  })();

  const { code: phoneCode, rest: phoneRest } = splitPhone(student?.phone || u.phone, selectedCountry?.phoneCode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { fullName: form.fullName, username: form.username };
      if (form.birthDate) payload.birthDate = form.birthDate;
      if (form.countryId && selectedCountry) {
        payload.country = selectedCountry.id;
        payload.countryCode = selectedCountry.code;
      }
      const changedSensitive = form.username !== (student?.username || u.username || '');
      await onSave(payload, changedSensitive);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] p-6">
      <SectionHeader
        title="البيانات الشخصية"
        subtitle="هذا القسم يحتوي على بيانات ابنك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField label="الاسم الكامل" value={u.fullName || student?.fullName} />
          <ViewField label="اسم المستخدم" value={student?.username || u.username} />
          <ViewField label="تاريخ الميلاد" value={formatDate(student?.birthDate || u.birthDate)} />
          <ViewField label="الدولة" value={countryDisplay} />
          <ViewField label="رقم الهاتف" value={student?.phone || u.phone} />
        </ViewGrid>
      ) : (
        <EditBox>
          <TextInput label="الاسم بالكامل" value={form.fullName} onChange={handleChange('fullName')} />
          <TextInput label="اسم المستخدم" value={form.username} onChange={handleChange('username')} />
          <TextInput label="تاريخ الميلاد" value={form.birthDate} onChange={handleChange('birthDate')} type="date" />
          <Dropdown
            label="الدولة"
            value={form.countryId}
            options={countries.map((c) => ({ id: c.id, label: c.name }))}
            onChange={(id) => setForm((prev) => ({ ...prev, countryId: id }))}
            loading={loadingCountries}
            placeholder="اختر الدولة"
          />
          <LockedPhoneField label="رقم الهاتف" code={phoneCode} number={phoneRest} />
        </EditBox>
      )}

      {editing && (
        <>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
            تغيير اسم المستخدم سيتطلب تسجيل الدخول مرة أخرى.
          </p>
          <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تعديل البيانات" />
        </>
      )}
    </form>
  );
};

/* ================================================================== */
/* StudentAcademicCard                                                 */
/* curriculum -> stage -> grade cascade, same lookups as registration. */
/* Field ORDER on screen matches the design (stage, grade, curriculum, */
/* language) even though the dependency runs curriculum -> stage ->    */
/* grade; the fetch effects key off form state, not render order, so   */
/* picking a new curriculum further down still refreshes the stage     */
/* list shown above it.                                                */
/* ================================================================== */
export const StudentAcademicCard = ({ student, curriculums = [], loadingCurriculums, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const buildForm = () => ({
    curriculumId: idOf(student?.curriculum),
    stageId: idOf(student?.stage),
    gradeId: idOf(student?.grade),
    studyLanguage: student?.studyLanguage || '',
  });

  const [form, setForm] = useState(buildForm);

  // student (tab) changed — reset everything and let the effects below refetch
  useEffect(() => {
    setForm(buildForm());
    setStages([]);
    setGrades([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  useEffect(() => {
    if (!form.curriculumId) { setStages([]); return; }
    let active = true;
    setLoadingStages(true);
    getCurriculumStages(form.curriculumId)
      .then((res) => {
        if (!active) return;
        const raw = res?.data?.data ?? res?.data ?? [];
        setStages(Array.isArray(raw) ? raw : []);
      })
      .catch(() => { if (active) setStages([]); })
      .finally(() => { if (active) setLoadingStages(false); });
    return () => { active = false; };
  }, [form.curriculumId]);

  useEffect(() => {
    if (!form.stageId) { setGrades([]); return; }
    let active = true;
    setLoadingGrades(true);
    getStageGrades(form.stageId)
      .then((res) => {
        if (!active) return;
        const raw = res?.data?.data ?? res?.data ?? [];
        setGrades(Array.isArray(raw) ? raw : []);
      })
      .catch(() => { if (active) setGrades([]); })
      .finally(() => { if (active) setLoadingGrades(false); });
    return () => { active = false; };
  }, [form.stageId]);

  const curriculumOptions = curriculums.map((c) => ({ id: c.id, label: nameOf(c) || c.id }));
  const stageOptions = stages.map((s) => ({ id: s.id, label: nameOf(s) || s.id }));
  const gradeOptions = grades.map((g) => ({ id: g.id, label: nameOf(g) || g.id }));

  const handleCancel = () => { setForm(buildForm()); setError(''); setEditing(false); };
  const handleCurriculumChange = (id) => setForm((prev) => ({ ...prev, curriculumId: id, stageId: '', gradeId: '' }));
  const handleStageChange = (id) => setForm((prev) => ({ ...prev, stageId: id, gradeId: '' }));
  const handleGradeChange = (id) => setForm((prev) => ({ ...prev, gradeId: id }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {};
      if (form.curriculumId) payload.curriculum = form.curriculumId;
      if (form.stageId) payload.stage = form.stageId;
      if (form.gradeId) payload.grade = form.gradeId;
      if (form.studyLanguage) payload.studyLanguage = form.studyLanguage;
      await onSave(payload, false);
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const curriculumDisplay = resolveDisplay(student?.curriculum, curriculums);
  const stageDisplay = resolveDisplay(student?.stage, stages);
  const gradeDisplay = resolveDisplay(student?.grade, grades);

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] p-6">
      <SectionHeader
        title="البيانات الأكاديمية"
        subtitle="هذا القسم يحتوي على بيانات ابنك التعليمية الأساسية، والتي تُستخدم لإدارة رحلته التعليمية داخل المنصة."
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <ViewGrid>
          <ViewField label="المرحلة الدراسية" value={stageDisplay} />
          <ViewField label="الصف الدراسي" value={gradeDisplay} />
          <ViewField label="المنهج الدراسي" value={curriculumDisplay} />
          <ViewField label="لغة التعلم المفضلة" value={langLabel(student?.studyLanguage)} />
        </ViewGrid>
      ) : (
        <EditBox>
          <Dropdown
            label="المرحلة الدراسية"
            value={form.stageId}
            options={stageOptions}
            onChange={handleStageChange}
            loading={loadingStages}
            disabled={!form.curriculumId}
            placeholder={form.curriculumId ? 'اختر المرحلة الدراسية' : 'اختر المنهج الدراسي أولاً'}
          />
          <Dropdown
            label="الصف الدراسي"
            value={form.gradeId}
            options={gradeOptions}
            onChange={handleGradeChange}
            loading={loadingGrades}
            disabled={!form.stageId}
            placeholder={form.stageId ? 'اختر الصف الدراسي' : 'اختر المرحلة الدراسية أولاً'}
          />
          <Dropdown
            label="المنهج الدراسي"
            value={form.curriculumId}
            options={curriculumOptions}
            onChange={handleCurriculumChange}
            loading={loadingCurriculums}
            placeholder="اختر المنهج الدراسي"
          />
          <Dropdown
            label="لغة التعلم المفضلة"
            value={form.studyLanguage}
            options={LANGUAGE_OPTIONS}
            onChange={(id) => setForm((prev) => ({ ...prev, studyLanguage: id }))}
            placeholder="اختر لغة التعلم المفضلة"
          />
        </EditBox>
      )}

      {editing && <ActionRow saving={saving} onCancel={handleCancel} error={error} confirmLabel="تعديل البيانات" />}
    </form>
  );
};

/* ================================================================== */
/* SecurityCard                                                        */
/* ================================================================== */
export const SecurityCard = ({ onSave, lastChangedLabel = 'آخر تغيير منذ 3 أشهر' }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ currentPassword: '', password: '', passwordConfirm: '' });

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleCancel = () => {
    setForm({ currentPassword: '', password: '', passwordConfirm: '' });
    setError('');
    setEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.password) { setError('أدخل كلمة المرور الجديدة'); return; }
    if (form.password !== form.passwordConfirm) { setError('كلمة المرور وتأكيدها غير متطابقين'); return; }
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) {
      setError('كلمة المرور الجديدة لا تستوفي جميع الشروط المطلوبة');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        currentPassword: form.currentPassword,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      handleCancel();
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] p-6">
      <SectionHeader
        title="الأمان وكلمة المرور"
        subtitle="تغيير كلمة المرور وإعدادات الأمان"
        editing={editing}
        onEditClick={() => setEditing(true)}
      />

      {!editing ? (
        <div className="border border-[var(--border-light)] rounded-xl p-5">
          <p className="text-xs text-[var(--text-light)] mb-1.5">كلمة المرور</p>
          <p className="text-sm font-semibold text-[var(--text-dark)] mb-1 tracking-widest">••••••••</p>
          <p className="text-xs text-[var(--text-light)]">{lastChangedLabel}</p>
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