import React from "react";

const statusStyle = (status) => {
  if (status === "نشطة")
    return "bg-[#00A63E26] text-[#00A63E]";

  if (status === "منتهية")
    return "bg-[#D32F2F26] text-[#D32F2F]";

  if (status === "قيد المراجعة")
    return "bg-[#F59E0B26] text-[#F59E0B]";

  return "";
};

const defaultData = [
  {
    name: "محمد أحمد",
    plan: "الباقة الأساسية",
    totalHours: "8 ساعات",
    consumed: "4 ساعات",
    remaining: "4 ساعات",
    duration: "شهر",
    startDate: "01/06/2026",
    endDate: "01/07/2026",
    amount: "EGP 700",
    status: "نشطة",
  },
  {
    name: "سلمى أحمد",
    plan: "الباقة الأساسية",
    totalHours: "8 ساعات",
    consumed: "--",
    remaining: "--",
    duration: "شهر",
    startDate: "--",
    endDate: "--",
    amount: "EGP 700",
    status: "قيد المراجعة",
  },
  {
    name: "سلمى أحمد",
    plan: "الباقة المتقدمة",
    totalHours: "24 ساعة",
    consumed: "24 ساعة",
    remaining: "0 ساعة",
    duration: "شهر",
    startDate: "01/05/2026",
    endDate: "01/06/2026",
    amount: "EGP 1,500",
    status: "منتهية",
  },
];

const SubscriptionTable = ({ data = defaultData }) => {
  const headers = [
    "الابن",
    "الباقة",
    "إجمالي الساعات",
    "المستهلك",
    "المتبقي",
    "مدة الاشتراك",
    "تاريخ البدء",
    "تاريخ الانتهاء",
    "المبلغ",
    "الحالة",
  ];

  return (
    <>
      {/* Desktop Table */}
      <div
        className="
          hidden
          lg:block
          bg-white
          border
          border-[#E5E5E5]
          rounded-2xl
          overflow-hidden
          shadow-sm
        "
      >
        <table
          className="w-full border-collapse"
          dir="rtl"
        >
          <thead>
            <tr className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="
                    px-4
                    py-4
                    text-right
                    text-[14px]
                    font-medium
                    text-[#575F69]
                    whitespace-nowrap
                  "
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="
                  border-b
                  border-[#E5E5E5]
                  hover:bg-[#FAFAFA]
                  transition-colors
                "
              >
                <td className="px-4 py-5 font-medium text-[#1F2937]">
                  {row.name}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.plan}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.totalHours}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.consumed}
                </td>

                <td className="px-4 py-5 text-center">
                  <span className="text-[#123C91] font-medium">
                    {row.remaining}
                  </span>
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.duration}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.startDate}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.endDate}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.amount}
                </td>

                <td className="px-4 py-5">
                  <span
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-medium
                      ${statusStyle(row.status)}
                    `}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden mt-4 space-y-4">
        {data.map((row, index) => (
          <div
            key={index}
            className="
              bg-white
              border
              border-[#E5E5E5]
              rounded-2xl
              p-4
              shadow-sm
            "
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1F2937]">
                {row.name}
              </h3>

              <span
                className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-medium
                  ${statusStyle(row.status)}
                `}
              >
                {row.status}
              </span>
            </div>

            <div className="space-y-3">
              <InfoRow label="الباقة" value={row.plan} />
              <InfoRow label="إجمالي الساعات" value={row.totalHours} />
              <InfoRow label="المستهلك" value={row.consumed} />
              <InfoRow
                label="المتبقي"
                value={row.remaining}
                highlight
              />
              <InfoRow label="مدة الاشتراك" value={row.duration} />
              <InfoRow label="تاريخ البدء" value={row.startDate} />
              <InfoRow label="تاريخ الانتهاء" value={row.endDate} />
              <InfoRow label="المبلغ" value={row.amount} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const InfoRow = ({
  label,
  value,
  highlight = false,
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[#575F69] text-sm">
      {label}
    </span>

    <span
      className={`text-sm font-medium ${
        highlight
          ? "text-[#123C91]"
          : "text-[#1F2937]"
      }`}
    >
      {value}
    </span>
  </div>
);

export default SubscriptionTable;