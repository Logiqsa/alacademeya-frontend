import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getTeacherCvUrl } from "../../../utils/teacherCv";
import { approveRegistrationRequest } from "../../../utils/approveRegistrationRequest";
import { UserDetailsModal } from "./Userstable";

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
  const [approving, setApproving] = useState(false);
  const [approvedUserId, setApprovedUserId] = useState("");
  if (!entity) return null;
  const user =
    entity.user && typeof entity.user === "object" ? entity.user : entity;
  const isTeacher = role === "teacher";
  const name =
    user.fullName || entity.fullName || text(user.name || entity.name);
  const cvUrl = isTeacher ? getTeacherCvUrl(entity) : "";
  const currentUserId = user.id || user._id;
  const registrationStatus = String(
    user.registrationStatus || user.registration_status || "",
  ).toLowerCase();
  const canApprove =
    !isTeacher &&
    String(approvedUserId) !== String(currentUserId) &&
    (user.isActive === false ||
      [
        "pending",
        "pending-review",
        "pending-approval",
        "under-review",
      ].includes(registrationStatus.replaceAll("_", "-")));

  const approveStudent = async () => {
    if (!window.confirm("هل تريد قبول طلب الطالب وتفعيل حسابه؟")) return;
    const userId = user.id || user._id;
    if (!userId) return toast.error("معرّف المستخدم غير متاح");
    setApproving(true);
    try {
      await approveRegistrationRequest({
        userId,
        role: "student",
      });
      setApprovedUserId(userId);
      toast.success("تم قبول طلب الطالب وتفعيل الحساب");
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر تفعيل حساب الطالب");
    } finally {
      setApproving(false);
    }
  };

  if (!isTeacher) {
    const studentStatus = canApprove
      ? "معلق"
      : approvedUserId === currentUserId || registrationStatus === "active"
        ? "نشط"
        : user.isActive === false
          ? "موقوف"
          : "نشط";
    return (
      <UserDetailsModal
        open
        onClose={onClose}
        user={{
          id: currentUserId,
          name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: "طالب",
          status: studentStatus,
          joinDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("ar-EG")
            : "—",
          stage: text(entity.stage ?? entity.academicLevel),
          grade: text(entity.grade),
          package: text(entity.package),
        }}
        onApprove={canApprove && !approving ? approveStudent : undefined}
      />
    );
  }

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
        {canApprove && (
          <button
            type="button"
            onClick={approveStudent}
            disabled={approving}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold !text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {approving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {approving ? "جارٍ تفعيل الحساب..." : "قبول الطلب وتفعيل الحساب"}
          </button>
        )}
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
