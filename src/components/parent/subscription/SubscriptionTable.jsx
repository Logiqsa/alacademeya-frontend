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

// نحدد لكل صف هل هو "أول صف" في مجموعته (يعني أول مرة يظهر فيها هذا groupId)
// عشان نعرف نطبّق rowSpan على خلية اسم الابن بس في أول صف، ونخفيها في باقي صفوف نفس الابن
const withGroupMeta = (rows) => {
  const seenGroups = new Set();

  return rows.map((row) => {
    const groupId = row.groupId ?? row.id;
    const isFirstInGroup = !seenGroups.has(groupId);
    seenGroups.add(groupId);

    return {
      ...row,
      groupId,
      isFirstInGroup,
      groupSize: row.groupSize ?? 1,
    };
  });
};

// خلية "الباقة" بتعرض اسم المادة كعنوان، واسم المعلم تحته بخط أصغر وأفتح،
// عشان نتجنب مشكلة اختلاط RTL/LTR لما يكون اسم المعلم بالإنجليزي
const PlanCell = ({ subjectName, teacherName }) => (
  <div className="flex flex-col items-center leading-tight">
    <span className="text-[#1F2937] font-medium text-[14px]">
      {subjectName || "--"}
    </span>
    {teacherName && (
      <span className="text-[#9CA3AF] text-[12px] mt-0.5" dir="auto">
        {teacherName}
      </span>
    )}
  </div>
);

// خلية المستهلك/المتبقي: لو القيمة "--" بنعرضها باهتة شفافة بدل نص عادي،
// عشان توضح إن البيانات "لسه متوفرة قريباً" مش حقل اتجاهل أو خطأ
const MutedOrValue = ({ value, highlight = false }) => {
  if (value === "--" || value == null) {
    return <span className="text-[#C7CBD1] text-[13px]">غير متاح</span>;
  }
  return (
    <span className={highlight ? "text-[#123C91] font-medium" : "text-[#575F69]"}>
      {value}
    </span>
  );
};

// "data" المتوقعة هي بيانات حقيقية جاية من الـ API عبر SubscriptionPage.
// لو متبعتش (undefined) أو كانت فاضية [], بنعرض حالة "لا توجد اشتراكات" مباشرة
const SubscriptionTable = ({ data }) => {
  const rows = withGroupMeta(data ?? []);

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
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-[#575F69]"
                >
                  لا توجد اشتراكات حالياً
                </td>
              </tr>
            )}

            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={`
                  border-b
                  border-[#E5E5E5]
                  hover:bg-[#FAFAFA]
                  transition-colors
                  ${row.isFirstInGroup && index !== 0 ? "border-t-2 border-t-[#E5E5E5]" : ""}
                `}
              >
                {/* خلية الابن بتتعرض بس في أول صف من مجموعته، وتمتد (rowSpan)
                    على عدد صفوف باقي المعلمين/المواد بتاعته */}
                {row.isFirstInGroup && (
                  <td
                    rowSpan={row.groupSize}
                    className="
                      px-4
                      py-5
                      font-medium
                      text-[#1F2937]
                      align-middle
                      border-l
                      border-[#F1F1F1]
                    "
                  >
                    {row.name}
                  </td>
                )}

                <td className="px-4 py-5 text-center">
                  <PlanCell
                    subjectName={row.subjectName}
                    teacherName={row.teacherName}
                  />
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.totalHours}
                </td>

                <td className="px-4 py-5 text-center">
                  <MutedOrValue value={row.consumed} />
                </td>

                <td className="px-4 py-5 text-center">
                  <MutedOrValue value={row.remaining} highlight />
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.duration}
                </td>

                <td className="px-4 py-5 text-center text-[#575F69]">
                  {row.startDate}
                </td>

                <td className="px-4 py-5 text-center">
                  <MutedOrValue value={row.endDate} />
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
      {/* في الموبايل بنجمع كل صفوف نفس الابن في كارت واحد بدل ما نكررها */}
      <div className="lg:hidden mt-4 space-y-4">
        {rows.length === 0 && (
          <p className="text-center text-[#575F69] py-8">
            لا توجد اشتراكات حالياً
          </p>
        )}

        {(() => {
          // نجمع الصفوف حسب groupId عشان كل ابن يظهر في كارت واحد
          // يحتوي على كل المواد/المعلمين بتاعته
          const groups = [];
          const groupIndexById = new Map();

          rows.forEach((row) => {
            if (!groupIndexById.has(row.groupId)) {
              groupIndexById.set(row.groupId, groups.length);
              groups.push({ ...row, items: [row] });
            } else {
              groups[groupIndexById.get(row.groupId)].items.push(row);
            }
          });

          return groups.map((group) => (
            <div
              key={group.groupId}
              className="
                bg-white
                border
                border-[#E5E5E5]
                rounded-2xl
                p-6
                shadow-sm
              "
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F2937]">
                  {group.name}
                </h3>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-medium
                    ${statusStyle(group.status)}
                  `}
                >
                  {group.status}
                </span>
              </div>

              <div className="space-y-5">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item.id ?? itemIndex}
                    className={
                      itemIndex !== 0
                        ? "pt-4 border-t border-[#F1F1F1] space-y-3"
                        : "space-y-3"
                    }
                  >
                    <InfoRow
                      label="الباقة"
                      value={
                        <PlanCell
                          subjectName={item.subjectName}
                          teacherName={item.teacherName}
                        />
                      }
                    />
                    <InfoRow label="إجمالي الساعات" value={item.totalHours} />
                    <InfoRow
                      label="المستهلك"
                      value={<MutedOrValue value={item.consumed} />}
                    />
                    <InfoRow
                      label="المتبقي"
                      value={<MutedOrValue value={item.remaining} highlight />}
                    />
                    <InfoRow label="مدة الاشتراك" value={item.duration} />
                    <InfoRow label="تاريخ البدء" value={item.startDate} />
                    <InfoRow
                      label="تاريخ الانتهاء"
                      value={<MutedOrValue value={item.endDate} />}
                    />
                    <InfoRow label="المبلغ" value={item.amount} />
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
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
        highlight && typeof value === "string"
          ? "text-[#123C91]"
          : "text-[#1F2937]"
      }`}
    >
      {value}
    </span>
  </div>
);

export default SubscriptionTable;