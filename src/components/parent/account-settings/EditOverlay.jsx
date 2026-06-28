import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateMyProfile, updateStudent } from '../../../services/authService';

/**
 * EditOverlay
 * One modal reused for every edit action in AccountSettings.
 * `target.type` decides which fields show and which API call runs:
 *  - parent-info       -> PATCH /users/me             (fullName, username, email, phone)
 *  - parent-security   -> PATCH /users/me             (password, passwordConfirm)
 *  - student-info      -> PATCH /parents/students/:id (fullName, username, birthDate, countryCode, phone)
 *  - student-academic  -> PATCH /parents/students/:id (curriculum, stage, grade, studyLanguage)
 *  - student-security  -> PATCH /parents/students/:id (password, passwordConfirm)
 *
 * After a successful save, onSaved(changedSensitiveAuth) is called.
 * changedSensitiveAuth is true when the email or password was part of
 * this form — the parent component uses that signal to force a logout,
 * since the old token/session may no longer match the new credentials.
 */

const FIELD_SETS = {
  'parent-info': [
    ['fullName', 'الاسم الكامل'],
    ['username', 'اسم المستخدم'],
    ['email', 'البريد الإلكتروني', 'email'],
    ['phone', 'رقم الهاتف'],
  ],
  'student-info': [
    ['fullName', 'الاسم الكامل'],
    ['username', 'اسم المستخدم'],
    ['birthDate', 'تاريخ الميلاد', 'date'],
    ['countryCode', 'الدولة (كود الدولة)'],
    ['phone', 'رقم الهاتف'],
  ],
  'student-academic': [
    ['curriculum', 'المنهج الدراسي (id)'],
    ['stage', 'المرحلة الدراسية (id)'],
    ['grade', 'الصف الدراسي (id)'],
    ['studyLanguage', 'لغة التعلم المفضلة'],
  ],
  'parent-security': [
    ['password', 'كلمة المرور الجديدة', 'password'],
    ['passwordConfirm', 'تأكيد كلمة المرور', 'password'],
  ],
  'student-security': [
    ['password', 'كلمة المرور الجديدة', 'password'],
    ['passwordConfirm', 'تأكيد كلمة المرور', 'password'],
  ],
};

const TITLES = {
  'parent-info': ['تعديل البيانات الشخصية', 'قم بتحديث بياناتك الأساسية ثم اضغط حفظ التعديلات.'],
  'parent-security': ['تغيير كلمة المرور', 'اختر كلمة مرور قوية وتأكد من تطابقها.'],
  'student-info': ['تعديل بيانات الابن', 'قم بتحديث بيانات ابنك الأساسية ثم اضغط حفظ التعديلات.'],
  'student-academic': ['تعديل البيانات الأكاديمية', 'قم بتحديث البيانات التعليمية الخاصة بابنك.'],
  'student-security': ['تغيير كلمة المرور', 'اختر كلمة مرور قوية وتأكد من تطابقها.'],
};

// Field keys that should force a logout after a successful save, since
// they affect login credentials.
const SENSITIVE_KEYS = ['email', 'password', 'passwordConfirm', 'username'];

const EditOverlay = ({ target, parent, student, onClose, onSaved }) => {
  const isStudent = target.type.startsWith('student');
  const isSecurity = target.type.endsWith('security');
  // For students, the real personal fields live nested under `.user`
  const source = isStudent ? student?.user || student : parent;
  const fields = FIELD_SETS[target.type] || [];
  const [title, subtitle] = TITLES[target.type] || ['تعديل البيانات', ''];

  const [form, setForm] = useState(() => {
    const initial = {};
    fields.forEach(([key]) => {
      initial[key] = isSecurity ? '' : source?.[key] || '';
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSecurity && form.password !== form.passwordConfirm) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') payload[k] = v;
      });

      // student-info/student-academic both PATCH the same record; use the
      // top-level record id, NOT the nested user id.
      const studentRecordId = target.studentId;

      if (isStudent) {
        await updateStudent(studentRecordId, payload);
      } else {
        await updateMyProfile(payload);
      }

      const changedSensitive = Object.keys(payload).some((k) => SENSITIVE_KEYS.includes(k));
      onSaved(changedSensitive);
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-[var(--white)] w-full max-w-md rounded-2xl shadow-[var(--shadow)] p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-[var(--text-light)] hover:text-[var(--text-dark)]"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-[var(--text-dark)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-light)] mb-5">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(([key, label, type = 'text']) => (
            <div key={key}>
              <label className="block text-xs text-[var(--text-light)] mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key] ?? ''}
                onChange={handleChange(key)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] text-sm text-[var(--text-dark)] focus:border-[var(--primary)] transition-colors"
              />
            </div>
          ))}

          {(target.type === 'parent-info' || target.type === 'student-info') && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              تغيير البريد الإلكتروني أو اسم المستخدم سيتطلب تسجيل الدخول مرة أخرى.
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-[var(--text-dark)] text-sm font-medium hover:bg-[var(--bg-section)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOverlay;