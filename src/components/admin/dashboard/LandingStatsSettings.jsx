import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getLandingPageSettings, updateLandingPageSettings } from "../../../services/APIService";
import { DEFAULT_LANDING_PAGE_SETTINGS } from "../../../hooks/useLandingPageSettings";

const fields = [
  { key: "teachers", label: "المعلمون", min: 0 },
  { key: "students", label: "الطلاب", min: 0 },
  { key: "courses", label: "الدورات التدريبية", min: 0 },
  { key: "satisfaction", label: "رضا المعلمين (%)", min: 0, max: 100 },
];

const sectionFields = [
  { key: "hero", label: "القسم الرئيسي" },
  { key: "featuredCourses", label: "الدورات المميزة" },
  { key: "pricing", label: "الباقات" },
  { key: "stats", label: "الإحصائيات" },
  { key: "features", label: "عن الأكاديمية" },
  { key: "blog", label: "المدونة" },
  { key: "services", label: "مميزات المنصة" },
  { key: "faq", label: "الأسئلة الشائعة" },
];

export default function LandingStatsSettings() {
  const [settings, setSettings] = useState(DEFAULT_LANDING_PAGE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLandingPageSettings()
      .then((response) => {
        const data = response.data?.data;
        if (data) {
          setSettings({
            sections: { ...DEFAULT_LANDING_PAGE_SETTINGS.sections, ...data.sections },
            stats: { ...DEFAULT_LANDING_PAGE_SETTINGS.stats, ...data.stats },
          });
        }
      })
      .catch(() => toast.error("تعذر تحميل إعدادات الصفحة الرئيسية"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = Object.fromEntries(
      fields.map(({ key, min, max }) => {
        const number = Math.max(min, Number(settings.stats[key]) || 0);
        return [key, max === undefined ? number : Math.min(max, number)];
      }),
    );
    setSaving(true);
    try {
      const response = await updateLandingPageSettings({
        sections: settings.sections,
        stats: normalized,
      });
      const data = response.data?.data;
      setSettings({
        sections: { ...DEFAULT_LANDING_PAGE_SETTINGS.sections, ...data.sections },
        stats: { ...DEFAULT_LANDING_PAGE_SETTINGS.stats, ...data.stats },
      });
      toast.success("تم تحديث الصفحة الرئيسية");
    } catch {
      toast.error("تعذر حفظ إعدادات الصفحة الرئيسية");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#123C91]">إعدادات الصفحة الرئيسية</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          تحكم في ظهور الأقسام والأرقام التي يشاهدها جميع زوار المنصة.
        </p>
      </div>

      {loading ? (
        <div className="grid min-h-32 place-items-center"><Loader2 className="animate-spin text-[#123C91]" /></div>
      ) : <>
      <h3 className="mb-3 font-bold text-[#344054]">ظهور أقسام الصفحة</h3>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sectionFields.map((section) => {
          const visible = settings.sections[section.key] !== false;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setSettings((current) => ({
                ...current,
                sections: { ...current.sections, [section.key]: !visible },
              }))}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${visible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-[#E5E7EB] bg-[#F9FAFB] text-[#667085]"}`}
              aria-pressed={visible}
            >
              {section.label}
              {visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 font-bold text-[#344054]">إحصائيات الصفحة</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <label key={field.key} className="text-sm font-medium text-[#374151]">
            {field.label}
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={settings.stats[field.key]}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  stats: { ...current.stats, [field.key]: event.target.value },
                }))
              }
              className="mt-2 h-11 w-full rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] px-3 outline-none focus:border-[#123C91] focus:ring-2 focus:ring-blue-100"
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-5 py-3 text-sm font-semibold text-white"
      >
        {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
        حفظ إعدادات الصفحة
      </button>
      </>}
    </form>
  );
}
