import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { addStudent } from '../../../services/authService';

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-[#F3F4F6] last:border-0">
    <span className="text-[14px] text-[#575F69]">{label}</span>
    <span className="text-[14px] font-medium text-[#1F2937] text-left max-w-[60%] text-right">
      {value || '—'}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[13px] font-medium text-[#123C91] mb-2 px-1">{title}</p>
    <div className="bg-[#F9FAFA] rounded-xl px-4 py-1 border border-[#E5E5E5]">
      {children}
    </div>
  </div>
);

// خرائط رسائل أخطاء السيرفر المعروفة → رسالة عربية مفهومة
const SERVER_ERROR_MESSAGES = {
  INVALID_COUNTRY_CODE: 'كود الدولة غير صحيح، يرجى الرجوع للخطوة الأولى وإعادة اختيار الدولة',
  EMAIL_ALREADY_EXISTS: 'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  USERNAME_ALREADY_EXISTS: 'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  USERNAME_TAKEN: 'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  EMAIL_TAKEN: 'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  INVALID_CURRICULUM: 'المنهج الدراسي المختار غير صحيح',
  INVALID_STAGE: 'المرحلة الدراسية المختارة غير صحيحة',
  INVALID_GRADE: 'الصف الدراسي المختار غير صحيح',
  VALIDATION_ERROR: 'يوجد خطأ في البيانات المدخلة، يرجى مراجعة الحقول',
};

const getServerErrorMessage = (err) => {
  const data = err.response?.data;
  if (!data) return 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';

  // لو فيه errors array فيها تفاصيل لكل حقل (شائع في express-validator/joi)
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => e.message || e.msg || SERVER_ERROR_MESSAGES[e.code] || e.code)
      .filter(Boolean)
      .join(' — ');
  }

  const code = data.message;
  if (code && SERVER_ERROR_MESSAGES[code]) return SERVER_ERROR_MESSAGES[code];

  // fallback: اعرض الرسالة الخام لو موجودة ومش كود غامض
  if (typeof code === 'string' && code.length > 0) return code;

  return 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';
};

const ReviewStep = ({
  onBack,
  onSuccess,
  data,
  countriesMap,
  curriculumsMap,
  stagesMap,
  gradesMap,
  subjectsMap,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const getLabel = (map, id) => map?.[id] || id || '—';

  const subjectNames =
    (data.subjects || []).map((id) => getLabel(subjectsMap, id)).join(' · ') || '—';

  const languageLabel =
    data.language === 'ar' ? 'العربية' :
    data.language === 'en' ? 'الإنجليزية' :
    data.language === 'fr' ? 'الفرنسية' : '—';

  const countryLabel = data.country?.name || getLabel(countriesMap, data.country?.id);

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        birthDate: data.birthDate
          ? new Date(data.birthDate).toISOString().split('T')[0]
          : undefined,
        country: data.country?.id, // رجعنا للـ id — اتأكد إن endpoint التسجيل العادي بيقبل id لنفس الحقل
        countryCode: data.country?.code, // لو الـ backend محتاج الكود في حقل منفصل (زي register)
        curriculum: data.curriculum,
        stage: data.stage,
        grade: data.grade,
        language: data.language,
        subjects: data.subjects,
        username: data.username,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: 'student',
      };
      await addStudent(payload);
      toast.success('تم إنشاء حساب الطالب بنجاح!');
      onSuccess();
    } catch (err) {
      console.error('addStudent error response:', err.response?.data);
      const message = getServerErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="w-full p-2">
      <div className="mb-6">
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] text-[#1F2937] text-right mb-2">
          مراجعة بيانات الطالب
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[16px]">
          تأكد من صحة جميع البيانات قبل إنشاء الحساب.
        </p>
      </div>

      <Section title="👤 المعلومات الشخصية">
        <Row label="الاسم الكامل" value={data.fullName} />
        <Row label="البريد الإلكتروني" value={data.email} />
        <Row
          label="تاريخ الميلاد"
          value={
            data.birthDate
              ? new Date(data.birthDate).toLocaleDateString('ar-EG')
              : '—'
          }
        />
        <Row label="الدولة" value={countryLabel} />
      </Section>

      <Section title="🎓 المعلومات الأكاديمية">
        <Row label="المنهج الدراسي" value={getLabel(curriculumsMap, data.curriculum)} />
        <Row label="المرحلة الدراسية" value={getLabel(stagesMap, data.stage)} />
        <Row label="الصف الدراسي" value={getLabel(gradesMap, data.grade)} />
        <Row label="لغة التعلم" value={languageLabel} />
        <Row label="المواد المفضلة" value={subjectNames} />
      </Section>

      <Section title="🔐 بيانات الدخول">
        <Row label="اسم المستخدم" value={data.username} />
        <Row label="كلمة المرور" value={data.password ? '••••••••' : '—'} />
      </Section>

      {submitError && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[14px] text-right">
          {submitError}
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer disabled:opacity-70 transition-opacity"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer"
        >
          السابق
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;