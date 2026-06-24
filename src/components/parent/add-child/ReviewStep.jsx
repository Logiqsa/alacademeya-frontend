import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { addStudent } from '../../../services/authService';

const Row = ({ label, value }) => (
  <div
    className="
      flex flex-col sm:flex-row
      sm:justify-between
      sm:items-center
      py-3
      border-b border-[#F3F4F6]
      last:border-0
      gap-1 sm:gap-4
    "
  >
    <span className="text-[13px] sm:text-[14px] text-[#6B7280]">
      {label}
    </span>

    <span
      className="
        text-[14px]
        sm:text-[15px]
        font-semibold
        text-[#1F2937]
        wrap-break-word
        sm:text-left
      "
    >
      {value || '—'}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-5">
    <p className="text-[14px] font-semibold text-[#123C91] mb-3 px-1">
      {title}
    </p>

    <div
      className="
        bg-white
        rounded-2xl
        px-4 sm:px-5
        py-2
        border border-[#E5E7EB]
        shadow-sm
      "
    >
      {children}
    </div>
  </div>
);

const SERVER_ERROR_MESSAGES = {
  INVALID_COUNTRY_CODE:
    'كود الدولة غير صحيح، يرجى الرجوع للخطوة الأولى وإعادة اختيار الدولة',
  EMAIL_ALREADY_EXISTS:
    'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  USERNAME_ALREADY_EXISTS:
    'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  USERNAME_TAKEN:
    'اسم المستخدم هذا غير متاح، يرجى اختيار اسم آخر',
  EMAIL_TAKEN:
    'هذا البريد الإلكتروني مستخدم من قبل، يرجى استخدام بريد آخر',
  INVALID_CURRICULUM:
    'المنهج الدراسي المختار غير صحيح',
  INVALID_STAGE:
    'المرحلة الدراسية المختارة غير صحيحة',
  INVALID_GRADE:
    'الصف الدراسي المختار غير صحيح',
  VALIDATION_ERROR:
    'يوجد خطأ في البيانات المدخلة، يرجى مراجعة الحقول',
};

const getServerErrorMessage = (err) => {
  const data = err.response?.data;

  if (!data)
    return 'حدثت مشكلة أثناء إنشاء الحساب، يرجى المحاولة لاحقاً';

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map(
        (e) =>
          e.message ||
          e.msg ||
          SERVER_ERROR_MESSAGES[e.code] ||
          e.code
      )
      .filter(Boolean)
      .join(' — ');
  }

  const code = data.message;

  if (code && SERVER_ERROR_MESSAGES[code])
    return SERVER_ERROR_MESSAGES[code];

  if (typeof code === 'string' && code.length > 0)
    return code;

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
    (data.subjects || [])
      .map((id) => getLabel(subjectsMap, id))
      .join(' • ') || '—';

  const languageLabel =
    data.language === 'ar'
      ? 'العربية'
      : data.language === 'en'
      ? 'الإنجليزية'
      : data.language === 'fr'
      ? 'الفرنسية'
      : '—';

  const countryLabel =
    data.country?.name ||
    getLabel(countriesMap, data.country?.id);

  const handleSubmit = async () => {
    setSubmitError('');
    setLoading(true);

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        birthDate: data.birthDate
          ? new Date(data.birthDate)
              .toISOString()
              .split('T')[0]
          : undefined,
        country: data.country?.id,
        countryCode: data.country?.code,
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
      const message = getServerErrorMessage(err);

      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="w-full">

      {/* Header */}
      <div className="mb-6">
        <h2 className="font-semibold text-[22px] sm:text-[24px] text-[#1F2937] mb-2">
          مراجعة وإنشاء
        </h2>

        <p className="text-[#6B7280] text-[14px] sm:text-[16px]">
          يرجى مراجعة البيانات قبل تأكيد الإضافة.
        </p>
      </div>

      {/* Personal */}
      <Section title="المعلومات الشخصية">
        <Row label="الاسم الكامل" value={data.fullName} />

        <Row
          label="تاريخ الميلاد"
          value={
            data.birthDate
              ? new Date(
                  data.birthDate
                ).toLocaleDateString('ar-EG')
              : '—'
          }
        />

        <Row label="الدولة" value={countryLabel} />
      </Section>

      {/* Academic */}
      <Section title="المعلومات الأكاديمية">
        <Row
          label="المرحلة الدراسية"
          value={getLabel(stagesMap, data.stage)}
        />

        <Row
          label="الصف الدراسي"
          value={getLabel(gradesMap, data.grade)}
        />

        <Row
          label="المنهج الدراسي"
          value={getLabel(
            curriculumsMap,
            data.curriculum
          )}
        />

        <Row
          label="لغة التعلم المفضلة"
          value={languageLabel}
        />

        <Row
          label="المواد المفضلة"
          value={subjectNames}
        />
      </Section>

      {/* Account */}
      <Section title="بيانات دخول الطالب">
        <Row
          label="اسم المستخدم"
          value={data.username}
        />

        <Row
          label="رقم الهاتف"
          value={data.phone}
        />

        <Row
          label="كلمة المرور"
          value={
            data.password
              ? '••••••••'
              : '—'
          }
        />
      </Section>

      {/* Notice */}
      <div
        className="
          mb-5
          p-4 sm:p-5
          rounded-2xl
          bg-[#F8FAFF]
          border border-[#DBEAFE]
          text-[#1E4FAE]
          text-[14px]
          leading-7
        "
      >
        بإرسال هذا الطلب سيتم تحويله إلى الإدارة
        للمراجعة، وسيتم التواصل مع ولي الأمر
        لتحديد الباقة التعليمية المناسبة واستكمال
        إجراءات التفعيل قبل إنشاء الحساب بشكل
        نهائي.
      </div>

      {submitError && (
        <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {submitError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 mt-6">

        <button
          onClick={onBack}
          className="
            flex-1
            h-13
            border
            border-[#D1D5DB]
            rounded-xl
            font-medium
            text-[#123C91]
            hover:bg-[#F9FAFB]
            transition-all
          "
        >
          السابق
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            flex-1
            h-13
            bg-[#123C91]
            text-white
            rounded-xl
            font-medium
            hover:bg-[#0E3178]
            transition-all
            disabled:opacity-70
          "
        >
          {loading
            ? 'جاري الإرسال...'
            : 'إرسال الطلب'}
        </button>

      </div>
    </div>
  );
};

export default ReviewStep;