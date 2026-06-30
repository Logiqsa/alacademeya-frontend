import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status, remainingTime }) => {
  if (status === "نشط") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EAF4FF] text-[#123C91]">
          نشط
        </span>
        {remainingTime && (
          <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">{remainingTime}</span>
        )}
      </div>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#575F69]">
      مكتمل
    </span>
  );
};

const ExamsTable = ({ exams = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-right min-w-[760px]">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F9FAFA]">
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69]">عنوان الاختبار</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69]">المجموعة</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69]">الحصة</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69]">موعد الاختبار</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69] text-center">الحالة</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69] text-center">الدرجة</th>
              <th className="px-5 py-3.5 text-sm font-semibold text-[#575F69] text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  لا توجد اختبارات مطابقة
                </td>
              </tr>
            ) : (
              exams.map((e) => (
                <tr key={e.id} className="border-b border-[#F1F1F1] last:border-b-0 hover:bg-[#F9FAFA] transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#1F2937] whitespace-nowrap">{e.title}</td>
                  <td className="px-5 py-4 text-sm text-[#575F69] whitespace-nowrap">{e.group}</td>
                  <td className="px-5 py-4 text-sm text-[#575F69] whitespace-nowrap">{e.lesson || "--"}</td>
                  <td className="px-5 py-4 text-sm text-[#575F69] whitespace-nowrap">{e.date}</td>
                  <td className="px-5 py-4 text-center">
                    <StatusBadge status={e.status} remainingTime={e.remainingTime} />
                  </td>
                  <td className="px-5 py-4 text-sm text-[#575F69] text-center whitespace-nowrap">
                    {e.grade ?? "--"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {e.status === "نشط" ? (
                      <button
                        onClick={() => navigate(`/student/exams/${e.id}/take`)}
                        className="px-4 py-2 rounded-lg bg-[#123C91] text-white text-xs font-semibold whitespace-nowrap hover:bg-[#0F2F73] transition-colors"
                      >
                        بدء الاختبار
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exams/${e.id}/result`)}
                        className="px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#575F69] text-xs font-semibold whitespace-nowrap hover:bg-[#F9FAFA] transition-colors"
                      >
                        عرض النتيجة
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamsTable;