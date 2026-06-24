import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getAllSubjects,
} from '../../../services/authService';

const getName = (item) => {
  if (!item) return '';
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object') return item.name?.ar || item.name?.en || '';
  return '';
};

const SelectField = ({ label, value, onChange, options, placeholder, disabled, loading, error }) => (
  <div className="relative w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1 w-fit">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full h-11 sm:h-12 px-4 border rounded-lg bg-[#F9FAFA]
          font-['IBM_Plex_Sans_Arabic'] text-[13px] sm:text-[14px] focus:outline-none focus:ring-2
          appearance-none transition-all
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}
          ${!value ? 'text-[#8C9198]' : 'text-[#1F2937]'}
          ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <option value="">{loading ? 'جاري التحميل...' : placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
        <ChevronDown size={16} />
      </div>
    </div>
    {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
  </div>
);

const LANGUAGES = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'الإنجليزية' },
  { id: 'fr', name: 'الفرنسية' },
];

const AcademicInfoStep = ({ onNext, onBack, data, onChange, countryId }) => {
  const [allCurriculums, setAllCurriculums] = useState([]);
  const [curriculums, setCurriculums]       = useState([]);
  const [stages, setStages]                 = useState([]);
  const [grades, setGrades]                 = useState([]);
  const [allSubjects, setAllSubjects]       = useState([]);
  const [subjectSearch, setSubjectSearch]   = useState('');
  const [errors, setErrors]                 = useState({});

  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [loadingStages, setLoadingStages]           = useState(false);
  const [loadingGrades, setLoadingGrades]           = useState(false);
  const [loadingSubjects, setLoadingSubjects]       = useState(false);

  useEffect(() => {
    setLoadingCurriculums(true);
    getCurriculums()
      .then((res) => {
        const list = (res.data?.data || res.data || []).map((item) => ({
          ...item,
          name: getName(item),
        }));
        setAllCurriculums(list);
      })
      .catch(console.error)
      .finally(() => setLoadingCurriculums(false));
  }, []);

  useEffect(() => {
    onChange('curriculum', '');
    onChange('stage', '');
    onChange('grade', '');
    onChange('subjects', []);
    setStages([]);
    setGrades([]);
    setAllSubjects([]);

    if (!countryId || allCurriculums.length === 0) {
      setCurriculums([]);
      return;
    }

    const filtered = allCurriculums.filter((c) => {
      if (c.country) {
        return c.country === countryId ||
               c.country?._id === countryId ||
               c.country?.id === countryId;
      }
      return true;
    });

    setCurriculums(filtered.length > 0 ? filtered : allCurriculums);
  }, [countryId, allCurriculums]);

  useEffect(() => {
    setStages([]);
    setGrades([]);
    setAllSubjects([]);
    onChange('stage', '');
    onChange('grade', '');
    onChange('subjects', []);
    if (!data.curriculum) return;

    setLoadingStages(true);
    getCurriculumStages(data.curriculum)
      .then((res) => {
        const list = (res.data?.data || res.data || []).map((item) => ({
          ...item,
          name: getName(item),
        }));
        setStages(list);
      })
      .catch(console.error)
      .finally(() => setLoadingStages(false));
  }, [data.curriculum]);

  useEffect(() => {
    setGrades([]);
    setAllSubjects([]);
    onChange('grade', '');
    onChange('subjects', []);
    if (!data.stage) return;

    setLoadingGrades(true);
    getStageGrades(data.stage)
      .then((res) => {
        const list = (res.data?.data || res.data || []).map((item) => ({
          ...item,
          name: getName(item),
        }));
        setGrades(list);
      })
      .catch(console.error)
      .finally(() => setLoadingGrades(false));
  }, [data.stage]);

  useEffect(() => {
    setAllSubjects([]);
    onChange('subjects', []);
    if (!data.grade) return;

    setLoadingSubjects(true);
    getAllSubjects({ grade: data.grade })
      .then((res) => {
        const list = (res.data?.data || res.data || []).map((item) => ({
          ...item,
          name: getName(item),
        }));
        setAllSubjects(list);
      })
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, [data.grade]);

  const toggleSubject = (subId) => {
    const current = data.subjects || [];
    const updated = current.includes(subId)
      ? current.filter((s) => s !== subId)
      : [...current, subId];
    onChange('subjects', updated);
    if (errors.subjects) setErrors((p) => ({ ...p, subjects: null }));
  };

  const handleSelect = (field, value) => {
    onChange(field, value);
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const selectedSubjectObjects = allSubjects.filter((s) =>
    (data.subjects || []).includes(s.id)
  );

  const filteredSubjects = allSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) &&
      !(data.subjects || []).includes(s.id)
  );

  const validate = () => {
    const next = {};
    if (!data.curriculum) next.curriculum = 'المنهج الدراسي مطلوب';
    if (!data.stage)      next.stage      = 'المرحلة الدراسية مطلوبة';
    if (!data.grade)      next.grade      = 'الصف الدراسي مطلوب';
    if (!data.language)   next.language   = 'لغة التعلم مطلوبة';
    if (!data.subjects || data.subjects.length === 0) next.subjects = 'اختر مادة واحدة على الأقل';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div dir="rtl" className="w-full p-2 space-y-5">

      {/* العنوان */}
      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] text-right mb-1">
          المعلومات الأكاديمية
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">
          يرجى إدخال المعلومات الدراسية للطالب.
        </p>
      </div>

      {/* المنهج */}
      <SelectField
        label="المنهج الدراسي"
        value={data.curriculum || ''}
        onChange={(v) => handleSelect('curriculum', v)}
        options={curriculums}
        placeholder={!countryId ? 'اختر الدولة أولاً من الخطوة السابقة' : 'اختر المنهج الدراسي'}
        loading={loadingCurriculums}
        disabled={!countryId || loadingCurriculums}
        error={errors.curriculum}
      />

      {/* المرحلة والصف — جنب بعض على sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="المرحلة الدراسية"
          value={data.stage || ''}
          onChange={(v) => handleSelect('stage', v)}
          options={stages}
          placeholder="اختر المرحلة"
          loading={loadingStages}
          disabled={!data.curriculum || loadingStages}
          error={errors.stage}
        />
        <SelectField
          label="الصف الدراسي"
          value={data.grade || ''}
          onChange={(v) => handleSelect('grade', v)}
          options={grades}
          placeholder="اختر الصف"
          loading={loadingGrades}
          disabled={!data.stage || loadingGrades}
          error={errors.grade}
        />
      </div>

      {/* لغة التعلم */}
      <SelectField
        label="لغة التعلم المفضلة"
        value={data.language || ''}
        onChange={(v) => handleSelect('language', v)}
        options={LANGUAGES}
        placeholder="اختر اللغة"
        error={errors.language}
      />

      {/* المواد */}
      <div className="space-y-3">
        <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1 w-fit">
          المواد المفضلة
        </label>

        {selectedSubjectObjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedSubjectObjects.map((sub) => (
              <span
                key={sub.id}
                className="bg-[#EFF6FF] text-[#1E4FAE] px-3 py-1 rounded-full text-[13px] font-medium flex items-center gap-2"
              >
                {sub.name}
                <button
                  onClick={() => toggleSubject(sub.id)}
                  className="hover:text-red-500 text-base leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          value={subjectSearch}
          onChange={(e) => setSubjectSearch(e.target.value)}
          className={`w-full h-11 sm:h-12 px-4 border rounded-lg bg-[#F9FAFA]
            font-['IBM_Plex_Sans_Arabic'] text-[13px] sm:text-[14px]
            placeholder:text-[#8C9198] focus:outline-none focus:ring-2
            disabled:opacity-60 disabled:cursor-not-allowed
            ${errors.subjects ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
          placeholder={
            !data.grade ? 'اختر الصف أولاً'
            : loadingSubjects ? 'جاري تحميل المواد...'
            : 'ابدأ بكتابة اسم المادة...'
          }
          disabled={!data.grade || loadingSubjects}
        />

        {subjectSearch && filteredSubjects.length > 0 && (
          <ul className="border border-[#E5E5E5] rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
            {filteredSubjects.map((sub) => (
              <li
                key={sub.id}
                onClick={() => { toggleSubject(sub.id); setSubjectSearch(''); }}
                className="px-4 py-2.5 cursor-pointer hover:bg-[#F0F4FC] text-[13px] sm:text-[14px] text-[#1F2937]"
              >
                {sub.name}
              </li>
            ))}
          </ul>
        )}

        {subjectSearch && filteredSubjects.length === 0 && data.grade && !loadingSubjects && (
          <p className="text-[13px] text-[#8C9198] text-right px-1">لا توجد مواد مطابقة</p>
        )}

        {errors.subjects && (
          <p className="text-red-500 text-[12px] mt-1 text-right">{errors.subjects}</p>
        )}
      </div>

      {/* الأزرار */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer text-[14px] sm:text-[16px]"
        >
          السابق
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px]"
        >
          التالي
        </button>
      </div>

    </div>
  );
};

export default AcademicInfoStep;