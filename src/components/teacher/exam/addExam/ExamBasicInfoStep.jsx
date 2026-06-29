import React, { useState } from 'react';
import { ChevronDown, Clock, Calendar } from 'lucide-react';

const MOCK_GROUPS = [
    { id: '1', name: 'مجموعة رياضيات A' },
    { id: '2', name: 'مجموعة رياضيات B' },
    { id: '3', name: 'مجموعة رياضيات C' },
];

const MOCK_LESSONS = {
    '1': [{ id: 'l1', name: 'المعادلات التربيعية' }, { id: 'l2', name: 'الهندسة' }],
    '2': [{ id: 'l3', name: 'الجبر' }, { id: 'l4', name: 'الإحصاء' }],
    '3': [{ id: 'l5', name: 'حساب المثلثات' }],
};

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

// Native date/time inputs render their own picker glyph on the left in LTR,
// which sits on top of our custom icon and looks duplicated/misaligned.
// We hide the native glyph and draw our own Clock/Calendar icon instead,
// then push the value/placeholder text to sit right next to it (LTR),
// matching the reference design exactly.
const InputField = ({ label, value, onChange, placeholder, type = 'text', icon, error, min, max }) => {
    const isDateOrTime = type === 'date' || type === 'time';
    const resolvedIcon = icon ?? (type === 'time' ? <Clock size={16} /> : type === 'date' ? <Calendar size={16} /> : null);

    return (
        <div className="w-full">
            <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">{label}</label>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    style={isDateOrTime ? { colorScheme: 'light', direction: 'ltr' } : {}}
                    className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198]
            ${isDateOrTime
                            ? 'text-left pl-10 pr-4 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
                            : `text-right ${resolvedIcon ? 'pl-10' : ''}`}
            ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
                />
                {resolvedIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
                        {resolvedIcon}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
        </div>
    );
};

const CheckboxField = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer select-none" dir="rtl">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 accent-[#123C91] cursor-pointer"
        />
        <span className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937]">{label}</span>
    </label>
);

const ExamBasicInfoStep = ({ data, onChange, onNext, onCancel }) => {
    const [errors, setErrors] = useState({});

    const lessons = data.group ? (MOCK_LESSONS[data.group] || []) : [];

    const validate = () => {
        const next = {};
        if (!data.title?.trim()) next.title = 'عنوان الاختبار مطلوب';
        if (!data.duration) next.duration = 'مدة الاختبار مطلوبة';
        if (!data.passingScore) next.passingScore = 'درجة النجاح مطلوبة';
        if (!data.group) next.group = 'المجموعة مطلوبة';
        if (!data.startDate) next.startDate = 'تاريخ البدء مطلوب';
        if (!data.startTime) next.startTime = 'وقت البدء مطلوب';
        if (!data.endDate) next.endDate = 'تاريخ الانتهاء مطلوب';
        if (!data.endTime) next.endTime = 'وقت الانتهاء مطلوب';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleNext = () => { if (validate()) onNext(); };

    const handleField = (field, value) => {
        onChange(field, value);
        if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
    };

    return (
        <div dir="rtl" className="w-full p-2 space-y-5">
            <div>
                <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">بيانات الاختبار الأساسية</h2>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">أدخل المعلومات الأساسية للاختبار.</p>
            </div>

            {/* Section card */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>

                    <h3 className="font-['Tajawal'] font-semibold text-[18px] text-[#1F2937]">بيانات الاختبار الأساسية</h3>
                </div>

                <InputField
                    label="عنوان الاختبار"
                    value={data.title || ''}
                    onChange={(v) => handleField('title', v)}
                    placeholder="مثال: حل مسائل التفاضل"
                    error={errors.title}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        label="مدة الاختبار بالدقائق"
                        value={data.duration || ''}
                        onChange={(v) => handleField('duration', v)}
                        placeholder="30"
                        type="number"
                        min="1"
                        error={errors.duration}
                    />
                    <InputField
                        label="درجة النجاح"
                        value={data.passingScore || ''}
                        onChange={(v) => handleField('passingScore', v)}
                        placeholder="%50"
                        type="number"
                        min="0"
                        max="100"
                        error={errors.passingScore}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                        label="المجموعة المستهدفة"
                        value={data.group || ''}
                        onChange={(v) => { handleField('group', v); onChange('lesson', ''); }}
                        options={MOCK_GROUPS}
                        placeholder="جميع المجموعات"
                        error={errors.group}
                    />
                    <SelectField
                        label="الحصة المستهدفة (اختياري)"
                        value={data.lesson || ''}
                        onChange={(v) => handleField('lesson', v)}
                        options={lessons}
                        placeholder="اختر المجموعة أولاً"
                        disabled={!data.group}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        label="تاريخ البدء"
                        value={data.startDate || ''}
                        onChange={(v) => handleField('startDate', v)}
                        placeholder="يوم / شهر / سنة"
                        type="date"
                        error={errors.startDate}
                    />
                    <InputField
                        label="وقت البدء"
                        value={data.startTime || ''}
                        onChange={(v) => handleField('startTime', v)}
                        placeholder="-- : --"
                        type="time"
                        error={errors.startTime}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        label="تاريخ الانتهاء"
                        value={data.endDate || ''}
                        onChange={(v) => handleField('endDate', v)}
                        placeholder="يوم / شهر / سنة"
                        type="date"
                        error={errors.endDate}
                    />
                    <InputField
                        label="وقت الانتهاء"
                        value={data.endTime || ''}
                        onChange={(v) => handleField('endTime', v)}
                        placeholder="-- : --"
                        type="time"
                        error={errors.endTime}
                    />
                </div>
            </div>

            {/* Additional settings */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    <span className="font-['Tajawal'] font-semibold text-[18px] text-[#1F2937]">إعدادات إضافية</span>
                </div>
                <CheckboxField label="خلط الأسئلة والإجابات عشوائياً" checked={!!data.shuffle} onChange={(v) => onChange('shuffle', v)} />
                <CheckboxField label="إرسال إشعار للطلاب عند نشر الاختبار" checked={!!data.notifyOnPublish} onChange={(v) => onChange('notifyOnPublish', v)} />
                <CheckboxField label="إرسال تذكير قبل انتهاء الموعد" checked={!!data.notifyReminder} onChange={(v) => onChange('notifyReminder', v)} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button onClick={handleNext} className="flex-1 py-3 px-6 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px]">التالي</button>
                <button onClick={onCancel} className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]">إلغاء</button>
            </div>
        </div>
    );
};

export default ExamBasicInfoStep;