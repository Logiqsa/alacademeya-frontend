import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus, X, ChevronDown, Loader2 } from 'lucide-react';
import AdminLayout from '../../../components/admin/layout/AdminLayout';
import { createCurriculum, createStage, createGrade, getCountries } from '../../../services/authService';

const LANG = 'ar';
const pickName = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[LANG] || val.ar || val.en || '';
};
const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};
const normalizeOption = (item) => ({
  id: item._id || item.id,
  label: pickName(item.name) || item.label || '',
});

/* ------------------------------------------------------------------ */
/* Shared Field Components — styled identically to CreateGroupPages     */
/* ------------------------------------------------------------------ */

const InputField = ({ label, value, onChange, placeholder, error, textarea, dir }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`w-full px-4 py-3 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right resize-none
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
      />
    ) : (
      <input
        type="text"
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
      />
    )}
    {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Simple Dropdown — used here for the required "country" field         */
/* ------------------------------------------------------------------ */

const SelectField = ({ label, value, options, onChange, placeholder = 'اختر', loading, error }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <div className="w-full relative">
      <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !loading && setOpen((o) => !o)}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] flex items-center justify-between text-right transition-all
          ${error ? 'border-red-400' : 'border-[#E5E5E5]'} ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selected ? 'text-[#1F2937]' : 'text-[#8C9198]'}>
          {loading ? 'جاري التحميل...' : selected ? selected.label : placeholder}
        </span>
        {loading ? <Loader2 size={16} className="animate-spin text-[#8C9198]" /> : <ChevronDown size={16} className={`text-[#8C9198] transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && !loading && (
        <ul className="absolute z-20 top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
          {options.length === 0 && <li className="px-4 py-2.5 text-sm text-[#8C9198]">لا توجد بيانات</li>}
          {options.map((opt) => (
            <li key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }} className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#F2F4F7] text-[#1F2937]">
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Grade Tag Input — type a grade name + Enter/+ to add as a pill       */
/* ------------------------------------------------------------------ */

const GradeTagInput = ({ grades, onChange, error }) => {
  const [draft, setDraft] = useState('');

  const addGrade = () => {
    const value = draft.trim();
    if (!value) return;
    if (grades.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...grades, value]);
    setDraft('');
  };

  const removeGrade = (g) => onChange(grades.filter((x) => x !== g));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGrade();
    }
  };

  return (
    <div className="w-full">
      <label className="block font-['Tajawal'] font-medium text-[15px] sm:text-[17px] text-right text-[#1F2937] pb-1">
        الصفوف الدراسية
      </label>

      {grades.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {grades.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F2F4F7] border border-[#E5E5E5] text-[#1F2937] font-['IBM_Plex_Sans_Arabic'] text-[13px]"
            >
              {g}
              <button
                type="button"
                onClick={() => removeGrade(g)}
                className="text-[#8C9198] hover:text-[#D92D20] cursor-pointer"
                aria-label="حذف الصف"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addGrade}
          className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#123C91] text-white rounded-lg cursor-pointer hover:bg-[#0F3278] transition-colors"
          aria-label="إضافة صف"
        >
          <Plus size={18} />
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="مثال: الصف الأول"
          className={`flex-1 h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
            ${error ? 'border-red-400 focus:ring-red-300' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
        />
      </div>
      {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stage Block — name + grade tags + delete                             */
/* ------------------------------------------------------------------ */

const StageBlock = ({ index, stage, onChange, onRemove, removable }) => {
  return (
    <div className="border border-[#E5E5E5] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] text-[#123C91]">
          المرحلة {index + 1}
        </span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[#D92D20] cursor-pointer hover:opacity-80 p-1 -m-1"
            aria-label="حذف المرحلة"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <InputField
        label="اسم المرحلة"
        value={stage.name}
        onChange={(v) => onChange({ ...stage, name: v })}
        placeholder="مثال: المرحلة الإبتدائية"
        error={stage.errors?.name}
      />

      <GradeTagInput
        grades={stage.grades}
        onChange={(grades) => onChange({ ...stage, grades })}
        error={stage.errors?.grades}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

const emptyStage = () => ({ id: crypto.randomUUID(), name: '', grades: [], errors: {} });

const CreateCurriculumPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // الباك إند بيطلب الاسم بصيغة { ar, en } مش نص واحد، وبيطلب country إجباري
  const [data, setData] = useState({ nameAr: '', nameEn: '', description: '', countryId: '' });
  const [stages, setStages] = useState([emptyStage()]);

  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    setLoadingCountries(true);
    getCountries()
      .then((res) => setCountryOptions(extractList(res.data).map(normalizeOption)))
      .catch(() => toast.error('تعذر تحميل قائمة الدول'))
      .finally(() => setLoadingCountries(false));
  }, []);

  const updateStage = (id, updated) => {
    setStages((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const addStage = () => setStages((prev) => [...prev, emptyStage()]);

  const removeStage = (id) => setStages((prev) => prev.filter((s) => s.id !== id));

  const handleCancel = () => navigate('/admin/curriculum');

  const validate = () => {
    let valid = true;
    const nextErrors = {};

    if (!data.nameAr.trim()) { nextErrors.nameAr = 'اسم المنهج بالعربية مطلوب'; valid = false; }
    if (!data.nameEn.trim()) { nextErrors.nameEn = 'اسم المنهج بالإنجليزية مطلوب'; valid = false; }
    if (!data.countryId) { nextErrors.countryId = 'الدولة مطلوبة'; valid = false; }
    setErrors(nextErrors);

    const nextStages = stages.map((s) => {
      const stageErrors = {};
      if (!s.name.trim()) stageErrors.name = 'اسم المرحلة مطلوب';
      if (s.grades.length === 0) stageErrors.grades = 'أضف صفًا دراسيًا واحدًا على الأقل';
      if (Object.keys(stageErrors).length) valid = false;
      return { ...s, errors: stageErrors };
    });
    setStages(nextStages);

    return valid;
  };

const handleSubmit = async () => {
  if (!validate()) return;
  if (saving) return;

  setSaving(true);

  try {
    // 1) إنشاء المنهج
    const curriculumRes = await createCurriculum({
      name: { ar: data.nameAr.trim(), en: data.nameEn.trim() },
      country: data.countryId,
    });
    const curriculum = curriculumRes.data.data || curriculumRes.data;
    const curriculumId = curriculum._id || curriculum.id;

    // 2) لكل مرحلة، إنشاء الـ stage مربوط بالمنهج
    for (const stage of stages) {
      const stageRes = await createStage({
        curriculum: curriculumId,
        name: { ar: stage.name, en: stage.name },
      });
      const createdStage = stageRes.data.data || stageRes.data;
      const stageId = createdStage._id || createdStage.id;

      // 3) لكل صف داخل المرحلة، إنشاء الـ grade مربوط بالمرحلة
      for (const grade of stage.grades) {
        await createGrade({
          stage: stageId,
          name: { ar: grade, en: grade },
        });
      }
    }

    toast.success('تم إضافة المنهج بنجاح');
    navigate('/admin/curriculum');
  } catch (err) {
    const status = err.response?.status;
    const code = err.response?.data?.message;
    if (status === 409 || code === 'DUPLICATE_FIELD' || code?.toLowerCase?.().includes('duplicate')) {
      toast.error('يوجد منهج بنفس الاسم لهذه الدولة بالفعل');
    } else {
      toast.error(code || 'حدث خطأ أثناء إضافة المنهج');
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <AdminLayout>
      <div dir="rtl" className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right mx-auto space-y-5">
        <div>
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">
            إضافة منهج جديد
          </h2>
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">
            أدخل بيانات المنهج والمراحل الدراسية التابعة له.
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
          <p className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] text-[#1F2937]">بيانات المنهج</p>

          <InputField
            label="اسم المنهج (عربي)"
            value={data.nameAr}
            onChange={(v) => setData((p) => ({ ...p, nameAr: v }))}
            placeholder="مثال: المنهج المصري"
            error={errors.nameAr}
          />

          <InputField
            label="اسم المنهج (إنجليزي)"
            dir="ltr"
            value={data.nameEn}
            onChange={(v) => setData((p) => ({ ...p, nameEn: v }))}
            placeholder="e.g. Egypt Curriculum"
            error={errors.nameEn}
          />

          <SelectField
            label="الدولة"
            value={data.countryId}
            options={countryOptions}
            loading={loadingCountries}
            onChange={(id) => setData((p) => ({ ...p, countryId: id }))}
            placeholder="اختر الدولة"
            error={errors.countryId}
          />

          <InputField
            label="وصف المنهج (اختياري)"
            value={data.description}
            onChange={(v) => setData((p) => ({ ...p, description: v }))}
            placeholder="نبذة مختصرة عن أهداف المنهج وطبيعته..."
            textarea
          />
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
          <div>
            <p className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] text-[#1F2937]">المراحل الدراسية</p>
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] text-[#8C9198] mt-1">
              هذا القسم لسه بيتحفظ محليًا فقط، لإن API إضافة المراحل لكل منهج لسه مش متوفر — تقدر تضيفه بعدين أول ما يتوفر.
            </p>
          </div>

          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <StageBlock
                key={stage.id}
                index={idx}
                stage={stage}
                onChange={(updated) => updateStage(stage.id, updated)}
                onRemove={() => removeStage(stage.id)}
                removable={stages.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addStage}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#C7CCD1] rounded-xl text-[#575F69] font-['IBM_Plex_Sans_Arabic'] text-[14px] cursor-pointer hover:bg-[#F9FAFA] transition-colors"
          >
            <Plus size={16} />
            إضافة مرحلة دراسية جديدة
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'جارٍ الإضافة...' : 'إضافة المنهج'}
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

export default CreateCurriculumPage;