import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { getAllPackages } from "../../services/APIService";

const listFrom = (response) => {
  const body = response?.data;
  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
  return list.map((pkg) => ({
    id: pkg.id ?? pkg._id,
    name: pkg.name?.ar || pkg.name?.en || pkg.name || "باقة",
    sessions: pkg.sessions ?? pkg.numberOfSessions ?? pkg.sessionsCount,
    price: pkg.finalPrice ?? pkg.price,
  })).filter((pkg) => pkg.id);
};

const StudentPackagesPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const subjects = useMemo(() => state?.selectedSubjects || [], [state]);
  const [packagesBySubject, setPackagesBySubject] = useState({});
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjects.length) {
      navigate("/register/subjects", { replace: true, state });
      return;
    }
    let active = true;
    getAllPackages()
      .then((response) => {
        if (!active) return;
        const packages = listFrom(response);
        const entries = subjects.map((subject) => [subject.id, packages]);
        setPackagesBySubject(Object.fromEntries(entries));
        setSelections(Object.fromEntries(entries.filter(([, packages]) => packages[0]).map(([id, packages]) => [id, packages[0].id])));
      })
      .catch(() => toast.error("تعذر تحميل الباقات، حاول مرة أخرى"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [navigate, state, subjects]);

  const selectedCount = useMemo(() => Object.keys(selections).length, [selections]);
  const removeSubject = (id) => setSelections((current) => {
    const next = { ...current };
    delete next[id];
    return next;
  });

  const handleNext = () => {
    if (!selectedCount) return toast.error("يجب اختيار مادة واحدة على الأقل");
    const items = Object.entries(selections).map(([subject, packageId]) => ({
      subject,
      package: packageId,
    }));
    navigate("/register/order-summary", { state: { ...state, orderItems: items } });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[660px] mx-auto p-5" dir="rtl">
        <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-6" />
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-[#123C91] text-sm mb-2">رجوع</button>
          <h1 className="text-[22px] font-bold text-[#1F2937]">اختر باقتك التعليمية</h1>
          <p className="text-sm text-gray-400 mb-5">اختر باقة واحدة لكل مادة</p>

          {loading ? <p className="py-8 text-center text-gray-400">جاري تحميل الباقات...</p> : (
            <div className="space-y-4">
              {subjects.filter(({ id }) => selections[id]).map((subject) => (
                <div key={subject.id} className="relative border border-gray-200 rounded-xl p-4 shadow-sm">
                  <button type="button" aria-label={`إزالة ${subject.name}`} onClick={() => removeSubject(subject.id)} className="absolute left-3 top-3 w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center"><X size={15} /></button>
                  <div className="font-medium text-sm mb-4"><span className="text-[#123C91] ml-2">•</span>{subject.name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(packagesBySubject[subject.id] || []).map((pkg) => {
                      const active = selections[subject.id] === pkg.id;
                      return (
                        <button key={pkg.id} type="button" onClick={() => setSelections((current) => ({ ...current, [subject.id]: pkg.id }))} className={`rounded-lg border p-3 text-center ${active ? "border-[#123C91] bg-blue-50" : "border-gray-200 bg-white"}`}>
                          <span className="block text-sm text-gray-700">{pkg.name}</span>
                          {pkg.sessions != null && <span className="block text-xs text-gray-500">{pkg.sessions} حصة</span>}
                          {pkg.price != null && <strong className="text-[#123C91]">{pkg.price} ج.م</strong>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {subjects.some(({ id }) => !(packagesBySubject[id] || []).length) && <p className="text-sm text-amber-700">لا توجد باقات متاحة حالياً لبعض المواد.</p>}
            </div>
          )}
          <button disabled={loading || !selectedCount} onClick={handleNext} className="w-full h-12 mt-5 rounded-lg bg-[#123C91] text-white font-medium disabled:opacity-60">مراجعة الطلب</button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentPackagesPage;
