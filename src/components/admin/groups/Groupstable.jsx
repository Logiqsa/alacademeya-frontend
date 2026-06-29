import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  if (status === "نشطة") return <Badge label={status} type="green" />;
  if (status === "مكتملة العدد") return <Badge label={status} type="blue" />;
  if (status === "قيد التسجيل") return <Badge label={status} type="orange" />;
  if (status === "متوقفة") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />; // منتهية وغيرها
};

// ─── Action — single button that goes straight to the group's attendance log ──
const AttendanceAction = ({ groupId, onOpenAttendance }) => (
  <button
    onClick={() => onOpenAttendance?.(groupId)}
    className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all duration-200"
    aria-label="فتح سجل الحضور"
    title="سجل الحضور"
  >
    <MoreVertical size={18} />
  </button>
);

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

const GroupsTable = ({ groups = [], onOpenAttendance }) => {
  const navigate = useNavigate();

  const handleOpenAttendance = (groupId) => {
    if (onOpenAttendance) {
      onOpenAttendance(groupId);
    } else {
      navigate(`/admin/groups/${groupId}/attendance`);
    }
  };

  if (groups.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد مجموعات متاحة
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
                {[
                  "اسم المجموعة",
                  "المعلم",
                  "المادة",
                  "المرحلة",
                  "الصف",
                  "الطلاب",
                  "الحالة",
                  "الإجراءات",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                    style={{ fontWeight: 500, lineHeight: "16px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/80 transition-colors">
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
                  >
                    {g.name}
                  </td>

                  {[g.teacher, g.subject, g.stage, g.grade].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData ?? "--"}
                    </td>
                  ))}

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px", lineHeight: "24px" }}
                  >
                    {g.enrolled}/{g.capacity}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(g.status)}</td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <AttendanceAction groupId={g.id} onOpenAttendance={handleOpenAttendance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {groups.map((g) => (
          <div key={g.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1A1A1A] font-semibold text-[16px]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                {g.name}
              </h4>
              <AttendanceAction groupId={g.id} onOpenAttendance={handleOpenAttendance} />
            </div>

            <div className="flex items-center gap-2 mb-3">{statusBadge(g.status)}</div>

            <div className="space-y-0.5">
              <MobileField label="المعلم">{g.teacher ?? "--"}</MobileField>
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
  );
};

export default GroupsTable;