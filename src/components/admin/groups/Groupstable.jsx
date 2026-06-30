import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, UserPlus, Users, UserCheck, X, ChevronDown, ClipboardList } from "lucide-react";

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
const SelectField = ({ label, options, placeholder }) => (
  <div className="mb-3">
    <label className="block font-['Tajawal'] font-medium text-[14px] text-right text-[#1F2937] pb-1">{label}</label>
    <div className="relative">
      <select
        defaultValue=""
        className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right text-[#1F2937]"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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

const ModalFooter = ({ onClose, confirmLabel }) => (
  <div className="flex gap-3 mt-5">
    <button className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-[#0f3280] transition-colors">
      {confirmLabel}
    </button>
    <button onClick={onClose} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-[#123C91] transition-colors">
      إلغاء
    </button>
  </div>
);

const AddStudentModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="إضافة طالب للمجموعة">
    <SelectField label="الطالب" placeholder="اختر الطالب" options={["أحمد محمد", "سارة علي", "عمر خالد", "نورا إبراهيم"]} />
    <SelectField label="الباقة" placeholder="اختر الباقة" options={["باقة أساسية", "باقة متقدمة", "باقة مميزة"]} />
    <ModalFooter onClose={onClose} confirmLabel="إضافة" />
  </Modal>
);

const AssignTeacherModal = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="تعيين معلم">
    <SelectField label="المعلم" placeholder="اختر المعلم" options={["محمد أحمد", "فاطمة حسن", "أحمد سالم", "منى صالح"]} />
    <ModalFooter onClose={onClose} confirmLabel="تعيين المعلم" />
  </Modal>
);

const AssignSubstituteModal = ({ open, onClose, currentTeacher }) => (
  <Modal open={open} onClose={onClose} title="تعيين معلم بديل">
    {currentTeacher && (
      <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-lg px-3 py-2 mb-4 flex items-center justify-between">
        <span className="text-[12px] text-[#92400E]">المعلم الحالي: <strong className="text-[#78350F]">{currentTeacher}</strong></span>
        <span className="text-[11px] text-[#B45309]">المعلم الحالي</span>
      </div>
    )}
    <SelectField label="المعلم البديل" placeholder="اختر المعلم البديل" options={["أحمد سالم", "فاطمة حسن", "خالد عمر", "منى صالح"]} />
    <SelectField label="سبب التعيين" placeholder="اختر سبب التعيين" options={["إجازة", "مرض", "ظروف طارئة", "أخرى"]} />
    <ModalFooter onClose={onClose} confirmLabel="تعيين المعلم البديل" />
  </Modal>
);

// ─── Dropdown ─────────────────────────────────────────────────────────────────
const ActionsDropdown = ({ group, onAction, onOpenAttendance }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { key: "attendance", label: "سجل الحضور", Icon: ClipboardList, isNav: true },
    { key: "add-student", label: "إضافة طالب", Icon: UserPlus },
    { key: "assign-teacher", label: "تعيين معلم", Icon: Users },
    { key: "assign-substitute", label: "تعيين معلم بديل", Icon: UserCheck },
  ];

  const handleClick = (item) => {
    setOpen(false);
    if (item.isNav) {
      onOpenAttendance(group.id);
    } else {
      onAction(item.key, group);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all"
        aria-label="خيارات"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] bg-white border border-[#E5E7EB] rounded-xl shadow-lg min-w-[190px] z-40 overflow-hidden">
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
        </div>
      )}
    </div>
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
const GroupTable = ({ groups = [], onOpenAttendance }) => {
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

      <AddStudentModal open={modal?.type === "add-student"} onClose={closeModal} />
      <AssignTeacherModal open={modal?.type === "assign-teacher"} onClose={closeModal} />
      <AssignSubstituteModal
        open={modal?.type === "assign-substitute"}
        onClose={closeModal}
        currentTeacher={modal?.group?.teacher}
      />
    </>
  );
};

export default GroupTable;