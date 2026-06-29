import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Link as LinkIcon, Info } from 'lucide-react';
import AdminLayout from '../../../components/admin/layout/AdminLayout';


/* ------------------------------------------------------------------ */
/* Static Data                                                          */
/* ------------------------------------------------------------------ */

const SUBJECT_OPTIONS = [
    { id: 'math', name: 'رياضيات' },
    { id: 'science', name: 'علوم' },
    { id: 'arabic', name: 'لغة عربية' },
    { id: 'english', name: 'لغة إنجليزية' },
];

const STAGE_OPTIONS = [
    { id: 'primary', name: 'الابتدائية' },
    { id: 'middle', name: 'الإعدادية' },
    { id: 'secondary', name: 'الثانوية' },
];

const GRADE_OPTIONS = {
    primary: [{ id: 'p4', name: 'الرابع الابتدائي' }, { id: 'p5', name: 'الخامس الابتدائي' }, { id: 'p6', name: 'السادس الابتدائي' }],
    middle: [{ id: 'm1', name: 'الأول الإعدادي' }, { id: 'm2', name: 'الثاني الإعدادي' }, { id: 'm3', name: 'الثالث الإعدادي' }],
    secondary: [{ id: 's1', name: 'الأول الثانوي' }, { id: 's2', name: 'الثاني الثانوي' }, { id: 's3', name: 'الثالث الثانوي' }],
};

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
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({});

    const grades = data.stage ? (GRADE_OPTIONS[data.stage] || []) : [];

    const handleField = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    };

    const validate = () => {
        const next = {};
        if (!data.subject) next.subject = 'اسم المادة مطلوب';
        if (!data.stage) next.stage = 'المرحلة الدراسية مطلوبة';
        if (!data.grade) next.grade = 'الصف الدراسي مطلوب';
        if (!data.name?.trim()) next.name = 'اسم المجموعة مطلوب';
        if (!data.serviceType) next.serviceType = 'نوع الخدمة مطلوب';
        if (!data.capacity) next.capacity = 'عدد الطلاب مطلوب';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleCancel = () => navigate('/admin/groups');

    const handleSubmit = () => {
        if (!validate()) return;
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            navigate('/admin/groups');
        }, 800);
    };

    return (
        <AdminLayout>
            <div dir="rtl" className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right  mx-auto space-y-5">
                <div>
                    <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">إنشاء مجموعة جديدة</h2>
                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">أدخل تفاصيل المجموعة.</p>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
                    <SelectField
                        label="اسم المادة"
                        value={data.subject || ''}
                        onChange={(v) => handleField('subject', v)}
                        options={SUBJECT_OPTIONS}
                        placeholder="اختر المادة الدراسية"
                        error={errors.subject}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField
                            label="الصف الدراسي"
                            value={data.grade || ''}
                            onChange={(v) => handleField('grade', v)}
                            options={grades}
                            placeholder="اختر الصف الدراسي"
                            disabled={!data.stage}
                            error={errors.grade}
                        />
                        <SelectField
                            label="المرحلة الدراسية"
                            value={data.stage || ''}
                            onChange={(v) => { handleField('stage', v); handleField('grade', ''); }}
                            options={STAGE_OPTIONS}
                            placeholder="اختر المرحلة الدراسية"
                            error={errors.stage}
                        />
                    </div>

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