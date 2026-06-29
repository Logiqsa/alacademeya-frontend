import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Ban, CheckCircle2, Trash2, User } from "lucide-react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-[#8C9198]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
        map[type] ?? map.gray
      }`}
    >
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

// ─── User Avatar Cell ─────────────────────────────────────────────────────────
const UserCell = ({ name, avatarUrl }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm font-medium text-[#1A1A1A]" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {name}
    </span>
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <User size={16} className="text-gray-400" />
      )}
    </div>
  </div>
);

// ─── Actions Dropdown (3-dot menu) ────────────────────────────────────────────
const ActionsMenu = ({ user, onView, onEdit, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSuspended = user.status === "موقوف";

  const items = [
    { key: "view", label: "عرض", icon: Eye, onClick: () => onView?.(user.id) },
    { key: "edit", label: "تعديل", icon: Pencil, onClick: () => onEdit?.(user.id) },
    isSuspended
      ? { key: "activate", label: "تفعيل", icon: CheckCircle2, onClick: () => onToggleStatus?.(user.id), tone: "text-green-600" }
      : { key: "suspend", label: "حظر", icon: Ban, onClick: () => onToggleStatus?.(user.id), tone: "text-orange-500" },
    { key: "delete", label: "حذف", icon: Trash2, onClick: () => onDelete?.(user.id), tone: "text-red-600" },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all duration-200"
        aria-label="إجراءات المستخدم"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <ul className="absolute z-20 top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.key}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50 ${
                  item.tone ?? "text-[#575F69]"
                }`}
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

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

const UsersTable = ({ users = [], onView, onEdit, onToggleStatus, onDelete }) => {
  if (users.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا يوجد مستخدمون متاحون
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-230 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["المستخدم", "النوع", "البريد الإلكتروني", "الحالة", "تاريخ الاضمام", "الإجراءات"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                      style={{ fontWeight: 500, lineHeight: "16px" }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <UserCell name={u.name} avatarUrl={u.avatarUrl} />
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{roleBadge(u.role)}</td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    dir="ltr"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "24px",
                      textAlign: "right",
                    }}
                  >
                    {u.email}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(u.status)}</td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "24px",
                    }}
                  >
                    {u.joinDate}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <ActionsMenu
                      user={u}
                      onView={onView}
                      onEdit={onEdit}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCell name={u.name} avatarUrl={u.avatarUrl} />
              <ActionsMenu
                user={u}
                onView={onView}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {roleBadge(u.role)}
              {statusBadge(u.status)}
            </div>

            <div className="space-y-0.5">
              <MobileField label="البريد الإلكتروني">{u.email}</MobileField>
              <MobileField label="تاريخ الاضمام">{u.joinDate}</MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersTable;