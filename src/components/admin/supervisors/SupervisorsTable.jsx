import { MoreVertical } from "lucide-react";

const StatusBadge = ({ status }) => {
  const isActive = status === "نشط";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
};

const SupervisorsTable = ({ supervisors = [] }) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-[0px_0px_4px_0px_rgba(0,0,0,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" dir="rtl">
          <thead>
            <tr className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الاسم</th>
              <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">رقم الهاتف</th>
              <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الحالة</th>
              <th className="px-4 py-3 text-right text-[13px] font-medium text-[#575F69]">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((s, idx) => (
              <tr
                key={s.id}
                className={`border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#F9FAFA] transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-white"
                }`}
              >
                <td className="px-4 py-4 text-[14px] font-medium text-[#1F2937]">{s.name}</td>
                <td className="px-4 py-4 text-[14px] text-[#575F69]">{s.email}</td>
                <td className="px-4 py-4 text-[14px] text-[#575F69]" dir="ltr">{s.phone}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#1F2937] transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {supervisors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF] text-[14px]">
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupervisorsTable;