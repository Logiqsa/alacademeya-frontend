import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../../../services/authService";

const CreateCurriculumPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [curriculum, setCurriculum] = useState({
    name: { ar: "", en: "" },
    description: "",
    country: "",
    stages: [],
  });

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
      toast.error("حدث خطأ أثناء الحفظ");
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
      <div dir="rtl" className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937]">
              إنشاء منهج جديد
            </h2>
            <p className="text-[#8C9198] text-[15px]">
              بناء هيكل المنهج والمراحل والصفوف الدراسية
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#123C91] text-white px-6 py-2.5 rounded-lg font-['Tajawal'] hover:bg-[#0F3278] transition-all disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "جاري الحفظ..." : "حفظ المنهج"}
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
      </div>
    </AdminLayout>
  );
};

export default CreateCurriculumPage;
