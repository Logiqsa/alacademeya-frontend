import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Save, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import CurriculumForm from "../../../components/admin/curriculum/CurriculumForm";
import StageAccordion from "../../../components/admin/curriculum/StageAccordion";
// تأكد من استيراد الدوال دي من ملف الـ service بتاعك
import {
  createCurriculum,
  createStage,
  createGrade,
  createSubject,
  deleteGrade,
  deleteStage,
  deleteSubject,
  getCurriculum,
  getCurriculumStages,
  getStageGrades,
  getSubjects,
  updateCurriculum,
  updateGrade,
  updateStage as updateStageRequest,
  updateSubject,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";

const CreateCurriculumPage = () => {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const isEditing = Boolean(curriculumId);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [originalStructure, setOriginalStructure] = useState([]);
  const [curriculum, setCurriculum] = useState({
    name: { ar: "", en: "" },
    description: "",
    country: "",
    stages: [],
  });

  const extractList = (response) => {
    const body = response?.data?.data ?? response?.data ?? response ?? [];
    return Array.isArray(body) ? body : body.items || body.results || [];
  };
  const entityId = (entity) => entity?._id || entity?.id;
  const normalizedName = (name) =>
    typeof name === "string"
      ? { ar: name, en: name }
      : { ar: name?.ar || "", en: name?.en || "" };

  useEffect(() => {
    if (!curriculumId) return;
    const loadCurriculum = async () => {
      setLoading(true);
      try {
        const [curriculumResponse, stagesResponse] = await Promise.all([
          getCurriculum(curriculumId),
          getCurriculumStages(curriculumId),
        ]);
        const data = curriculumResponse.data?.data ?? curriculumResponse.data;
        const stages = await Promise.all(extractList(stagesResponse).map(async (stage) => {
          const grades = await Promise.all(extractList(await getStageGrades(entityId(stage))).map(async (grade) => ({
            ...grade,
            id: entityId(grade),
            name: normalizedName(grade.name),
            subjects: extractList(await getSubjects({ grade: entityId(grade) })).map((subject) => ({
              ...subject,
              id: entityId(subject),
              name: normalizedName(subject.name),
            })),
          })));
          return { ...stage, id: entityId(stage), name: normalizedName(stage.name), grades };
        }));
        setCurriculum({
          name: normalizedName(data.name),
          description: data.description || "",
          country: entityId(data.country) || data.country || "",
          stages,
        });
        setOriginalStructure(stages);
      } catch (err) {
        toast.error(err.response?.data?.message || "تعذر تحميل بيانات المنهج");
      } finally {
        setLoading(false);
      }
    };
    loadCurriculum();
  }, [curriculumId]);

  const validate = () => {
    if (!curriculum.name.ar.trim() || !curriculum.name.en.trim()) {
      toast.error("يرجى إدخال اسم المنهج بالعربية والإنجليزية");
      return false;
    }
    if (!curriculum.country) {
      toast.error("يرجى اختيار الدولة");
      return false;
    }
    if (curriculum.stages.length === 0) {
      toast.error("يجب إضافة مرحلة دراسية واحدة على الأقل");
      return false;
    }

    for (const stage of curriculum.stages) {
      // تعديل هنا: التأكد من العربي والإنجليزي
      if (!stage.name.ar.trim() || !stage.name.en.trim()) {
        toast.error("جميع المراحل يجب أن تحتوي على اسم بالعربي والإنجليزي");
        return false;
      }
      if (stage.grades.length === 0) {
        toast.error(
          `مرحلة "${stage.name.ar}" يجب أن تحتوي على صف دراسي واحد على الأقل`,
        );
        return false;
      }
      for (const grade of stage.grades) {
        // تعديل هنا: التأكد من العربي والإنجليزي
        if (!grade.name.ar.trim() || !grade.name.en.trim()) {
          toast.error("جميع الصفوف يجب أن تحتوي على اسم بالعربي والإنجليزي");
          return false;
        }
        if (grade.subjects.length === 0) {
          toast.error(
            `صف "${grade.name.ar}" يجب أن يحتوي على مادة واحدة على الأقل`,
          );
          return false;
        }
        for (const subject of grade.subjects) {
          if (!subject.name.ar.trim() || !subject.name.en.trim()) {
            toast.error("جميع المواد يجب أن تحتوي على اسم بالعربي والإنجليزي");
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (saving) return;

    setSaving(true);
    try {
      if (isEditing) {
        await updateCurriculum(curriculumId, {
          name: curriculum.name,
          description: curriculum.description,
          country: curriculum.country,
        });
        const currentStageIds = new Set(curriculum.stages.map(entityId).filter(Boolean));
        for (const oldStage of originalStructure) {
          if (!currentStageIds.has(entityId(oldStage))) await deleteStage(entityId(oldStage));
        }
        for (const stage of curriculum.stages) {
          const savedStage = originalStructure.find((item) => entityId(item) === entityId(stage));
          let stageId = entityId(stage);
          if (savedStage) {
            await updateStageRequest(stageId, { curriculum: curriculumId, name: stage.name });
          } else {
            const response = await createStage({ curriculum: curriculumId, name: stage.name });
            stageId = entityId(response.data?.data ?? response.data);
          }

          const currentGradeIds = new Set(stage.grades.map(entityId).filter(Boolean));
          for (const oldGrade of savedStage?.grades || []) {
            if (!currentGradeIds.has(entityId(oldGrade))) await deleteGrade(entityId(oldGrade));
          }
          for (const grade of stage.grades) {
            const savedGrade = savedStage?.grades.find((item) => entityId(item) === entityId(grade));
            let gradeId = entityId(grade);
            if (savedGrade) {
              await updateGrade(gradeId, { curriculum: curriculumId, stage: stageId, name: grade.name });
            } else {
              const response = await createGrade({ curriculum: curriculumId, stage: stageId, name: grade.name });
              gradeId = entityId(response.data?.data ?? response.data);
            }

            const currentSubjectIds = new Set(grade.subjects.map(entityId).filter(Boolean));
            for (const oldSubject of savedGrade?.subjects || []) {
              if (!currentSubjectIds.has(entityId(oldSubject))) await deleteSubject(entityId(oldSubject));
            }
            for (const subject of grade.subjects) {
              const payload = { curriculum: curriculumId, stage: stageId, grade: gradeId, name: subject.name };
              if (savedGrade?.subjects.some((item) => entityId(item) === entityId(subject))) {
                await updateSubject(entityId(subject), payload);
              } else {
                await createSubject(payload);
              }
            }
          }
        }
        toast.success("تم تحديث المنهج بنجاح");
        navigate("/admin/curriculum");
        return;
      }

      const curriculumRes = await createCurriculum({
        name: { ar: curriculum.name.ar, en: curriculum.name.en },
        country: curriculum.country,
      });
      const curriculumId = curriculumRes.data.data.id;

      for (const stage of curriculum.stages) {
        const stageRes = await createStage({
          curriculum: curriculumId,
          name: { ar: stage.name.ar, en: stage.name.en },
        });
        const stageId = stageRes.data.data.id;

        for (const grade of stage.grades) {
          const gradeRes = await createGrade({
            curriculum: curriculumId,
            stage: stageId,
            name: { ar: grade.name.ar, en: grade.name.en },
          });
          const gradeId = gradeRes.data.data.id;

          if (grade.subjects) {
            for (const subject of grade.subjects) {
              await createSubject({
                curriculum: curriculumId,
                stage: stageId,
                grade: gradeId,
                name: { ar: subject.name.ar, en: subject.name.en },
              });
            }
          }
        }
      }
      toast.success("تم بناء المنهج بالكامل بنجاح");
      navigate("/admin/curriculum");
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addStage = () => {
    setCurriculum((prev) => ({
      ...prev,
      stages: [
        ...prev.stages,
        { id: crypto.randomUUID(), name: { ar: "", en: "" }, grades: [] },
      ],
    }));
  };

  const updateStage = (stageId, updatedStage) => {
    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => (s.id === stageId ? updatedStage : s)),
    }));
  };

  const removeStage = (stageId) => {
    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.filter((s) => s.id !== stageId),
    }));
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div dir="rtl" className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="animate-spin text-[#123C91]" size={28} />
          </div>
        ) : (
          <>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937]">
              {isEditing ? "تعديل المنهج" : "إنشاء منهج جديد"}
            </h2>
            <p className="text-[#8C9198] text-[15px]">
              {isEditing ? "تعديل بيانات وهيكل المنهج الدراسي" : "بناء هيكل المنهج والمراحل والصفوف الدراسية"}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#123C91] text-white [&_svg]:text-white px-6 py-2.5 rounded-lg font-['Tajawal'] hover:bg-[#0F3278] transition-all disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "جاري الحفظ..." : isEditing ? "حفظ التعديلات" : "حفظ المنهج"}
          </button>
        </div>

        <CurriculumForm
          data={curriculum}
          onChange={(field, value) =>
            setCurriculum((prev) => ({ ...prev, [field]: value }))
          }
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-['Tajawal'] font-bold text-[18px] text-[#1F2937]">
              المراحل الدراسية
            </h3>
            <button
              onClick={addStage}
              className="flex items-center gap-1.5 text-[#123C91] font-['Tajawal'] text-[14px] hover:underline"
            >
              <Plus size={16} /> إضافة مرحلة
            </button>
          </div>
          {curriculum.stages.map((stage) => (
            <StageAccordion
              key={stage.id}
              stage={stage}
              onUpdate={(updated) => updateStage(stage.id, updated)}
              onRemove={() => removeStage(stage.id)}
            />
          ))}
        </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateCurriculumPage;
