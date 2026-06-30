import { useNavigate } from 'react-router-dom';
import { ChevronDown, Link as LinkIcon, Info } from 'lucide-react';
import AdminLayout from '../../../components/admin/layout/AdminLayout';
import React, { useState, useEffect } from 'react';

import {
  createClassroom,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getAllSubjects,
  getUsers, // هنستخدمها لجلب قائمة المعلمين role=teacher
} from '../../../services/authService';

/* ------------------------------------------------------------------ */
/* Static Data                                                          */
/* ------------------------------------------------------------------ */

// نوع الخدمة: المجموعة خاصة (حصص فردية/مدفوعة لمجموعة صغيرة) أو عامة (مفتوحة لجميع الطلاب المسجلين بالمادة)
const SERVICE_TYPE_OPTIONS = [
    { id: 'private', name: 'خاص' },
    { id: 'public', name: 'عام' },
];

/* ------------------------------------------------------------------ */
/* Shared Field Components — styled identically to ExamBasicInfoStep    */
/* ------------------------------------------------------------------ */

const SelectField = ({ label, value, onChange, options, placeholder, disabled, error }) => (
    <div className="relative w-full">
        <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 appearance-none transition-all
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}
          ${!value ? 'text-[#8C9198]' : 'text-[#1F2937]'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                <ChevronDown size={16} />
            </div>
        </div>
        {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
    </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', icon, error, min }) => (
    <div className="w-full">
        <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
            />
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
                    {icon}
                </div>
            )}
        </div>
        {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
    </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

const CreateGroupPages = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({});

  // خيارات الـ selects القادمة من الباك إند
  const [curriculums, setCurriculums] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    getCurriculums().then((res) => setCurriculums(res.data?.data || []));
    getAllSubjects().then((res) => setSubjects(res.data?.data || []));

    setLoadingTeachers(true);
    getUsers({ role: 'teacher' })
      .then((res) => {
        // 🔍 مؤقت: طبع شكل الرد الخام من السيرفر عشان نتأكد من بنية البيانات
        // وأسماء الحقول الفعلية (افتح الـ Console وابعتلي اللي يطبع هنا)
        console.log('RAW /users response:', res.data);

        // الـ array بيجي غالبًا في res.data.data، لكن لو فيه wrapper تاني
        // (زي res.data.data.users أو res.data.data.results) بنحاول نلاقيه
        const raw = res.data?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.users)
          ? raw.users
          : Array.isArray(raw?.results)
          ? raw.results
          : [];

        console.log('Users list length before filter:', list.length, list[0]);

        const teachersOnly = list
          .filter((u) => {
            const role = (u.role || u.rawRole || '').toString().toLowerCase();
            const isTeacher = role === 'teacher';

            // نقبل أكتر من تسمية محتملة لحالة التفعيل
            const isActive =
              u.isActive === true ||
              u.active === true ||
              u.status === 'active' ||
              u.registrationStatus === 'active';

            const isDeleted = u.isDeleted === true || u.deleted === true;

            // مهم جدًا: الباك إند بيرفض ربط مجموعة بمعلم لسه pending-verification
            // أو غير verified، حتى لو isActive=true، فلازم نستبعدهم هنا
            const isFullyVerified =
              u.isVerified === true &&
              u.registrationStatus !== 'pending-verification' &&
              u.registrationStatus !== 'pending';

            return isTeacher && isActive && isFullyVerified && !isDeleted;
          })
          .map((u) => ({ ...u, id: u.id || u._id }));

        console.log('Teachers after filter:', teachersOnly);
        setTeachers(teachersOnly);
      })
      .catch((err) => {
        console.error('فشل تحميل قائمة المعلمين:', err);
        setTeachers([]);
      })
      .finally(() => setLoadingTeachers(false));
  }, []);

  useEffect(() => {
    if (data.curriculum) {
      getCurriculumStages(data.curriculum).then((res) => setStages(res.data?.data || []));
    } else {
      setStages([]);
    }
  }, [data.curriculum]);

  useEffect(() => {
    if (data.stage) {
      getStageGrades(data.stage).then((res) => setGrades(res.data?.data || []));
    } else {
      setGrades([]);
    }
  }, [data.stage]);

  const handleField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.curriculum) next.curriculum = 'المنهج مطلوب';
    if (!data.subject) next.subject = 'اسم المادة مطلوب';
    if (!data.stage) next.stage = 'المرحلة الدراسية مطلوبة';
    if (!data.grade) next.grade = 'الصف الدراسي مطلوب';
    if (!data.teacher) next.teacher = 'المعلم مطلوب';
    if (!data.name?.trim()) next.name = 'اسم المجموعة مطلوب';
    if (!data.serviceType) next.serviceType = 'نوع الخدمة مطلوب';
    if (!data.capacity) next.capacity = 'عدد الطلاب مطلوب';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCancel = () => navigate('/admin/groups');

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await createClassroom({
        name: data.name,
        curriculum: data.curriculum,
        stage: data.stage,
        grade: data.grade,
        subject: data.subject,
        teacher: data.teacher,
        type: 'group', // ثابت لأن الصفحة دي خاصة بإنشاء مجموعات
        capacity: Number(data.capacity),
        meetingLink: data.meetingLink || '',
      });
      navigate('/admin/groups');
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء المجموعة');
    } finally {
      setSaving(false);
    }
  };

  return(

     <AdminLayout>
      <div dir="rtl" className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right mx-auto space-y-5">
        <div>
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">إنشاء مجموعة جديدة</h2>
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">أدخل تفاصيل المجموعة.</p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
          <SelectField
            label="المنهج"
            value={data.curriculum || ''}
            onChange={(v) => { handleField('curriculum', v); handleField('stage', ''); handleField('grade', ''); }}
            options={curriculums.map((c) => ({ id: c.id, name: c.name?.ar || c.name }))}
            placeholder="اختر المنهج"
            error={errors.curriculum}
          />

          <SelectField
            label="اسم المادة"
            value={data.subject || ''}
            onChange={(v) => handleField('subject', v)}
            options={subjects.map((s) => ({ id: s.id, name: s.name?.ar || s.name }))}
            placeholder="اختر المادة الدراسية"
            error={errors.subject}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="المرحلة الدراسية"
              value={data.stage || ''}
              onChange={(v) => { handleField('stage', v); handleField('grade', ''); }}
              options={stages.map((s) => ({ id: s.id, name: s.name?.ar || s.name }))}
              placeholder="اختر المرحلة الدراسية"
              disabled={!data.curriculum}
              error={errors.stage}
            />
            <SelectField
              label="الصف الدراسي"
              value={data.grade || ''}
              onChange={(v) => handleField('grade', v)}
              options={grades.map((g) => ({ id: g.id, name: g.name?.ar || g.name }))}
              placeholder="اختر الصف الدراسي"
              disabled={!data.stage}
              error={errors.grade}
            />
          </div>

          <SelectField
            label="المعلم"
            value={data.teacher || ''}
            onChange={(v) => handleField('teacher', v)}
            options={teachers.map((t) => ({ id: t.id, name: t.fullName }))}
            placeholder={loadingTeachers ? 'جارٍ تحميل المعلمين...' : (teachers.length ? 'اختر المعلم' : 'لا يوجد معلمون متاحون')}
            disabled={loadingTeachers}
            error={errors.teacher}
          />

          <InputField
            label="اسم المجموعة"
            value={data.name || ''}
            onChange={(v) => handleField('name', v)}
            placeholder="مجموعة أ"
            error={errors.name}
          />

          <SelectField
            label="نوع الخدمة"
            value={data.serviceType || ''}
            onChange={(v) => handleField('serviceType', v)}
            options={SERVICE_TYPE_OPTIONS}
            placeholder="اختر نوع الخدمة"
            error={errors.serviceType}
          />

          <InputField
            label="عدد الطلاب (سعة الفصل)"
            value={data.capacity || ''}
            onChange={(v) => handleField('capacity', v)}
            placeholder="20"
            type="number"
            min="1"
            error={errors.capacity}
          />

          <InputField
            label="وصف المجموعة (اختياري)"
            value={data.description || ''}
            onChange={(v) => handleField('description', v)}
            placeholder="رياضيات - الصف الثالث الثانوي...."
          />

          <InputField
            label="رابط المجموعة التعليمية"
            value={data.meetingLink || ''}
            onChange={(v) => handleField('meetingLink', v)}
            placeholder="https://zoom.us/12548"
            icon={<LinkIcon size={16} />}
          />

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-lg px-4 py-2">
              {submitError}
            </div>
          )}

          <div className="flex items-start gap-2 bg-[#EAF4FF] border border-[#D6E6FB] rounded-lg px-4 py-3">
            <Info size={16} className="text-[#123C91] shrink-0 mt-0.5" />
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#1F2937] leading-5">
              سيُستخدم هذا الرابط لجميع حصص هذه المجموعة. تأكد من صحة الرابط وإمكانية انضمام الطلاب إليه في الوقت المحدد للحصة.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px] disabled:opacity-60"
          >
            {saving ? 'جارٍ الإنشاء...' : 'إنشاء المجموعة'}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]"
          >
            إلغاء
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateGroupPages;