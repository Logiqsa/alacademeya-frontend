import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_REQUESTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  student: "محمد أحمد",
  subjects:
    i % 3 === 0
      ? ["رياضيات", "لغة عربية", "فيزياء"]
      : i % 3 === 1
      ? ["رياضيات"]
      : ["كيمياء", "رياضيات", "لغة عربية", "فيزياء"],
}));

const MOCK_TEACHERS  = ["أحمد سامي", "محمود فتحي", "هبة الشريف"];
const MOCK_GROUPS    = ["مجموعة السبت 5م", "مجموعة الأحد 7م", "مجموعة الثلاثاء 4م"];
const MOCK_PACKAGES  = ["باقة شهر واحد", "باقة 3 شهور", "باقة الترم كامل"];
const MOCK_DISCOUNTS = [
  { code: "بدون خصم", percent: 0 },
  { code: "SAVE20 — 20%", percent: 20 },
  { code: "WELCOME10 — 10%", percent: 10 },
];

const BASE_PRICE = 200;

// ─── Select Field ─────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-[12px] text-[#8C9198] mb-1.5 text-right">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3.5 appearance-none bg-[#F9FAFA] border border-[#E5E7EB] rounded-lg text-[13px] text-[#1F2937] outline-none cursor-pointer focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/20 transition-colors text-right"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  </div>
);

// ─── Subject Accordion Item ───────────────────────────────────────────────────
const SubjectAccordion = ({ subject, isOpen, onToggle, data, onChange }) => {
  const discountInfo = MOCK_DISCOUNTS.find((d) => d.code === data.discount) ?? MOCK_DISCOUNTS[0];
  const increase = Number(data.increase) || 0;
  const finalPrice = Math.max(0, Math.round(BASE_PRICE * (1 - discountInfo.percent / 100) + increase));

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-4 hover:bg-gray-50/60 transition-colors"
      >
       
        <span className="font-['Tajawal'] font-semibold text-[14px] sm:text-[19px] text-[#1F2937] truncate">
          {subject}
        </span>

         <ChevronDown
          size={17}
          className={`text-[#9CA3AF] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-1  sm:grid-cols-2 gap-3 sm:gap-4 mt-4 mb-2">
            <SelectField
              label="المعلم"
              placeholder="اختر المعلم"
              value={data.teacher}
              onChange={(v) => onChange({ ...data, teacher: v })}
              options={MOCK_TEACHERS}
            />
            <SelectField
              label="المجموعة"
              placeholder="اختر المجموعة"
              value={data.group}
              onChange={(v) => onChange({ ...data, group: v })}
              options={MOCK_GROUPS}
            />
            <SelectField
              label="الباقة"
              placeholder="اختر الباقة"
              value={data.package}
              onChange={(v) => onChange({ ...data, package: v })}
              options={MOCK_PACKAGES}
            />
            <SelectField
              label="الخصم"
              placeholder="اختر كود الخصم"
              value={data.discount}
              onChange={(v) => onChange({ ...data, discount: v })}
              options={MOCK_DISCOUNTS.map((d) => d.code)}
            />
          </div>

          <div>
            <label className="block text-[12px] text-[#8C9198] mb-1.5 text-right">الزيادة (اختياري)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={data.increase}
                onChange={(e) => onChange({ ...data, increase: e.target.value })}
                className="w-full h-11 px-3.5 pl-14 bg-[#F9FAFA] border border-[#E5E7EB] rounded-lg text-[13px] text-[#1F2937] outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/20 transition-colors text-right"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF]">جنيه</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-gray-200">
            <span className="text-[15px] font-bold text-[#123C91]">{finalPrice} جنيه مصري</span>
            <span className="text-[12px] text-[#8C9198]">السعر النهائي</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, show }) => (
  <div
    dir="rtl"
    className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 px-4 w-full max-w-sm ${
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
    }`}
  >
    <div className="flex items-center gap-3 bg-[#1F2937] text-white rounded-xl px-4 py-3.5 shadow-xl">
      <span className="w-7 h-7 rounded-full bg-[#15A862] flex items-center justify-center shrink-0">
        <Check size={15} />
      </span>
      <span className="text-[13px] font-medium">{message}</span>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ActivateSubscriptionPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const request  = MOCK_REQUESTS.find((r) => r.id === Number(id)) ?? MOCK_REQUESTS[0];

  const [openSubject, setOpenSubject] = useState(request.subjects[0]);
  const [subjectData, setSubjectData] = useState(
    Object.fromEntries(
      request.subjects.map((s) => [s, { teacher: "", group: "", package: "", discount: "بدون خصم", increase: "" }])
    )
  );
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleActivate = () => {
    setShowToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <AdminLayout>
      <div dir="rtl" className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden">

        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col-reverse sm:flex-row items-start  sm:items-center justify-between mb-1 gap-2">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] mb-2 font-semibold text-[16px] sm:text-[24px] text-[#123C91]">
              تفعيل الاشتراك
            </h2>
            {/* <button
              onClick={() => navigate(`/admin/subscriptions/requests/${request.id}`)}
              className="flex items-center gap-2 text-[#575F69] hover:text-[#123C91] text-[13px] sm:text-[14px] transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
              <span>تفاصيل الطلب</span>
            </button> */}
          </div>
          <p className="text-[#9CA3AF] text-[12px] sm:text-[16px] mb-6">
            حدد المعلم والمجموعة والباقة لكل مادة ثم أكد الاشتراك
          </p>

          <div className="space-y-3">
            {request.subjects.map((subject) => (
              <SubjectAccordion
                key={subject}
                subject={subject}
                isOpen={openSubject === subject}
                onToggle={() => setOpenSubject(openSubject === subject ? "" : subject)}
                data={subjectData[subject]}
                onChange={(next) => setSubjectData((prev) => ({ ...prev, [subject]: next }))}
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 sm:max-w-md">
             <button
              onClick={handleActivate}
              className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors shadow-sm shadow-[#123C91]/20"
            >
              تفعيل الاشتراك
            </button>
            <button
              onClick={() => navigate(`/admin/subscriptions/requests/${request.id}`)}
              className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
           
          </div>
        </div>
      </div>

      <Toast message="تم تفعيل الاشتراك بنجاح" show={showToast} />
    </AdminLayout>
  );
};

export default ActivateSubscriptionPage;