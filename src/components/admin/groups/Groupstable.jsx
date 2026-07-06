import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { MoreVertical, UserPlus, Users, UserCheck, X, ChevronDown, ClipboardList } from "lucide-react";
import {
  getAvailableTeachers,
  getAllStudents,
  getClassroomStudents,
  getAllPackages,
  updateClassroom,
} from "../../../services/APIService"; 

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

const resolvePersonName = (p) =>
  p?.user?.fullName || p?.fullName || p?.name || resolveName(p?.name) || "--";

const resolvePersonId = (p) => p?.user?.id || p?.id;

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
const SelectField = ({ label, options, placeholder, value, onChange, disabled }) => (
  <div className="mb-3">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">{label}</label>
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right text-[#1F2937] disabled:opacity-60"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
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

  useEffect(() => {
    if (!open || !group) return;
    setSelectedStudent("");
    setSelectedPackage("");
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

  const handleSubmit = async () => {
    if (!selectedStudent) {
      setError("من فضلك اختر الطالب");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // ⚠️ لسه محتاجين نأكد من بوستمان الـ endpoint الصحيح لإضافة طالب لمجموعة
      // (مفيش POST /classrooms/:id/students في الكولكشن اللي شفناه لحد دلوقتي —
      // الأقرب المتاح هو createSubscription، لكن شكل الـ body غير مؤكد)
      throw new Error(
""      );
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إضافة الطالب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="إضافة طالب للمجموعة">
      <SelectField
        label="الطالب"
        placeholder={loading ? "جاري التحميل..." : "اختر الطالب"}
        options={students.map((s) => ({ value: resolvePersonId(s), label: resolvePersonName(s) }))}
        value={selectedStudent}
        onChange={setSelectedStudent}
        disabled={loading}
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

    getAvailableTeachers()
      .then((res) => setTeachers(res.data?.data || []))
      .catch((err) => {
        console.error("getAvailableTeachers failed:", err);
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
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const REASONS = [
    { value: "leave", label: "إجازة" },
    { value: "sick", label: "مرض" },
    { value: "emergency", label: "ظروف طارئة" },
    { value: "other", label: "أخرى" },
  ];

  useEffect(() => {
    if (!open || !group) return;
    setSelectedTeacher("");
    setReason("");
    setError(null);
    setLoading(true);

    getAvailableTeachers()
      .then((res) => setTeachers((res.data?.data || []).filter((t) => resolvePersonName(t) !== group.teacher)))
      .catch((err) => {
        console.error("getAvailableTeachers failed:", err);
        setError("تعذر تحميل قائمة المعلمين");
      })
      .finally(() => setLoading(false));
  }, [open, group]);

  const handleSubmit = async () => {
    if (!selectedTeacher || !reason) {
      setError("من فضلك اختر المعلم البديل وسبب التعيين");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // ⚠️ مفيش endpoint مؤكد لتعيين معلم بديل لحد دلوقتي — ابعت سكرين شوت من بوستمان لنظبطها
      throw new Error(
        "الـ endpoint بتاع تعيين المعلم البديل لسه مش موجود/مؤكد — ابعت سكرين شوت من بوستمان لنظبطه",
      );
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تعيين المعلم البديل");
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
      <SelectField
        label="المعلم البديل"
        placeholder={loading ? "جاري التحميل..." : "اختر المعلم البديل"}
        options={teachers.map((t) => ({ value: resolvePersonId(t), label: resolvePersonName(t) }))}
        value={selectedTeacher}
        onChange={setSelectedTeacher}
        disabled={loading}
      />
      <SelectField
        label="سبب التعيين"
        placeholder="اختر سبب التعيين"
        options={REASONS}
        value={reason}
        onChange={setReason}
      />
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <ModalFooter onClose={onClose} confirmLabel="تعيين المعلم البديل" onConfirm={handleSubmit} loading={submitting} />
    </Modal>
  );
};

// ─── Dropdown (Portal-based, escapes table overflow clipping) ─────────────────
const MENU_WIDTH = 190;
const MENU_GAP = 6;

const ActionsDropdown = ({ group, onAction, onOpenAttendance }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const items = [
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
    if (item.isNav) {
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
            {items.map(({ key, label, Icon, isNav }, i) => (
              <div key={key}>
                {i > 0 && <div className="h-px bg-[#F3F4F6] mx-2" />}
                <button
                  onClick={() => handleClick({ key, isNav })}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-[#F3F4F6] transition-colors font-['IBM_Plex_Sans_Arabic'] text-right
                    ${isNav ? "text-[#123C91] font-medium" : "text-[#374151]"}`}
                >
                  <Icon size={15} className={isNav ? "text-[#123C91]" : "text-[#6B7280]"} />
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
                  {["اسم المجموعة", "المعلم", "المادة", "المرحلة", "الصف", "الطلاب", "الحالة", "الإجراءات"].map((h) => (
                    <th key={h} className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] font-['Tajawal'] font-medium text-[15px]">{g.name}</td>
                    {[g.teacher, g.subject, g.stage, g.grade].map((v, i) => (
                      <td key={i} className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap">{v ?? "--"}</td>
                    ))}
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[14px] whitespace-nowrap">{g.enrolled}/{g.capacity}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(g.status)}</td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <ActionsDropdown group={g} onAction={openAction} onOpenAttendance={handleOpenAttendance} />
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
                <ActionsDropdown group={g} onAction={openAction} onOpenAttendance={handleOpenAttendance} />
              </div>
              <div className="flex items-center gap-2 mb-3">{statusBadge(g.status)}</div>
              <div className="space-y-0.5">
                <MobileField label="المعلم">{g.teacher ?? "--"}</MobileField>
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