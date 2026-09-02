import { useContext, useEffect, useMemo, useState } from "react";
import { Crown, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
// ⚠️ عدّل المسار ده حسب مكان ملف الـ api عندك في المشروع
import {
  getAllPackages,
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
} from "../../services/APIService";
import { AuthContext } from "../../context/AuthContext";

const ANNUAL_DISCOUNT = 0.2;
const entityId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";
const entityName = (value) =>
  typeof value === "string"
    ? value
    : value?.name?.ar || value?.name?.en || value?.name || "منهج";
const extractList = (response, keys = []) => {
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  return [];
};

const mapApiPackage = (pkg, isAnnual, isPopular) => {
  const monthly = pkg.price;
  const annual = Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));

  return {
    id: entityId(pkg),
    title: entityName(pkg),
    sub: pkg.description || `باقة تشمل ${pkg.sessions} حصة دراسية شهرياً`,
    price: isAnnual
      ? `EGP ${annual.toLocaleString()}`
      : `EGP ${monthly.toLocaleString()}`,
    period: `حتى ${pkg.sessions} حصة شهرياً`,
    button: "ابدأ الآن",
    variant: isPopular ? "solid" : "outline",
    isPopular,
  };
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const isLoggedIn = Boolean(user || localStorage.getItem("token"));
  const [isAnnual, setIsAnnual] = useState(false);
  const [apiPackages, setApiPackages] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [grades, setGrades] = useState([]);
  const [structureLoading, setStructureLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError("");
      try {
        const [packagesResponse, curriculumsResponse] = await Promise.all([
          getAllPackages({ isActive: true }),
          getCurriculums(),
        ]);
        const active = extractList(packagesResponse, ["packages", "results", "items"])
          .filter((p) => p.isActive !== false)
          .sort((a, b) => a.price - b.price);
        setApiPackages(active);
        const curriculumItems = extractList(curriculumsResponse, [
          "curriculums",
          "results",
          "items",
        ]);
        setCurriculums(curriculumItems);
        const firstWithPackages = curriculumItems.find((curriculum) =>
          active.some(
            (pkg) =>
              String(entityId(pkg.curriculum)) === String(entityId(curriculum)),
          ),
        );
        setSelectedCurriculum(
          entityId(firstWithPackages || curriculumItems[0]),
        );
        if (!curriculumItems.length) setStructureLoading(false);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "تعذر تحميل الباقات، حاول مرة أخرى لاحقاً",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (!selectedCurriculum) return;

    let active = true;
    getCurriculumStages(selectedCurriculum)
      .then((response) => {
        if (!active) return;
        const items = extractList(response, ["stages", "results", "items"]);
        setStages(items);
        setSelectedStage(entityId(items[0]));
        if (!items.length) setStructureLoading(false);
      })
      .catch(() => {
        if (active) setStructureLoading(false);
      });

    return () => { active = false; };
  }, [selectedCurriculum]);

  useEffect(() => {
    if (!selectedStage) return;

    let active = true;
    getStageGrades(selectedStage)
      .then((response) => {
        if (!active) return;
        const items = extractList(response, ["grades", "results", "items"]);
        setGrades(items);
      })
      .catch(() => {
        if (active) {
          setGrades([]);
        }
      })
      .finally(() => active && setStructureLoading(false));

    return () => { active = false; };
  }, [selectedStage]);

  const visiblePackages = useMemo(
    () =>
      !selectedCurriculum
        ? apiPackages
        : apiPackages.filter(
            (pkg) => {
              if (String(entityId(pkg.curriculum)) !== String(selectedCurriculum)) return false;
              const packageGrades = Array.isArray(pkg.grades) ? pkg.grades : [];
              const stageGradeIds = new Set(grades.map((grade) => String(entityId(grade))));
              return !selectedStage || packageGrades.length === 0 || packageGrades.some(
                (grade) => stageGradeIds.has(String(entityId(grade))),
              );
            },
          ),
    [apiPackages, selectedCurriculum, selectedStage, grades],
  );

  const plans = useMemo(() => {
    return visiblePackages.map((pkg) =>
      mapApiPackage(pkg, isAnnual, pkg.isMostPopular === true),
    );
  }, [visiblePackages, isAnnual]);

  return (
    <section className="py-20 font-sans" dir="rtl" id="pricing">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="font-['Tajawal'] font-bold text-[48px] leading-14 text-[#1F2937] p-4 rounded-lg text-center">
          الباقات و الأسعار
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[18px] leading-6 text-[#1F2937B2] p-4 rounded-lg text-center mb-8">
          اختر الباقة المناسبة لك ولأبنائك واستمتع بتجربة تعليمية متميزة
        </p>

        {!loading && !error && curriculums.length > 0 && (
          <div className="mx-auto mb-9 max-w-4xl rounded-3xl border border-[#E4EAF2] bg-white/90 p-4 shadow-[0_12px_35px_rgba(18,60,145,0.08)] sm:p-6">
          <div className="flex gap-2 overflow-x-auto px-1 pb-2 sm:justify-center" aria-label="تصفية الباقات حسب المنهج">
            {curriculums.map((curriculum) => {
              const curriculumId = entityId(curriculum);
              const active = String(selectedCurriculum) === String(curriculumId);
              return (
                <motion.button
                  key={curriculumId}
                  type="button"
                  onClick={() => {
                    setSelectedCurriculum(curriculumId);
                    setStages([]);
                    setSelectedStage("");
                    setGrades([]);
                    setStructureLoading(true);
                  }}
                  animate={{ scale: active ? 1.04 : 1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${active ? "border-[#123C91] bg-[#123C91] text-white" : "border-[#DCE3EE] bg-white text-[#575F69] hover:border-[#123C91]"}`}
                >
                  {entityName(curriculum)}
                </motion.button>
              );
            })}
          </div>

          {(structureLoading || stages.length > 0) && <div className="my-4 h-px bg-[#EDF0F5]" />}

          {structureLoading && stages.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-[#8C9198]">
              <Loader2 size={16} className="animate-spin" /> جاري تحميل المراحل...
            </div>
          ) : stages.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#344054]">
                <GraduationCap size={18} className="text-[#123C91]" /> اختر المرحلة الدراسية
              </div>
              <div className="flex flex-wrap justify-center gap-2" aria-label="تصفية الباقات حسب المرحلة">
                {stages.map((stage) => {
                  const stageId = entityId(stage);
                  const active = String(selectedStage) === String(stageId);
                  return <button key={stageId} type="button" onClick={() => {
                    setSelectedStage(stageId);
                    setGrades([]);
                    setStructureLoading(true);
                  }} className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${active ? "border-[#12C6B0] bg-[#E9FBF8] text-[#087F71] shadow-sm" : "border-[#E4E7EC] bg-[#F9FAFB] text-[#667085] hover:border-[#12C6B0]"}`}>{entityName(stage)}</button>;
                })}
              </div>
            </div>
          )}

          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-12" dir="rtl">
          <span
            className={`font-semibold text-[16px] ${isAnnual ? "text-gray-500" : "text-[#123C91]"}`}
          >
            شهرياً
          </span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full p-1 flex items-center transition-colors duration-300 ${
              isAnnual
                ? "bg-[#123C91] text-white [&_svg]:text-white"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
                isAnnual ? "mr-7" : "mr-0"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-[16px] ${isAnnual ? "text-[#123C91]" : "text-gray-500"}`}
            >
              سنوياً
            </span>

            <div
              className={`bg-[#EBF4FF] text-[#123C91] text-[10px] font-bold px-2 mr-1 py-0.5 rounded-md border border-[#123C91] transition-all duration-300 ${isAnnual ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              وفّر 20%
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-[#8C9198]">
            <Loader2 size={20} className="animate-spin ml-2" />
            <span className="text-[14px]">جاري تحميل الباقات...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-6 text-red-600 text-[14px]">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !structureLoading && (
          <>
          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedCurriculum ? `${selectedCurriculum}-${selectedStage}` : "packages"}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
          {selectedCurriculum && visiblePackages.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-sm text-[#667085]">لا توجد باقات متاحة لهذه المرحلة حالياً.</motion.p>
          )}
          <div className="flex flex-wrap items-stretch justify-center gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6 }}
                className={`relative flex w-full max-w-sm flex-col rounded-2xl border p-6 transition-shadow md:basis-[calc(33.333%-1rem)] ${plan.isPopular ? "border-[#123C91] shadow-2xl" : "border-[#1F293733] bg-[#FFFFFF]"}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#EAF4FF] text-[#123C91] text-xs font-bold px-4 py-1 rounded-full border border-[#123C91] flex items-center gap-1">
                    <Crown size={12} /> الأكثر طلبًا
                  </div>
                )}

                <h3 className="font-['Tajawal'] font-bold text-[27px] text-[#1F2937] text-right">
                  {plan.title}
                </h3>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937] text-right mt-1">
                  {plan.sub}
                </p>
                <div className="font-['Tajawal'] font-bold text-[32px] text-[#1F2937] text-right mt-2">
                  {plan.price}
                </div>
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#5D3A82] text-right mt-1 mb-6">
                  {plan.period}
                </p>

                {!isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => navigate("/select-account-type")}
                    className={`mt-auto h-12 rounded-lg font-['Tajawal'] font-medium text-[16px] transition-all ${plan.variant === "solid" ? "bg-[#123C91] text-white [&_svg]:text-white" : "bg-white text-[#123C91] border border-[#123C91] hover:bg-[#123C91] hover:text-white hover:[&_svg]:text-white"}`}
                  >
                    ابدأ الآن
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          </motion.div>
          </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
};

export default Pricing;
