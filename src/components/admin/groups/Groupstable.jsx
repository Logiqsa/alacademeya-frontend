import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { MoreVertical, UserPlus, Users, UserCheck, X, ChevronDown, ClipboardList, BookOpen, Search } from "lucide-react";
import {
  getTeachers,
  getAllStudents,
  getClassroomStudents,
  getAllPackages,
  updateClassroom,
  updateClassroomSubstituteTeacher,
  createSubscription,
} from "../../../services/APIService"; 

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const resolvePersonName = (p) =>
  p?.user?.fullName || p?.fullName || p?.name || resolveName(p?.name) || "--";

const resolvePersonId = (p) => p?.teacherId || p?.id || p?._id || p?.user?.id;

// ⚠️ افتراض: الطالب فيه حقل "stage" و"grade" مباشر أو جوه object فيه name/ar/en —
// لسه محتاج تأكيد من بوستمان/Network tab لشكل الـ student object الراجع من getAllStudents()
const resolveStageName = (s) => {
  const stage = s?.stage ?? s?.stageId;
  if (!stage) return null;
  if (typeof stage === "string") return stage;
  const nested = stage.name ?? stage;
  const resolved = resolveName(nested);
  return resolved !== "--" ? resolved : null;
};

const resolveGradeName = (s) => {
  const grade = s?.grade ?? s?.gradeId;
  if (!grade) return null;
  if (typeof grade === "string") return grade;
  const nested = grade.name ?? grade;
  const resolved = resolveName(nested);
  return resolved !== "--" ? resolved : null;
};

// بترجع بس المعلمين النشطين والموثّقين، بنفس شرط باقي الصفحات (AddSubscriptionPage/CreateGroupPages)
const filterActiveTeachers = (list) =>
  (list || []).filter((t) => {
    const user = t.user || {};
    const isActive = t.isActive ?? user.isActive;
    const registrationStatus = t.registrationStatus ?? user.registrationStatus;
    const isDeleted = t.isDeleted ?? user.isDeleted ?? false;
    return isActive === true && registrationStatus === "active" && isDeleted !== true;
  });

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red: "bg-red-100 text-red-500",
    gray: "bg-gray-100 text-[#8C9198]",
  };
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}>
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
const SelectField = ({ label, options, placeholder, value, onChange, disabled, allowClear }) => (
  <div className="mb-3">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">{label}</label>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right text-[#1F2937] disabled:opacity-60"
      >
        <option value="" disabled={!allowClear}>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
    </div>
  </div>
);

// ─── Search Field ─────────────────────────────────────────────────────────────
const SearchField = ({ label, value, onChange, placeholder, disabled }) => (
  <div className="mb-3">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">{label}</label>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-11 pr-10 pl-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right text-[#1F2937] disabled:opacity-60"
      />
      <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ModalFooter = ({ onClose, confirmLabel, onConfirm, loading, disabled }) => (
  <div className="flex gap-3 mt-5">
    <button
      onClick={onConfirm}
      disabled={loading || disabled}
      className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-[#0f3280] transition-colors disabled:opacity-60"
    >
      {loading ? "جاري الحفظ..." : confirmLabel}
    </button>
    <button onClick={onClose} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-[#123C91] transition-colors">
      إلغاء
    </button>
  </div>
);

// ─── Add Student Modal ─────────────────────────────────────────────────────────
const AddStudentModal = ({ open, onClose, group, onChanged }) => {
  const [students, setStudents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // فلاتر البحث
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  useEffect(() => {
    if (!open || !group) return;
    setSelectedStudent("");
    setSelectedPackage("");
    setSearch("");
    setStageFilter("");
    setGradeFilter("");
    setError(null);
    setLoading(true);

    Promise.allSettled([
      getAllStudents(),
      getClassroomStudents(group.id),
      getAllPackages(),
    ])
      .then(([allRes, enrolledRes, packagesRes]) => {
        const all = allRes.status === "fulfilled" ? allRes.value.data?.data || [] : [];
        const enrolled = enrolledRes.status === "fulfilled" ? enrolledRes.value.data?.data || [] : [];
        const enrolledIds = new Set(enrolled.map(resolvePersonId));

        setStudents(all.filter((s) => !enrolledIds.has(resolvePersonId(s))));
        setPackages(packagesRes.status === "fulfilled" ? packagesRes.value.data?.data || [] : []);

        if (allRes.status === "rejected") console.error("getAllStudents failed:", allRes.reason);
        if (packagesRes.status === "rejected") console.error("getAllPackages failed:", packagesRes.reason);
      })
      .finally(() => setLoading(false));
  }, [open, group]);

  // خيارات فلتر "المرحلة" مستخرجة من قايمة الطلاب اللي وصلت فعلاً (مفيش استدعاء API إضافي)
  const stageOptions = useMemo(() => {
    const names = new Set(students.map(resolveStageName).filter(Boolean));
    return Array.from(names).map((name) => ({ value: name, label: name }));
  }, [students]);

  // خيارات فلتر "الصف"، لو فيه مرحلة مختارة بيفلتر الصفوف اللي تبعها بس
  const gradeOptions = useMemo(() => {
    const relevant = stageFilter
      ? students.filter((s) => resolveStageName(s) === stageFilter)
      : students;
    const names = new Set(relevant.map(resolveGradeName).filter(Boolean));
    return Array.from(names).map((name) => ({ value: name, label: name }));
  }, [students, stageFilter]);

  // لو الصف المختار بقى مش موجود ضمن خيارات الصف الجديدة (بعد تغيير المرحلة)، بنمسحه
  useEffect(() => {
    if (gradeFilter && !gradeOptions.some((o) => o.value === gradeFilter)) {
      setGradeFilter("");
    }
  }, [gradeOptions, gradeFilter]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !q || resolvePersonName(s).toLowerCase().includes(q);
      const matchesStage = !stageFilter || resolveStageName(s) === stageFilter;
      const matchesGrade = !gradeFilter || resolveGradeName(s) === gradeFilter;
      return matchesSearch && matchesStage && matchesGrade;
    });
  }, [students, search, stageFilter, gradeFilter]);

  // لو الطالب المختار اتشال من نتيجة الفلترة، بنمسح الاختيار عشان منبعتش حاجة مخفية عن المستخدم
  useEffect(() => {
    if (selectedStudent && !filteredStudents.some((s) => resolvePersonId(s) === selectedStudent)) {
      setSelectedStudent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStudents]);

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
      console.error("createSubscription (add student) failed:", err.response?.data || err);
      setError(err.response?.data?.message || "حدث خطأ أثناء إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة طالب للمجموعة">
      <SearchField
        label="بحث عن طالب"
        value={search}
        onChange={setSearch}
        placeholder="اكتب اسم الطالب..."
        disabled={loading}
      />
      <SelectField
        label="المرحلة"
        placeholder="كل المراحل"
        options={stageOptions}
        value={stageFilter}
        onChange={setStageFilter}
        disabled={loading || stageOptions.length === 0}
        allowClear
      />
      <SelectField
        label="الصف"
        placeholder="كل الصفوف"
        options={gradeOptions}
        value={gradeFilter}
        onChange={setGradeFilter}
        disabled={loading || gradeOptions.length === 0}
        allowClear
      />
      <SelectField
        label="الطالب"
        placeholder={loading ? "جاري التحميل..." : filteredStudents.length === 0 ? "لا يوجد طلاب مطابقين" : "اختر الطالب"}
        options={filteredStudents.map((s) => ({ value: resolvePersonId(s), label: resolvePersonName(s) }))}
        value={selectedStudent}
        onChange={setSelectedStudent}
        disabled={loading || filteredStudents.length === 0}
      />
      <SelectField
        label="الباقة"
        placeholder={loading ? "جاري التحميل..." : "اختر الباقة"}
        options={packages.map((p) => ({ value: p.id, label: p.name || resolveName(p.name) }))}
        value={selectedPackage}
        onChange={setSelectedPackage}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter onClose={onClose} confirmLabel="إضافة" onConfirm={handleSubmit} loading={submitting} />
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

    // ⚠️ endpoint /teachers/available كان بيرجع فاضي، رجعنا لـ /teachers المؤكد شغّال
    getTeachers()
      .then((res) => setTeachers(filterActiveTeachers(res.data?.data || [])))
      .catch((err) => {
        console.error("getTeachers failed:", err);
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
      // ⚠️ افتراض: PATCH /classrooms/:id بحقل "teacher" — لسه محتاج تأكيد من بوستمان
      await updateClassroom(group.id, { teacher: selectedTeacher });
      onChanged?.();
      onClose();
    } catch (err) {
      console.error("updateClassroom (assign teacher) failed:", err.response?.data || err);
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
        options={teachers.map((t) => ({ value: resolvePersonId(t), label: resolvePersonName(t) }))}
        value={selectedTeacher}
        onChange={setSelectedTeacher}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter onClose={onClose} confirmLabel="تعيين المعلم" onConfirm={handleSubmit} loading={submitting} />
    </Modal>
  );
};

// ─── Assign Substitute Modal ────────────────────────────────────────────────────
const AssignSubstituteModal = ({ open, onClose, group, onChanged }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !group) return;
    setSelectedTeacher(group.substituteTeacherId || "");
    setError(null);
    setLoading(true);

    // ⚠️ endpoint /teachers/available كان بيرجع فاضي، رجعنا لـ /teachers المؤكد شغّال
    getTeachers()
      .then((res) => setTeachers(filterActiveTeachers(res.data?.data || [])))
      .catch((err) => {
        console.error("getTeachers failed:", err);
        setError("تعذر تحميل قائمة المعلمين");
      })
      .finally(() => setLoading(false));
  }, [open, group]);

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      setError("من فضلك اختر المعلم البديل");
      return;
    }
    if (selectedTeacher === group?.teacherId) {
      setError("لا يمكن تعيين نفس المعلم الأساسي كمعلم بديل");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateClassroomSubstituteTeacher(group.id, selectedTeacher);
      onChanged?.();
      onClose();
    } catch (err) {
      console.error("updateClassroomSubstituteTeacher failed:", err.response?.data || err);
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

  const handleRemove = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await updateClassroomSubstituteTeacher(group.id, null);
      onChanged?.();
      onClose();
    } catch (err) {
      console.error("remove substitute teacher failed:", err.response?.data || err);
      setError(err.response?.data?.message || "حدث خطأ أثناء إزالة المعلم البديل");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تعيين معلم بديل">
      {group?.teacher && (
        <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
          <span className="text-[12px] text-[#92400E]">المعلم الحالي: <strong className="text-[#78350F]">{group.teacher}</strong></span>
        </div>
      )}
      {group?.substituteTeacher && (
        <p className="text-[13px] text-[#575F69] mb-3">
          المعلم البديل الحالي: <strong>{group.substituteTeacher}</strong>
        </p>
      )}
      <SelectField
        label="المعلم البديل"
        placeholder={loading ? "جاري التحميل..." : "اختر المعلم البديل"}
        options={teachers.map((t) => ({ value: resolvePersonId(t), label: resolvePersonName(t) }))}
        value={selectedTeacher}
        onChange={setSelectedTeacher}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter onClose={onClose} confirmLabel="حفظ المعلم البديل" onConfirm={handleSubmit} loading={submitting} />
      {group?.substituteTeacherId && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={submitting}
          className="w-full mt-3 py-3 border border-red-200 rounded-xl text-red-600 font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          إزالة المعلم البديل
        </button>
      )}
    </Modal>
  );
};

// ─── Dropdown (Portal-based, escapes table overflow clipping) ─────────────────
const MENU_WIDTH = 190;
const MENU_GAP = 6;

const ActionsDropdown = ({ group, onAction, onOpenAttendance, onOpenLessons }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const items = [
    { key: "lessons", label: "عرض الحصص", Icon: BookOpen, nav: "lessons" },
    { key: "attendance", label: "سجل الحضور", Icon: ClipboardList, isNav: true },
    { key: "add-student", label: "إضافة طالب", Icon: UserPlus },
    { key: "assign-teacher", label: "تعيين معلم", Icon: Users },
    { key: "assign-substitute", label: "تعيين معلم بديل", Icon: UserCheck },
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
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
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
      onOpenLessons(group.id);
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
            {items.map(({ key, label, Icon, isNav, nav }, i) => (
              <div key={key}>
                {i > 0 && <div className="h-px bg-[#F3F4F6] mx-2" />}
                <button
                  onClick={() => handleClick({ key, isNav, nav })}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-[#F3F4F6] transition-colors font-['IBM_Plex_Sans_Arabic'] text-right
                    ${isNav || nav ? "text-[#123C91] font-medium" : "text-[#374151]"}`}
                >
                  <Icon size={15} className={isNav || nav ? "text-[#123C91]" : "text-[#6B7280]"} />
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
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─── Main Table ───────────────────────────────────────────────────────────────
const GroupTable = ({ groups = [], onOpenAttendance, onChanged }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  const handleOpenAttendance = (groupId) => {
    if (onOpenAttendance) {
      onOpenAttendance(groupId);
    } else {
      navigate(`/admin/groups/${groupId}/attendance`);
    }
  };

  const handleOpenLessons = (groupId) => {
    navigate(`/admin/groups/${groupId}/lessons`);
  };

  const openAction = (type, group) => setModal({ type, group });
  const closeModal = () => setModal(null);

  if (groups.length === 0) {
    return (
      <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]">
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
                  {["اسم المجموعة", "المعلم", "المعلم البديل", "المادة", "المرحلة", "الصف", "الطلاب", "الحالة", "الإجراءات"].map((h) => (
                    <th key={h} className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] font-['Tajawal'] font-medium text-[15px]">{g.name}</td>
                    {[g.teacher, g.substituteTeacher, g.subject, g.stage, g.grade].map((v, i) => (
                      <td key={i} className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap">{v ?? "--"}</td>
                    ))}
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap">{g.enrolled}/{g.capacity}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(g.status)}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <ActionsDropdown group={g} onAction={openAction} onOpenAttendance={handleOpenAttendance} onOpenLessons={handleOpenLessons} />
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
            <div key={g.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#1A1A1A] font-semibold text-[16px] font-['Tajawal']">{g.name}</h4>
                <ActionsDropdown group={g} onAction={openAction} onOpenAttendance={handleOpenAttendance} onOpenLessons={handleOpenLessons} />
              </div>
              <div className="flex items-center gap-2 mb-3">{statusBadge(g.status)}</div>
              <div className="space-y-0.5">
                <MobileField label="المعلم">{g.teacher ?? "--"}</MobileField>
                <MobileField label="المعلم البديل">{g.substituteTeacher ?? "--"}</MobileField>
                <MobileField label="المادة">{g.subject}</MobileField>
                <MobileField label="المرحلة">{g.stage}</MobileField>
                <MobileField label="الصف">{g.grade}</MobileField>
                <MobileField label="الطلاب">{g.enrolled}/{g.capacity}</MobileField>
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
    </>
  );
};

export default GroupTable;