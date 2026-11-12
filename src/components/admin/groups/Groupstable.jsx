/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Users,
  X,
  ClipboardList,
  BookOpen,
  Search,
  MessageCircle,
  UserPlus,
  Trash2,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import AppSelect from "../../ui/AppSelect";
import EntityProfileModal from "../users/EntityProfileModal";
import {
  getClassroomReplacementTeachers,
  getClassroomEnrollmentOptions,
  updateClassroom,
  updateClassroomSubstituteTeacher,
  createSubscription,
  deleteClassroom,
  getClassroomDeletionSummary,
} from "../../../services/APIService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const resolvePersonName = (p) =>
  p?.user?.fullName ||
  p?.fullName ||
  (typeof p?.name === "string" ? p.name : resolveName(p?.name)) ||
  "--";

const resolvePersonId = (p) =>
  p?.studentId ||
  p?.student?.id ||
  p?.student?._id ||
  p?.studentProfile?.id ||
  p?.studentProfile?._id ||
  p?.teacherId ||
  p?.id ||
  p?._id ||
  p?.user?.id ||
  p?.user?._id;

// The subscriptions API expects the Student document id, not the nested User id.
const resolveStudentId = (student) =>
  student?.student?.id ||
  student?.student?._id ||
  student?.studentProfile?.id ||
  student?.studentProfile?._id ||
  student?.id ||
  student?._id ||
  student?.studentId ||
  student?.user?.id ||
  student?.user?._id ||
  "";

const studentIdentityIds = (student) =>
  [
    resolveStudentId(student),
    student?.studentId,
    student?.id,
    student?._id,
    student?.user?.id,
    student?.user?._id,
  ]
    .filter(Boolean)
    .map(String);

// ⚠️ افتراض: الطالب فيه حقل "stage" و"grade" مباشر أو جوه object فيه name/ar/en —
// لسه محتاج تأكيد من بوستمان/Network tab لشكل الـ student object الراجع من getAllStudents()
// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#07883B] text-white",
    blue: "bg-[#1D4ED8] text-white",
    orange: "bg-[#D96600] text-white",
    red: "bg-[#DC2626] text-white",
    gray: "bg-[#475569] text-white",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}
    >
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "نشطة") return <Badge label={status} type="green" />;
  if (status === "مكتملة العدد") return <Badge label={status} type="blue" />;
  if (status === "قيد التسجيل") return <Badge label={status} type="orange" />;
  if (status === "متوقفة") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />;
};

// ─── Select Field ─────────────────────────────────────────────────────────────
// allowClear: لو true، أول اختيار (الـ placeholder) بيبقى قابل للاختيار (بيتستخدم كـ "مسح الفلتر")
const SelectField = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  disabled,
  allowClear,
}) => (
  <div className="mb-3">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <AppSelect
      className="h-11 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#344054] outline-none transition focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10"
      value={value ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      disabled={disabled}
      searchable={options.length > 8}
      searchPlaceholder={`ابحث عن ${label}...`}
      emptyMessage="لا توجد خيارات متاحة"
    >
      <option value="" disabled={!allowClear}>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </AppSelect>
  </div>
);

// ─── Student Combobox ─────────────────────────────────────────────────────────
// خانة بحث بالاسم بتفتح قايمة نتائج، ولما تختار طالب اسمه بيظهر جوه الخانة نفسها
// بدل السيليكت المنفصل.
const StudentCombobox = ({
  label,
  search,
  onSearchChange,
  options,
  selectedId,
  onSelect,
  placeholder,
  disabled,
  emptyLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleChange = (e) => {
    onSearchChange(e.target.value);
    if (selectedId) onSelect(null); // تعديل النص يعني إلغاء الاختيار السابق
    setIsOpen(true);
  };

  const handlePick = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="mb-3" ref={containerRef}>
      <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full h-11 pr-10 pl-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937] disabled:opacity-60"
        />
        <Search
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]"
        />

        {isOpen && !disabled && (
          <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
            {options.length === 0 ? (
              <div className="px-4 py-2.5 text-[13px] text-[#9CA3AF] font-['IBM_Plex_Sans_Arabic'] text-right">
                {emptyLabel}
              </div>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handlePick(o)}
                  className={`w-full text-right px-4 py-2.5 text-[13px] font-['IBM_Plex_Sans_Arabic'] hover:bg-[#F3F4F6] transition-colors ${o.value === selectedId ? "bg-[#EAF4FF] text-[#123C91]" : "text-[#1F2937]"}`}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ModalFooter = ({
  onClose,
  confirmLabel,
  onConfirm,
  loading,
  disabled,
}) => (
  <div className="flex gap-3 mt-5">
    <button
      onClick={onConfirm}
      disabled={loading || disabled}
      className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-[#0f3280] transition-colors disabled:opacity-60"
    >
      {loading ? "جاري الحفظ..." : confirmLabel}
    </button>
    <button
      onClick={onClose}
      className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-[#123C91] transition-colors"
    >
      إلغاء
    </button>
  </div>
);

const DeleteGroupModal = ({ open, onClose, group, onChanged }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open || !group?.id) return undefined;

    let active = true;
    setSummary(null);
    setConfirmed(false);
    setError("");
    setSummaryLoading(true);
    getClassroomDeletionSummary(group.id)
      .then((response) => {
        if (active) setSummary(response?.data?.data || null);
      })
      .catch(() => {
        if (active) setError("تعذر تحميل ملخص الحذف، حاول مرة أخرى.");
      })
      .finally(() => {
        if (active) setSummaryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, group?.id]);

  const handleClose = () => {
    setError("");
    setConfirmed(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!group?.id || submitting || !summary || !confirmed) return;

    setSubmitting(true);
    setError("");
    try {
      await deleteClassroom(group.id);
      await onChanged?.();
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "تعذر حذف المجموعة، حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : handleClose}
      title="حذف المجموعة"
    >
      <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={21} />
        <div>
          <p className="font-['Tajawal'] text-[15px] font-semibold text-red-800">
            هل تريد حذف مجموعة «{group?.name}»؟
          </p>
          <p className="mt-1 text-[13px] leading-6 text-red-700">
            لا يمكن التراجع عن هذا الإجراء بعد تأكيد الحذف.
          </p>
        </div>
      </div>

      {summaryLoading ? (
        <p className="mt-4 text-center text-sm text-[#667085]">جاري تجهيز ملخص الحذف...</p>
      ) : summary ? (
        <div className="mt-4 rounded-xl border border-[#FECACA] bg-white p-4">
          <p className="text-sm font-semibold text-[#991B1B]">سيُحذف نهائيًا:</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#575F69] sm:grid-cols-3">
            {[
              ["طلاب سيفصلون", summary.studentsDetached],
              ["جداول", summary.schedulesDeleted],
              ["حصص", summary.sessionsDeleted],
              ["سجلات حضور", summary.attendanceDeleted],
              ["غياب معلمين", summary.teacherAbsencesDeleted],
              ["واجبات", summary.assignmentsDeleted],
              ["تسليمات واجبات", summary.submissionsDeleted],
              ["تسجيلات حصص", summary.recordingsDeleted],
              ["رسائل المجموعة", summary.messagesDeleted],
            ].map(([label, count]) => (
              <div key={label} className="rounded-lg bg-[#FFF7F7] px-3 py-2">
                <span>{label}</span>
                <strong className="mr-1.5 text-[#991B1B]">{count}</strong>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#667085]">
            الاشتراكات المالية المرتبطة ({summary.subscriptionsDetached}) ستُحفظ، لكن ستُفصل عن المجموعة والمعلم.
          </p>
        </div>
      ) : null}

      {summary && (
        <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-lg bg-[#FFF7F7] p-3 text-sm text-[#991B1B]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-red-600"
          />
          <span>أفهم أن هذه البيانات ستُحذف نهائيًا ولا يمكن استرجاعها.</span>
        </label>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={submitting || summaryLoading || !summary || !confirmed}
          className="flex-1 rounded-xl bg-red-600 py-3 text-[14px] font-medium !text-white hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? "جارٍ الحذف..." : "حذف نهائي للمجموعة"}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={submitting}
          className="flex-1 rounded-xl border border-[#E5E5E5] py-3 text-[14px] font-medium text-[#123C91] hover:border-[#123C91] disabled:opacity-60"
        >
          إلغاء
        </button>
      </div>
    </Modal>
  );
};

// ─── Add Student Modal ─────────────────────────────────────────────────────────
export const AddStudentModal = ({ open, onClose, group, onChanged }) => {
  const [students, setStudents] = useState([]);
  const [classroomStudentIds, setClassroomStudentIds] = useState(new Set());
  const [subscribedStudents, setSubscribedStudents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // فلاتر البحث
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open || !group) return;
    setSelectedStudent("");
    setSelectedPackage("");
    setSearch("");
    setSubscribedStudents([]);
    setError(null);
    setLoading(true);

    // ⚠️ الكود القديم كان بيستخدم .then(async ...).finally(...) من غير try/catch.
    // أي throw بسيط جوه الـ async callback كان بيعمل unhandled rejection ويوقف
    // التنفيذ بصمت، فمكانش بيكمل يجيب المراحل/الصفوف، وكانت setLoading(false)
    // بتتنفذ قبل ما المراحل/الصفوف يخلصوا تحميل. اتصلح الاتنين هنا.
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getClassroomEnrollmentOptions(group.id);
        const data = response.data?.data ?? response.data ?? {};
        if (cancelled) return;
        setStudents((data.students || []).filter((student) => resolveStudentId(student)));
        setClassroomStudentIds(new Set((data.enrolledStudentIds || []).map(String)));
        setSubscribedStudents(data.subscribedStudents || []);
        setPackages(data.packages || []);
      } catch {
        if (!cancelled) {
          setError("حصل خطأ أثناء تحميل البيانات");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, group]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const subscribedStudentIds = new Set(subscribedStudents.map((item) => String(item.studentId)));
    return students.filter((s) => {
      const isAlreadyInClassroom = studentIdentityIds(s).some((id) =>
        classroomStudentIds.has(id),
      );
      const hasActiveSubscription = studentIdentityIds(s).some((id) =>
        subscribedStudentIds.has(id),
      );
      const matchesSearch =
        !q || resolvePersonName(s).toLowerCase().includes(q);
      return !isAlreadyInClassroom && !hasActiveSubscription && matchesSearch;
    });
  }, [students, classroomStudentIds, subscribedStudents, search]);

  const subscribedStudentDetails = useMemo(
    () => subscribedStudents.map((item) => ({
      ...item,
      name: resolvePersonName(students.find((student) =>
        studentIdentityIds(student).includes(String(item.studentId)),
      )),
    })),
    [students, subscribedStudents],
  );

  const subscriptionNotice = useMemo(() => {
    const currentGroupId = String(group?.id || "");
    const inThisGroup = subscribedStudentDetails.filter(
      (item) => String(item.classroomId || "") === currentGroupId,
    );
    const inAnotherGroup = subscribedStudentDetails.filter(
      (item) => String(item.classroomId || "") !== currentGroupId,
    );

    return { inThisGroup, inAnotherGroup };
  }, [group?.id, subscribedStudentDetails]);

  const handleSubmit = async () => {
    if (!selectedStudent) {
      setError("من فضلك اختر الطالب");
      return;
    }
    if (!selectedPackage) {
      setError("من فضلك اختر الباقة");
      return;
    }
    if (!group.subjectId || !group.teacherId) {
      setError("لا يمكن الإضافة: المجموعة دي لسه مالهاش مادة أو معلم معيّن");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // شكل الـ body المطلوب فعلاً (زي صفحة "إضافة اشتراك"): items array
      // فيه subject/teacher/classroom/package لكل عنصر، مش body مسطح
      await createSubscription({
        student: selectedStudent,
        items: [
          {
            subject: group.subjectId,
            teacher: group.teacherId,
            classroom: group.id,
            package: selectedPackage,
            type: group.classroomType || "group",
            discount: 0,
          },
        ],
      });
      onChanged?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة طالب للمجموعة">
      <StudentCombobox
        label="الطالب"
        search={search}
        onSearchChange={setSearch}
        options={filteredStudents.map((s) => ({
          value: resolveStudentId(s),
          label: resolvePersonName(s),
        }))}
        selectedId={selectedStudent}
        onSelect={(option) => {
          setSelectedStudent(option?.value || "");
          if (!option) return; // مسحنا الاختيار، النص هيفضل زي ما كتبه المستخدم
          setSearch(option.label);
        }}
        placeholder={loading ? "جاري التحميل..." : "اكتب اسم الطالب..."}
        disabled={loading}
        emptyLabel="لا يوجد طلاب مطابقين"
      />
      {subscribedStudentDetails.length > 0 && (
        <div className="-mt-1 mb-3 space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          {subscriptionNotice.inThisGroup.length > 0 && (
            <p>
              مضافون بالفعل للمجموعة: {subscriptionNotice.inThisGroup.map((item) => `${item.name} (متبقي ${item.remainingSessions} حصة)`).join("، ")}.
            </p>
          )}
          {subscriptionNotice.inAnotherGroup.length > 0 && (
            <p>
              لا يمكن إضافة {subscriptionNotice.inAnotherGroup.map((item) => `${item.name} (${item.classroomName} — متبقي ${item.remainingSessions} حصة)`).join("، ")} لأن لديهم اشتراكًا نشطًا في هذه المادة.
            </p>
          )}
        </div>
      )}
      <SelectField
        label="الباقة"
        placeholder={loading ? "جاري التحميل..." : "اختر الباقة"}
        options={packages
          .map((p) => ({
            value: p.id || p._id,
            label: typeof p.name === "string" ? p.name : resolveName(p.name),
          }))
          .filter((option) => option.value)}
        value={selectedPackage}
        onChange={setSelectedPackage}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter
        onClose={onClose}
        confirmLabel="إضافة"
        onConfirm={handleSubmit}
        loading={submitting}
      />
    </Modal>
  );
};

// ─── Assign Teacher Modal ───────────────────────────────────────────────────────
const AssignTeacherModal = ({ open, onClose, group, onChanged }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !group) return;
    setSelectedTeacher("");
    setError(null);
    setLoading(true);

    getClassroomReplacementTeachers(group.id)
      .then((res) => setTeachers(res.data?.data || []))
      .catch(() => {
        setError("تعذر تحميل قائمة المعلمين");
      })
      .finally(() => setLoading(false));
  }, [open, group]);

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      setError("من فضلك اختر المعلم");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateClassroom(group.id, { teacher: selectedTeacher });
      onChanged?.();
      toast.success("تم التعيين بنجاح");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تعيين المعلم");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تعيين معلم">
      <SelectField
        label="المعلم"
        placeholder={loading ? "جاري التحميل..." : "اختر المعلم"}
        options={teachers.map((t) => ({
          value: resolvePersonId(t),
          label: resolvePersonName(t),
        }))}
        value={selectedTeacher}
        onChange={setSelectedTeacher}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter
        onClose={onClose}
        confirmLabel="تعيين المعلم"
        onConfirm={handleSubmit}
        loading={submitting}
      />
    </Modal>
  );
};

// ─── Assign Substitute Modal ────────────────────────────────────────────────────
export const AssignSubstituteModal = ({ open, onClose, group, onChanged }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !group) return;
    setSelectedTeacher("");
    setError(null);
    setLoading(true);

    getClassroomReplacementTeachers(group.id)
      .then((res) => setTeachers(res.data?.data || []))
      .catch(() => {
        setError("تعذر تحميل قائمة المعلمين");
      })
      .finally(() => setLoading(false));
  }, [open, group]);

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      setError("من فضلك اختر المعلم البديل");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateClassroomSubstituteTeacher(group.id, selectedTeacher);
      onChanged?.();
      toast.success("تم التعيين بنجاح");
      onClose();
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const apiCode = err.response?.data?.code || err.response?.data?.error;
      setError(
        apiCode === "SUBSTITUTE_TEACHER_SAME_AS_PRIMARY"
          ? "لا يمكن تعيين نفس المعلم الأساسي كمعلم بديل"
          : apiMessage || "حدث خطأ أثناء تعيين المعلم البديل",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تعيين معلم بديل">
      {group?.teacher && (
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
          <span className="text-[12px] text-[#92400E]">
            المعلم الحالي:{" "}
            <strong className="text-[#78350F]">{group.teacher}</strong>
          </span>
        </div>
      )}
      <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[13px] leading-6 text-[#123C91]">
        المعلم المختار سيصبح المعلم الأساسي للمجموعة. سيُزال المعلم الحالي
        من المجموعة وشات المجموعة، ولن تتغير الحصص أو المستحقات السابقة.
      </p>
      <SelectField
        label="المعلم البديل"
        placeholder={loading ? "جاري التحميل..." : "اختر المعلم البديل"}
        options={teachers.map((t) => ({
          value: resolvePersonId(t),
          label: resolvePersonName(t),
        }))}
        value={selectedTeacher}
        onChange={setSelectedTeacher}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter
        onClose={onClose}
        confirmLabel="تأكيد التعيين"
        onConfirm={handleSubmit}
        loading={submitting}
      />
    </Modal>
  );
};

// ─── Dropdown (Portal-based, escapes table overflow clipping) ─────────────────
const MENU_WIDTH = 190;
const MENU_GAP = 6;

const ActionsDropdown = ({
  group,
  onAction,
  onOpenAttendance,
  onOpenLessons,
  onOpenChat,
  onOpenSchedule,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const items = [
    { key: "lessons", label: "عرض الحصص", Icon: BookOpen, nav: "lessons" },
    {
      key: "schedule",
      label: "إنشاء أو تعديل الجدول",
      Icon: CalendarClock,
      nav: "schedule",
    },
    {
      key: "chat",
      label: "فتح محادثة المجموعة",
      Icon: MessageCircle,
      nav: "chat",
    },
    {
      key: "attendance",
      label: "سجل الحضور",
      Icon: ClipboardList,
      isNav: true,
    },
    { key: "add-student", label: "إضافة طالب", Icon: UserPlus },
    { key: "assign-teacher", label: "تعيين معلم", Icon: Users },
    { key: "delete", label: "حذف المجموعة", Icon: Trash2, danger: true },
  ];

  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = items.length * 42 + 16;

    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    let top = rect.bottom + MENU_GAP;
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - MENU_GAP;
    }

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (open) updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => setOpen(false);

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const handleClick = (item) => {
    setOpen(false);
    if (item.nav === "lessons") {
      onOpenLessons(group);
    } else if (item.nav === "schedule") {
      onOpenSchedule(group);
    } else if (item.nav === "chat") {
      onOpenChat(group);
    } else if (item.isNav) {
      onOpenAttendance(group.id);
    } else {
      onAction(item.key, group);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all"
        aria-label="خيارات"
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            dir="rtl"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: MENU_WIDTH,
            }}
            className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[1000] overflow-hidden"
          >
            {items.map(({ key, label, Icon, isNav, nav, danger }, i) => (
              <div key={key}>
                {i > 0 && <div className="h-px bg-[#F3F4F6] mx-2" />}
                <button
                  onClick={() => handleClick({ key, isNav, nav })}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-[13px] transition-colors font-['IBM_Plex_Sans_Arabic'] text-right
                    ${danger ? "text-red-600 hover:bg-red-50" : isNav || nav ? "text-[#123C91] font-medium hover:bg-[#F3F4F6]" : "text-[#374151] hover:bg-[#F3F4F6]"}`}
                >
                  <Icon
                    size={15}
                    className={
                      danger
                        ? "text-red-600"
                        : isNav || nav
                          ? "text-[#123C91]"
                          : "text-[#6B7280]"
                    }
                  />
                  {label}
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

// ─── Mobile Field ─────────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">
      {children}
    </span>
  </div>
);

// ─── Main Table ───────────────────────────────────────────────────────────────
const GroupTable = ({
  groups = [],
  onOpenAttendance,
  onOpenDetails,
  onChanged,
}) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [profileTeacher, setProfileTeacher] = useState(null);

  const openTeacherProfile = (group) => {
    if (!group.teacherId) return;
    setProfileTeacher({
      id: group.teacherId,
      profileId: group.teacherId,
      fullName: group.teacher,
      name: group.teacher,
    });
  };

  const handleOpenAttendance = (groupId) => {
    if (onOpenAttendance) {
      onOpenAttendance(groupId);
    } else {
      navigate(`/admin/groups/${groupId}/attendance`);
    }
  };

  const handleOpenLessons = (group) => {
    navigate(`/admin/groups/${group.id}/lessons`, {
      state: {
        groupName: group.name,
        groupTeacher: group.teacher,
        groupTeacherId: group.teacherId,
        groupSubjectId: group.subjectId,
        classroomType: group.classroomType,
      },
    });
  };

  const handleOpenChat = (group) => {
    navigate("/admin/messages", {
      state: {
        openClassroomId: group.id,
        openClassroomName: group.name,
      },
    });
  };

  const handleOpenSchedule = (group) => {
    navigate(`/admin/groups/${group.id}/schedule`);
  };

  // ✅ لينك اسم المجموعة -> صفحة التفاصيل.
  // مفيش صفحة "تفاصيل مجموعة" منفصلة في الراوتس حالياً، فبنستخدم صفحة الحصص
  // (اللي موجودة أصلاً وشغالة). لو عندك صفحة تفاصيل تانية، مرر onOpenDetails
  // كـ prop من الصفحة الأب أو غيّر المسار هنا.
  const handleOpenDetails = (group) => {
    if (onOpenDetails) {
      onOpenDetails(group);
    } else {
      navigate(`/admin/groups/${group.id}/lessons`, {
        state: {
          groupName: group.name,
          groupTeacher: group.teacher,
          groupTeacherId: group.teacherId,
          groupSubjectId: group.subjectId,
          classroomType: group.classroomType,
        },
      });
    }
  };

  const openAction = (type, group) => setModal({ type, group });
  const closeModal = () => setModal(null);

  if (groups.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]"
      >
        لا توجد مجموعات متاحة
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className="w-full">
        {/* Desktop */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ backgroundColor: "#F9FAFA" }}>
                  {[
                    "اسم المجموعة",
                    "المعلم",
                    "المادة",
                    "المرحلة",
                    "الصف",
                    "الطلاب",
                    "الحالة",
                    "الإجراءات",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-3 lg:py-4 font-['Tajawal'] font-medium text-[15px]">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(g)}
                        className="text-[#123C91] hover:underline text-right transition-colors"
                      >
                        {g.name}
                      </button>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[14px] whitespace-nowrap">
                      {g.teacherId ? (
                        <button
                          type="button"
                          onClick={() => openTeacherProfile(g)}
                          className="font-medium text-[#123C91] transition-colors hover:underline"
                        >
                          {g.teacher ?? "--"}
                        </button>
                      ) : (
                        <span className="text-[#575F69]">{g.teacher ?? "--"}</span>
                      )}
                    </td>
                    {[g.subject, g.stage, g.grade].map((v, i) => (
                      <td
                        key={i}
                        className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap"
                      >
                        {v ?? "--"}
                      </td>
                    ))}
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap">
                      {g.enrolled}/{g.capacity}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      {statusBadge(g.status)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <ActionsDropdown
                        group={g}
                        onAction={openAction}
                        onOpenAttendance={handleOpenAttendance}
                        onOpenLessons={handleOpenLessons}
                        onOpenChat={handleOpenChat}
                        onOpenSchedule={handleOpenSchedule}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(g)}
                  className="text-[#123C91] font-semibold text-[16px] font-['Tajawal'] hover:underline text-right"
                >
                  {g.name}
                </button>
                <ActionsDropdown
                  group={g}
                  onAction={openAction}
                  onOpenAttendance={handleOpenAttendance}
                  onOpenLessons={handleOpenLessons}
                  onOpenChat={handleOpenChat}
                  onOpenSchedule={handleOpenSchedule}
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                {statusBadge(g.status)}
              </div>
              <div className="space-y-0.5">
                <MobileField label="المعلم">
                  {g.teacherId ? (
                    <button
                      type="button"
                      onClick={() => openTeacherProfile(g)}
                      className="font-medium text-[#123C91] hover:underline"
                    >
                      {g.teacher ?? "--"}
                    </button>
                  ) : (
                    g.teacher ?? "--"
                  )}
                </MobileField>
                <MobileField label="المادة">{g.subject}</MobileField>
                <MobileField label="المرحلة">{g.stage}</MobileField>
                <MobileField label="الصف">{g.grade}</MobileField>
                <MobileField label="الطلاب">
                  {g.enrolled}/{g.capacity}
                </MobileField>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddStudentModal
        open={modal?.type === "add-student"}
        onClose={closeModal}
        group={modal?.group}
        onChanged={onChanged}
      />
      <AssignTeacherModal
        open={modal?.type === "assign-teacher"}
        onClose={closeModal}
        group={modal?.group}
        onChanged={onChanged}
      />
      <AssignSubstituteModal
        open={modal?.type === "assign-substitute"}
        onClose={closeModal}
        group={modal?.group}
        onChanged={onChanged}
      />
      <EntityProfileModal
        entity={profileTeacher}
        role="teacher"
        onClose={() => setProfileTeacher(null)}
      />
      <DeleteGroupModal
        open={modal?.type === "delete"}
        onClose={closeModal}
        group={modal?.group}
        onChanged={onChanged}
      />
    </>
  );
};

export default GroupTable;
