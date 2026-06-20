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

  const getLabel = (map, id) => map?.[id] || id || '—';

  const subjectNames =
    (data.subjects || []).map((id) => getLabel(subjectsMap, id)).join(' · ') || '—';

  const languageLabel =
    data.language === 'ar' ? 'العربية' :
    data.language === 'en' ? 'الإنجليزية' :
    data.language === 'fr' ? 'الفرنسية' : '—';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        birthDate: data.birthDate
          ? new Date(data.birthDate).toISOString().split('T')[0]
          : undefined,
        country: data.country,
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
      toast.error(err.response?.data?.message || 'حدثت مشكلة أثناء إنشاء الحساب');
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
        <Row label="الدولة" value={getLabel(countriesMap, data.country)} />
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