import { FileText, GraduationCap, UserRound, X } from "lucide-react";
import { getTeacherCvUrl } from "../../../utils/teacherCv";

const text = (value) => {
  if (!value) return "—";
  if (["string", "number"].includes(typeof value)) return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "—";
};
const listText = (value) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return (
    [...new Set(values.map(text).filter((item) => item !== "—"))].join("، ") ||
    "—"
  );
};
const languageLabel = (value) =>
  ({ ar: "العربية", en: "الإنجليزية" })[String(value || "").toLowerCase()] ||
  value ||
  "—";
const Detail = ({ label, value }) => (
  <div className="rounded-xl bg-[#F9FAFA] px-4 py-3">
    <p className="text-xs text-[#8C9198]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#1F2937]">
      {value || "—"}
    </p>
  </div>
);

const EntityProfileModal = ({ entity, role = "student", onClose }) => {
  if (!entity) return null;
  const user =
    entity.user && typeof entity.user === "object" ? entity.user : entity;
  const isTeacher = role === "teacher";
  const name =
    user.fullName || entity.fullName || text(user.name || entity.name);
  const cvUrl = isTeacher ? getTeacherCvUrl(entity) : "";

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-4"
      dir="rtl"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">
            {isTeacher ? "تفاصيل المعلم" : "تفاصيل الطالب"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mb-5 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#123C91]">
            {isTeacher ? <GraduationCap size={30} /> : <UserRound size={29} />}
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#1F2937]">{name}</h3>
          <p className="mt-1 text-sm text-[#8C9198]" dir="ltr">
            {user.email || "—"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="رقم الهاتف" value={user.phone} />
          <Detail label="اسم المستخدم" value={user.username} />
          {isTeacher ? (
            <>
              <Detail label="حالة المعلم" value={entity.status} />
              <Detail
                label="سنوات الخبرة"
                value={entity.experienceYears ?? entity.experience}
              />
              <Detail
                label="المواد"
                value={listText(entity.subjects ?? entity.subject)}
              />
              <Detail
                label="الصفوف"
                value={listText(entity.grades ?? entity.grade)}
              />
              <Detail
                label="المناهج"
                value={listText(entity.curriculums ?? entity.curriculum)}
              />
              <Detail
                label="لغة التدريس"
                value={languageLabel(entity.language)}
              />
            </>
          ) : (
            <>
              <Detail
                label="المرحلة"
                value={text(entity.stage ?? entity.academicLevel)}
              />
              <Detail label="الصف" value={text(entity.grade)} />
              <Detail label="المنهج" value={text(entity.curriculum)} />
              <Detail
                label="الدولة"
                value={text(user.country ?? entity.country)}
              />
            </>
          )}
        </div>
        {isTeacher && (
          <a
            href={cvUrl || undefined}
            target={cvUrl ? "_blank" : undefined}
            rel="noreferrer"
            onClick={(event) => !cvUrl && event.preventDefault()}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${cvUrl ? "border-[#123C91] text-[#123C91] hover:bg-blue-50" : "cursor-not-allowed border-gray-200 text-gray-400"}`}
          >
            <FileText size={17} />
            {cvUrl ? "عرض السيرة الذاتية (CV)" : "السيرة الذاتية غير متاحة"}
          </a>
        )}
      </section>
    </div>
  );
};
export default EntityProfileModal;
