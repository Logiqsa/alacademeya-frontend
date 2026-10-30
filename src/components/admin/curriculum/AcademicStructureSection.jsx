import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Plus,
  BookOpen,
  Loader2,
} from "lucide-react";
import {
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getAllSubjects,
  deleteCurriculum,
} from "../../../services/APIService";
import { AuthContext } from "../../../context/AuthContext";

const LANG = "ar"; // change to dynamic locale if you support i18n switching

// بيرجع نص الاسم سواء جاي كـ string عادي أو كـ object {ar, en}
const pickName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[LANG] || val.ar || val.en || "";
};

const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};

/* ------------------------------------------------------------------ */
/* Grade Row                                                            */
/* ------------------------------------------------------------------ */

const GradeRow = ({ grade }) => {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState(null);
  const gradeId = grade._id || grade.id || grade;
  const loading = open && subjects === null;

  useEffect(() => {
    if (!open || subjects !== null) return;

    let active = true;
    getAllSubjects({ grade: gradeId })
      .then((res) => {
        if (active) setSubjects(extractList(res.data));
      })
      .catch(() => {
        if (active) {
          setSubjects([]);
          toast.error("تعذر تحميل مواد الصف");
        }
      });

    return () => {
      active = false;
    };
  }, [gradeId, open, subjects]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-[#F9FAFA]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-right transition-colors hover:bg-[#F2F4F7]"
      >
        <span className="font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#1F2937]">
          {pickName(grade.name) || grade}
        </span>
        {open ? (
          <ChevronUp size={15} className="shrink-0 text-[#575F69]" />
        ) : (
          <ChevronDown size={15} className="shrink-0 text-[#575F69]" />
        )}
      </button>
      {open && (
        <div className="border-t border-[#E5E5E5] bg-white px-3 py-3">
          <p className="font-['IBM_Plex_Sans_Arabic'] text-xs text-[#8C9198]">
            المواد الدراسية
          </p>
          {loading ? (
            <div className="flex justify-center py-3">
              <Loader2 size={16} className="animate-spin text-(--primary)" />
            </div>
          ) : subjects?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subjects.map((subject) => (
                <span
                  key={subject._id || subject.id || subject}
                  className="rounded-lg border border-[#D7E2F3] bg-[#EEF4FF] px-2 py-1 font-['IBM_Plex_Sans_Arabic'] text-xs text-[#123C91]"
                >
                  {pickName(subject.name) || subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-['IBM_Plex_Sans_Arabic'] text-xs text-[#8C9198]">
              لا توجد مواد مضافة لهذا الصف.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Stage Row — collapsible, lists grade pills                           */
/* بيجيب المراحل من /stages/curriculum/:id أول ما يتفتح                  */
/* ------------------------------------------------------------------ */

const StageRow = ({ stage, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [grades, setGrades] = useState([]);
  useEffect(() => {
    if (!open) return;

    getStageGrades(stage._id || stage.id)
      .then((res) => {
        setGrades(extractList(res.data));
      });
  }, [open, stage]);

  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FAFA] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
      >
        <span className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] sm:text-[15px] text-[#1F2937]">
          {pickName(stage.name)}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-[#575F69]" />
        ) : (
          <ChevronDown size={16} className="text-[#575F69]" />
        )}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-2">
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[16px] text-[#8C9198]">
            الصفوف الدراسية
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {grades.length > 0 ? (
              grades.map((g) => (
                <GradeRow
                  key={g._id || g.id || g}
                  grade={g}
                />
              ))
            ) : (
              <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] text-[#8C9198]">
                لا توجد صفوف مضافة لهذه المرحلة.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Curriculum Card — collapsible, lazy-loads its stages on first open   */
/* ------------------------------------------------------------------ */

const CurriculumCard = ({
  curriculum,
  onEdit,
  onDelete,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [stages, setStages] = useState(null); // null = not fetched yet
  const [loadingStages, setLoadingStages] = useState(defaultOpen);

  const curriculumId = curriculum._id || curriculum.id;

  useEffect(() => {
    if (!open || stages !== null) return;
    let active = true;
    getCurriculumStages(curriculumId)
      .then((res) => {
        if (active) setStages(extractList(res.data));
      })
      .catch(() => {
        if (active) {
          toast.error("تعذر تحميل المراحل الدراسية");
          setStages([]);
        }
      })
      .finally(() => {
        if (active) setLoadingStages(false);
      });
    return () => {
      active = false;
    };
  }, [open, stages, curriculumId]);

  const handleToggle = () => {
    if (!open && stages === null) setLoadingStages(true);
    setOpen((current) => !current);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 text-right">
          <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center shrink-0">
            <BookOpen size={18} className="text-[#123C91]" />
          </div>
          <div>
            <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium mb-2 text-[15px] sm:text-[16px] text-[#1F2937]">
              {pickName(curriculum.name)}
            </h3>
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] sm:text-[16px] text-[#8C9198]">
              {stages
                ? `${stages.length} مراحل دراسية`
                : "اضغط لعرض المراحل الدراسية"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="text-[#575F69] cursor-pointer p-1 -m-1"
            aria-label="عرض / إخفاء"
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(curriculum)}
              className="text-[#D92D20] cursor-pointer p-1 -m-1 hover:opacity-80"
              aria-label="حذف"
            >
              <Trash2 size={17} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit?.(curriculum)}
            className="text-[#575F69] cursor-pointer p-1 -m-1 hover:opacity-80"
            aria-label="تعديل"
          >
            <Pencil size={17} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[16px] text-[#8C9198]">
            المراحل الدراسية
          </p>
          {loadingStages && (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={18} className="animate-spin text-(--primary)" />
            </div>
          )}
          {!loadingStages && stages?.length === 0 && (
            <p className="font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#8C9198]">
              لا توجد مراحل دراسية مضافة لهذا المنهج بعد.
            </p>
          )}
          {!loadingStages &&
            stages?.map((stage, idx) => (
              <StageRow
                key={stage._id || stage.id}
                stage={stage}
                defaultOpen={idx === 0}
              />
            ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Section                                                         */
/* ------------------------------------------------------------------ */

const AcademicStructureSection = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const canDelete = user?.role === "super-admin";
  const [curricula, setCurricula] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    const loadCurricula = async () => {
      try {
        const res = await getCurriculums();
        if (active) setCurricula(extractList(res.data));
      } catch (err) {
        if (active) {
          setLoadError(
            err.response?.data?.message || "تعذر تحميل المناهج الدراسية",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadCurricula();
    return () => {
      active = false;
    };
  }, []);

  const handleAdd = () => navigate("/admin/curriculum/create");
  const handleEdit = (curriculum) =>
    navigate(`/admin/curriculum/${curriculum._id || curriculum.id}/edit`);

  const handleDelete = async (curriculum) => {
    const id = curriculum._id || curriculum.id;
    const prev = curricula;
    setCurricula((p) => p.filter((c) => (c._id || c.id) !== id)); // optimistic
    try {
      await deleteCurriculum(id);
      toast.success("تم حذف المنهج بنجاح");
    } catch (err) {
      setCurricula(prev); // rollback
      toast.error(err.response?.data?.message || "تعذر حذف المنهج");
    }
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-right">
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937]">
            الهيكل الأكاديمى
          </h2>
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[13px] sm:text-[14px]">
            إدارة وتخصيص المناهج الدراسية ، المراحل التعليمية والصفوف.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] sm:text-[15px] cursor-pointer hover:bg-[#0F3278] transition-colors w-fit"
        >
          <Plus size={16} />
          إضافة منهج
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-(--primary)" />
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-white border border-dashed border-[#E5E5E5] rounded-2xl py-12 text-center">
          <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-red-500">
            {loadError}
          </p>
        </div>
      )}

      {!loading && !loadError && (
        <div className="space-y-4">
          {curricula.map((curriculum) => (
            <CurriculumCard
              key={curriculum._id || curriculum.id}
              curriculum={curriculum}
              onEdit={handleEdit}
              onDelete={canDelete ? handleDelete : undefined}
            />
          ))}

          {curricula.length === 0 && (
            <div className="bg-white border border-dashed border-[#E5E5E5] rounded-2xl py-12 text-center">
              <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#8C9198]">
                لا توجد مناهج دراسية مضافة بعد.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicStructureSection;
