import { useState } from "react";
import { Trash2, Pencil, CheckCircle2, X, ChevronDown } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PACKAGES = [
  {
    id: 1,
    name: "باقة المادة الواحدة",
    status: "نشطة",
    price: 250,
    period: "شهر",
    subscribers: 120,
    features: ["مادة واحدة", "8 حصص شهرياً", "الوصول للتسجيلات"],
  },
  {
    id: 2,
    name: "باقة الثلاث مواد",
    status: "نشطة",
    price: 650,
    period: "شهر",
    subscribers: 120,
    features: ["3 مواد", "24 حصة شهرياً", "الوصول للتسجيلات"],
  },
  {
    id: 3,
    name: "باقة شاملة",
    status: "نشطة",
    price: 1200,
    period: "شهر",
    subscribers: 120,
    features: ["6 مواد", "48 حصة شهرياً", "الوصول للتسجيلات", "دعم 24/7"],
  },
];

// ─── Add/Edit Package Modal ───────────────────────────────────────────────────
const PackageModal = ({ open, onClose, pkg }) => {
  if (!open) return null;
  const isEdit = !!pkg;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">
            {isEdit ? "تعديل الباقة" : "إضافة باقة جديدة"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280]">
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="اسم الباقة">
            <input defaultValue={pkg?.name} placeholder="باقة المادة الواحدة" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر (جنيه)">
              <input defaultValue={pkg?.price} type="number" placeholder="250" className={inputCls} />
            </Field>
            <Field label="المدة">
              <div className="relative">
                <select defaultValue={pkg?.period ?? ""} className={selectCls}>
                  <option value="" disabled>اختر المدة</option>
                  <option>شهر</option>
                  <option>3 أشهر</option>
                  <option>سنة</option>
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
              </div>
            </Field>
          </div>
          <Field label="المميزات (سطر لكل ميزة)">
            <textarea
              defaultValue={pkg?.features?.join("\n")}
              placeholder={"مادة واحدة\n8 حصص شهرياً\nالوصول للتسجيلات"}
              rows={4}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] resize-none text-right"
            />
          </Field>
        </div>

        <div className="flex gap-3 mt-5">
          <button className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors">
            {isEdit ? "حفظ التغييرات" : "إضافة الباقة"}
          </button>
          <button onClick={onClose} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] hover:border-[#123C91] transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] mb-1">{label}</label>
    {children}
  </div>
);
const inputCls = "w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right";
const selectCls = "w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none text-right";

// ─── Package Card ─────────────────────────────────────────────────────────────
const PackageCard = ({ pkg, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3" dir="rtl">
    {/* Top row */}
    <div className="flex items-start justify-between">
      <div className=" items-center gap-2">
        <h1 className="font-['Tajawal'] font-semibold mb-2 text-[17px] text-[#1F2937]">{pkg.name}</h1>
        <span className="text-[12px] font-medium px-3 py-1 rounded-full bg-[#00A63E26] text-[#00A63E]">{pkg.status}</span>

      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onDelete(pkg)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
        <button onClick={() => onEdit(pkg)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#9CA3AF] hover:text-[#374151] transition-colors">
          <Pencil size={15} />
        </button>
      </div>

    </div>

    {/* Price */}
    <div className="text-right">
      <span className="font-['Tajawal'] font-bold text-[28px] text-[#123C91]">{pkg.price.toLocaleString()} جنيه</span>
      <span className="text-[#8C9198] text-[13px] mr-1">/ {pkg.period}</span>
    </div>

    {/* Features */}
    <ul className="space-y-1.5">
      {pkg.features.map((f, i) => (
        <li key={i} className="flex items-center justify-start gap-2 text-[13px] text-[#575F69]">
          <CheckCircle2 size={15} className="text-[#00A63E] shrink-0" />
          <span>{f}</span>

        </li>
      ))}
    </ul>

    {/* Subscribers */}
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
      <span className="text-[12px] text-[#8C9198]">مشترك نشط</span>
      <span className="text-[13px] font-medium text-[#123C91]">{pkg.subscribers}</span>

    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const PackagesTab = ({ showAdd, onCloseAdd }) => {
  const [editPkg, setEditPkg] = useState(null);
  const [deletePkg, setDeletePkg] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PACKAGES.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onEdit={setEditPkg} onDelete={setDeletePkg} />
        ))}
      </div>

      {/* Add Modal */}
      <PackageModal open={showAdd} onClose={onCloseAdd} />

      {/* Edit Modal */}
      <PackageModal open={!!editPkg} onClose={() => setEditPkg(null)} pkg={editPkg} />

      {/* Delete Confirm */}
      {deletePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) setDeletePkg(null); }}>
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center" dir="rtl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">حذف الباقة</h3>
            <p className="text-[13px] text-[#6B7280] mb-6">هل أنت متأكد من حذف باقة "{deletePkg.name}"؟ لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePkg(null)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-[14px] hover:bg-red-600 transition-colors">حذف</button>
              <button onClick={() => setDeletePkg(null)} className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagesTab;