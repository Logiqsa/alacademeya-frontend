import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Ban, CheckCircle2, Trash2, User, X, Info } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-[#8C9198]",
  };
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}>
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "نشط") return <Badge label={status} type="green" />;
  if (status === "معلق") return <Badge label={status} type="orange" />;
  if (status === "موقوف") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />;
};

const roleBadge = (role) => {
  if (role === "معلم") return <Badge label={role} type="green" />;
  if (role === "طالب") return <Badge label={role} type="blue" />;
  if (role === "ولي أمر") return <Badge label={role} type="orange" />;
  return <Badge label={role} type="gray" />;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, avatarUrl, size = 8 }) => (
  <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0`}>
    {avatarUrl
      ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      : <User size={size === 8 ? 15 : 22} className="text-gray-400" />}
  </div>
);

const UserCell = ({ name, avatarUrl }) => (
  <div className="flex items-center gap-2.5">
    <Avatar name={name} avatarUrl={avatarUrl} size={8} />
    <span className="text-sm font-medium text-[#1A1A1A] font-['Tajawal']">{name}</span>
  </div>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="bg-[#F9FAFA] rounded-xl px-4 py-3 flex items-center justify-between">
    <span className="text-[12px] text-[#8C9198]">{label}</span>
    <span className="text-[14px] font-medium text-[#1F2937] font-['Tajawal']">{value ?? "--"}</span>
  </div>
);

// ─── User Details Modal ───────────────────────────────────────────────────────
const UserDetailsModal = ({ open, onClose, user }) => {
  if (!open || !user) return null;

  const isTeacher = user.role === "معلم";
  const isParent = user.role === "ولي أمر";
  const isStudent = user.role === "طالب";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">تفاصيل المستخدم</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={16} />
          <p className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">{user.name}</p>
          <p className="text-[13px] text-[#8C9198]" dir="ltr">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {statusBadge(user.status)}
            {roleBadge(user.role)}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <DetailRow label="تاريخ الانضمام" value={user.joinDate} />
          <DetailRow label="رقم الهاتف" value={user.phone ?? "+20 111 987 6543"} />
        </div>

        {(isStudent || isTeacher) && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="المرحلة" value={user.stage ?? "ثانوية"} />
            {isStudent && <DetailRow label="الباقة" value={user.package ?? "باقة لمادة واحدة"} />}
            {isTeacher && <DetailRow label="المادة" value={user.subject ?? "الرياضيات"} />}
          </div>
        )}

        {isStudent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="الصف" value={user.grade ?? "الثالث الثانوي"} />
          </div>
        )}

        {isTeacher && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="سنوات الخبرة" value={user.experience ?? "8 سنوات"} />
            <DetailRow label="المنهج" value={user.curriculum ?? "المنهج المصري"} />
          </div>
        )}

        {isParent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="اسم الابن" value={user.childName ?? "علي محمد"} />
            <DetailRow label="عدد الأبناء" value={user.childrenCount ?? "1"} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel, confirmClass, iconColor }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center" dir="rtl">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`}>
          <Info size={22} />
        </div>
        <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">{title}</h3>
        <p className="text-[13px] text-[#6B7280] mb-6 font-['IBM_Plex_Sans_Arabic']">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] transition-opacity hover:opacity-90 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-gray-400 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Actions Dropdown ─────────────────────────────────────────────────────────
const ActionsMenu = ({ user, onView, onApprove, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSuspended = user.status === "موقوف";
  const isPending = user.status === "معلق";

  const items = [
    { key: "view", label: "عرض", Icon: Eye, onClick: () => onView?.(user) },
    { key: "approve", label: "قبول الطلب", Icon: CheckCircle2, onClick: () => onApprove?.(user), tone: "text-[#123C91]" },
    isSuspended || isPending
      ? { key: "activate", label: "تفعيل", Icon: CheckCircle2, onClick: () => onToggleStatus?.(user), tone: "text-green-600" }
      : { key: "suspend", label: "رفض", Icon: Ban, onClick: () => onToggleStatus?.(user), tone: "text-orange-500" },
    { key: "delete", label: "حذف", Icon: Trash2, onClick: () => onDelete?.(user), tone: "text-red-600" },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors"
        aria-label="إجراءات المستخدم"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <ul className="absolute z-30 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden" style={{ left: 0 }}>
          {items.map((item) => {
            const Icon = item.Icon;
            return (
              <li
                key={item.key}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50 font-['IBM_Plex_Sans_Arabic'] ${item.tone ?? "text-[#575F69]"}`}
              >
                <Icon size={15} />
                {item.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ u, onView, onApprove, onToggleStatus, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
    <div className="flex items-center justify-between mb-3">
      <UserCell name={u.name} avatarUrl={u.avatarUrl} />
      <ActionsMenu user={u} onView={onView} onApprove={onApprove} onToggleStatus={onToggleStatus} onDelete={onDelete} />
    </div>
    <div className="flex items-center gap-2 mb-3">
      {roleBadge(u.role)}
      {statusBadge(u.status)}
    </div>
    <div className="divide-y divide-gray-50">
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">البريد الإلكتروني</span>
        <span className="text-[13px] text-[#575F69] truncate max-w-[55%] text-left" dir="ltr">{u.email}</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">تاريخ الانضمام</span>
        <span className="text-[13px] text-[#575F69]">{u.joinDate}</span>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const UsersTable = ({ users = [], onView, onEdit, onToggleStatus, onDelete }) => {
  const [detailsUser, setDetailsUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [approveUser, setApproveUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);

  const handleView = (user) => setDetailsUser(user);
  const handleApprove = (user) => setApproveUser(user);
  const handleDelete = (user) => setDeleteUser(user);
  const handleToggleStatus = (user) => {
    if (user.status === "موقوف" || user.status === "معلق") {
      setActivateUser(user);
    } else {
      setSuspendUser(user);
    }
  };

  if (users.length === 0) {
    return (
      <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69] font-['IBM_Plex_Sans_Arabic']">
        لا يوجد مستخدمون متاحون
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic']">

        {/* Desktop */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right" style={{ minWidth: "700px" }}>
              <thead className="bg-[#F9FAFA] border-b border-gray-100">
                <tr>
                  {["المستخدم", "النوع", "البريد الإلكتروني", "الحالة", "تاريخ الانضمام", "الإجراءات"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5"><UserCell name={u.name} avatarUrl={u.avatarUrl} /></td>
                    <td className="px-5 py-3.5">{roleBadge(u.role)}</td>
                    <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap" dir="ltr" style={{ textAlign: "right" }}>{u.email}</td>
                    <td className="px-5 py-3.5">{statusBadge(u.status)}</td>
                    <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">{u.joinDate}</td>
                    <td className="px-5 py-3.5">
                      <ActionsMenu
                        user={u}
                        onView={handleView}
                        onApprove={handleApprove}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
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
          {users.map((u) => (
            <MobileCard
              key={u.id} u={u}
              onView={handleView}
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* ── Modals ── */}

      {/* 1. تفاصيل المستخدم */}
      <UserDetailsModal
        open={!!detailsUser}
        onClose={() => setDetailsUser(null)}
        user={detailsUser}
      />

      {/* 2. قبول الطلب */}
      <ConfirmDialog
        open={!!approveUser}
        onClose={() => setApproveUser(null)}
        onConfirm={() => { onToggleStatus?.(approveUser); setApproveUser(null); }}
        title="الموافقة على الطلب"
        message="هل تريد الموافقة على طلب تسجيل هذا المستخدم وتفعيل حسابه؟"
        confirmLabel="موافقة"
        confirmClass="bg-[#123C91] hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      {/* 3. تفعيل الحساب */}
      <ConfirmDialog
        open={!!activateUser}
        onClose={() => setActivateUser(null)}
        onConfirm={() => { onToggleStatus?.(activateUser); setActivateUser(null); }}
        title="تفعيل الحساب"
        message="هل تريد تفعيل حساب هذا المستخدم؟"
        confirmLabel="تفعيل"
        confirmClass="bg-[#123C91] hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      {/* 4. حظر المستخدم */}
      <ConfirmDialog
        open={!!suspendUser}
        onClose={() => setSuspendUser(null)}
        onConfirm={() => { onToggleStatus?.(suspendUser); setSuspendUser(null); }}
        title="رفض المستخدم"
        message="هل تريد رفض هذا المستخدم وإيقاف حسابه؟"
        confirmLabel="رفض"
        confirmClass="bg-red-500 hover:bg-red-600"
        iconColor="bg-red-100 text-red-500"
      />

      {/* 5. حذف المستخدم */}
      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => { onDelete?.(deleteUser.id); setDeleteUser(null); }}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع."
        confirmLabel="حذف"
        confirmClass="bg-red-500 hover:bg-red-600"
        iconColor="bg-red-100 text-red-500"
      />
    </>
  );
};

export default UsersTable;