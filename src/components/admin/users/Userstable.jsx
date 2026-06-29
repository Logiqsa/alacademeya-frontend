import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Ban, CheckCircle2, Trash2, User } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green:  "bg-[#00A63E26] text-[#00A63E]",
    blue:   "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red:    "bg-red-100 text-red-600",
    gray:   "bg-gray-100 text-[#8C9198]",
  };
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray}`}>
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "نشط")   return <Badge label={status} type="green" />;
  if (status === "معلق")  return <Badge label={status} type="orange" />;
  if (status === "موقوف") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />;
};

const roleBadge = (role) => {
  if (role === "معلم")    return <Badge label={role} type="green" />;
  if (role === "طالب")   return <Badge label={role} type="blue" />;
  if (role === "ولي أمر") return <Badge label={role} type="orange" />;
  return <Badge label={role} type="gray" />;
};

// ─── Avatar Cell ──────────────────────────────────────────────────────────────
const UserCell = ({ name, avatarUrl }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
      {avatarUrl
        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        : <User size={15} className="text-gray-400" />}
    </div>
    <span className="text-sm font-medium text-[#1A1A1A] font-['Tajawal']">{name}</span>
  </div>
);

// ─── Actions Dropdown ─────────────────────────────────────────────────────────
const ActionsMenu = ({ user, onView, onEdit, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSuspended = user.status === "موقوف";

  const items = [
    { key: "view",    label: "عرض",   icon: Eye,          onClick: () => onView?.(user.id) },
    { key: "edit",    label: "تعديل", icon: Pencil,        onClick: () => onEdit?.(user.id) },
    isSuspended
      ? { key: "activate", label: "تفعيل", icon: CheckCircle2, onClick: () => onToggleStatus?.(user.id), tone: "text-green-600" }
      : { key: "suspend",  label: "حظر",   icon: Ban,          onClick: () => onToggleStatus?.(user.id), tone: "text-orange-500" },
    { key: "delete",  label: "حذف",   icon: Trash2,        onClick: () => onDelete?.(user.id), tone: "text-red-600" },
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
        <ul
          className="absolute z-30 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          // flip to right if near left edge; default opens to the left
          style={{ left: 0 }}
        >
          {items.map((item) => {
            const Icon = item.icon;
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
const MobileCard = ({ u, onView, onEdit, onToggleStatus, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
    {/* Top: avatar + name + menu */}
    <div className="flex items-center justify-between mb-3">
      <UserCell name={u.name} avatarUrl={u.avatarUrl} />
      <ActionsMenu user={u} onView={onView} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
    </div>

    {/* Badges row */}
    <div className="flex items-center gap-2 mb-3">
      {roleBadge(u.role)}
      {statusBadge(u.status)}
    </div>

    {/* Details */}
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
  if (users.length === 0) {
    return (
      <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69] font-['IBM_Plex_Sans_Arabic']">
        لا يوجد مستخدمون متاحون
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic']">

      {/* ── Desktop table (md+) ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right" style={{ minWidth: "700px" }}>
            <thead className="bg-[#F9FAFA] border-b border-gray-100">
              <tr>
                {["المستخدم", "النوع", "البريد الإلكتروني", "الحالة", "تاريخ الانضمام", "الإجراءات"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap">
                    {h}
                  </th>
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
                    <ActionsMenu user={u} onView={onView} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (< md) ── */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <MobileCard key={u.id} u={u} onView={onView} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default UsersTable;