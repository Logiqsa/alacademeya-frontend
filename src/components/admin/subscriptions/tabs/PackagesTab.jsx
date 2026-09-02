import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Pencil,
  X,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getCurriculums,
  getAllGrades,
} from "../../../../services/APIService";
import Pagination from "../../../teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../../utils/tablePagination";

const PAGE_SIZE = 10;

const entityId = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";
const entityName = (value) =>
  typeof value === "string"
    ? value
    : value?.name?.ar || value?.name?.en || value?.name || "—";
const extractList = (response, keys = []) => {
  const body = response?.data?.data ?? response?.data ?? response ?? [];
  if (Array.isArray(body)) return body;
  for (const key of keys) if (Array.isArray(body?.[key])) return body[key];
  return [];
};

// ─── Add/Edit Package Modal ───────────────────────────────────────────────────
const PackageModal = ({ open, onClose, pkg, onSaved }) => {
  const isEdit = !!pkg;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState("");
  const [description, setDescription] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [scope, setScope] = useState("all_curriculum");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isMostPopular, setIsMostPopular] = useState(false);
  const [curriculums, setCurriculums] = useState([]);
  const [grades, setGrades] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(pkg?.name ?? "");
      setPrice(pkg?.price ?? "");
      setSessions(pkg?.sessions ?? "");
      setDescription(pkg?.description ?? "");
      setCurriculum(entityId(pkg?.curriculum));
      const gradeIds = (pkg?.grades || []).map(entityId).filter(Boolean);
      setSelectedGrades(gradeIds);
      setScope(gradeIds.length ? "specific_grades" : "all_curriculum");
      setIsActive(pkg?.isActive !== false);
      setIsMostPopular(pkg?.isMostPopular === true);
      setError("");
      getCurriculums()
        .then((response) => setCurriculums(extractList(response, ["curriculums", "results", "items"])))
        .catch(() => setError("تعذر تحميل المناهج"));
    }
  }, [open, pkg]);

  useEffect(() => {
    if (!open || !curriculum) {
      return;
    }
    let active = true;
    setOptionsLoading(true);
    getAllGrades({ curriculum })
      .then((response) => {
        if (active) setGrades(extractList(response, ["grades", "results", "items"]));
      })
      .catch(() => active && setError("تعذر تحميل صفوف المنهج"))
      .finally(() => active && setOptionsLoading(false));
    return () => { active = false; };
  }, [open, curriculum]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !price || !sessions || !curriculum) {
      setError("من فضلك املأ كل الحقول");
      return;
    }
    if (scope === "specific_grades" && !selectedGrades.length) {
      setError("اختر صفاً واحداً على الأقل");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      curriculum,
      grades: scope === "all_curriculum" ? [] : selectedGrades,
      price: Number(price),
      sessions: Number(sessions),
      isActive,
      isMostPopular,
    };

    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const res = await updatePackage(pkg.id, payload);
        onSaved(res.data.data);
      } else {
        const res = await createPackage(payload);
        onSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "حدث خطأ أثناء الحفظ، حاول مرة أخرى",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">
            {isEdit ? "تعديل الباقة" : "إضافة باقة جديدة"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="اسم الباقة">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="باقة المادة الواحدة"
              className={inputCls}
            />
          </Field>
          <Field label="وصف الباقة">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر للباقة" className={`${inputCls} h-20 py-3 resize-none`} />
          </Field>
          <Field label="المنهج">
            <select value={curriculum} onChange={(e) => { setCurriculum(e.target.value); setSelectedGrades([]); setGrades([]); setOptionsLoading(Boolean(e.target.value)); }} className={inputCls}>
              <option value="">اختر المنهج</option>
              {curriculums.map((item) => <option key={entityId(item)} value={entityId(item)}>{entityName(item)}</option>)}
            </select>
          </Field>
          <Field label="إتاحة الباقة">
            <div className="grid grid-cols-2 gap-2">
              {[{ value: "all_curriculum", label: "كل صفوف المنهج" }, { value: "specific_grades", label: "صفوف محددة" }].map((option) => (
                <button key={option.value} type="button" onClick={() => { setScope(option.value); if (option.value === "all_curriculum") setSelectedGrades([]); }} className={`h-11 rounded-lg border text-sm ${scope === option.value ? "border-[#123C91] bg-blue-50 text-[#123C91]" : "border-[#E5E5E5]"}`}>{option.label}</button>
              ))}
            </div>
          </Field>
          {scope === "specific_grades" && <Field label="الصفوف">
            <div className="max-h-36 overflow-y-auto rounded-lg border border-[#E5E5E5] p-3 space-y-2">
              {!curriculum ? <p className="text-xs text-gray-400">اختر المنهج أولاً</p> : optionsLoading ? <p className="text-xs text-gray-400">جاري تحميل الصفوف...</p> : grades.map((grade) => {
                const id = entityId(grade);
                return <label key={id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectedGrades.includes(id)} onChange={() => setSelectedGrades((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])} />{entityName(grade)}</label>;
              })}
            </div>
          </Field>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر (جنيه)">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="250"
                className={inputCls}
              />
            </Field>
            <Field label="عدد الحصص">
              <input
                value={sessions}
                onChange={(e) => setSessions(e.target.value)}
                type="number"
                placeholder="8"
                className={inputCls}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#1F2937]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            الباقة نشطة
          </label>
          <label className="flex items-center gap-2 text-sm text-[#1F2937]">
            <input type="checkbox" checked={isMostPopular} onChange={(e) => setIsMostPopular(e.target.checked)} />
            تعيين كالأكثر طلبًا داخل هذا المنهج
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-[13px] text-red-600">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "حفظ التغييرات" : "إضافة الباقة"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] hover:border-[#123C91] transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] mb-1">
      {label}
    </label>
    {children}
  </div>
);
const inputCls =
  "w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right";

const packageIdOf = (pkg) => pkg?.id || pkg?._id;

const extractPackages = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  return data.packages || data.results || data.items || [];
};

const responseTotalPages = (response) => {
  const body = response?.data ?? response ?? {};
  const data = body?.data ?? body;
  const pagination =
    data?.pagination || data?.meta || body?.pagination || body?.meta || {};
  return Number(
    pagination.totalPages ||
      pagination.pages ||
      data.totalPages ||
      body.totalPages ||
      0,
  );
};

const getEveryPackageByStatus = async (isActive) => {
  const packagesById = new Map();
  let page = 1;

  while (true) {
    const response = await getAllPackages({ isActive, page });
    const pagePackages = extractPackages(response);
    const countBeforePage = packagesById.size;

    pagePackages.forEach((pkg) =>
      packagesById.set(String(packageIdOf(pkg)), pkg),
    );

    const totalPages = responseTotalPages(response);
    const reachedLastKnownPage = totalPages > 0 && page >= totalPages;
    const hasNoNewPackages = packagesById.size === countBeforePage;

    if (!pagePackages.length || reachedLastKnownPage || hasNoNewPackages) break;
    page += 1;
  }

  return [...packagesById.values()];
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const PackagesTab = ({ showAdd, onCloseAdd }) => {
  const [packages, setPackages] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(PAGE_SIZE));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editPkg, setEditPkg] = useState(null);
  const [deletePkg, setDeletePkg] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  const fetchPackages = async (savedPackage = null) => {
    setLoading(true);
    setError("");
    try {
      const [activePackages, inactivePackages, curriculumsResponse] = await Promise.all([
        getEveryPackageByStatus(true),
        getEveryPackageByStatus(false),
        getCurriculums(),
      ]);
      const packagesById = new Map();

      [...activePackages, ...inactivePackages].forEach(
        (pkg) => packagesById.set(String(packageIdOf(pkg)), pkg),
      );
      if (savedPackage && packageIdOf(savedPackage)) {
        packagesById.set(String(packageIdOf(savedPackage)), savedPackage);
      }

      setPackages([...packagesById.values()]);
      setCurriculums(
        extractList(curriculumsResponse, ["curriculums", "results", "items"]),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || "تعذر تحميل الباقات، حاول مرة أخرى",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const unassignedCount = useMemo(
    () => packages.filter((pkg) => !entityId(pkg.curriculum)).length,
    [packages],
  );
  const curriculumNamesById = useMemo(
    () =>
      new Map(
        curriculums.map((curriculumItem) => [
          String(entityId(curriculumItem)),
          entityName(curriculumItem),
        ]),
      ),
    [curriculums],
  );
  const curriculumNameOf = (pkg) => {
    const curriculumId = entityId(pkg.curriculum);
    if (!curriculumId) return "بدون منهج";
    if (typeof pkg.curriculum === "object") return entityName(pkg.curriculum);
    return curriculumNamesById.get(String(curriculumId)) || "منهج غير متاح";
  };
  const visiblePackages = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("ar");
    const filteredByCurriculum =
      selectedCurriculum === "all"
        ? packages
        : selectedCurriculum === "unassigned"
          ? packages.filter((pkg) => !entityId(pkg.curriculum))
          : packages.filter(
              (pkg) =>
                String(entityId(pkg.curriculum)) === String(selectedCurriculum),
            );

    return filteredByCurriculum
      .filter((pkg) => {
        if (!query) return true;
        const curriculumName =
          typeof pkg.curriculum === "object"
            ? entityName(pkg.curriculum)
            : curriculumNamesById.get(String(entityId(pkg.curriculum))) || "";
        return [pkg.name, pkg.description, curriculumName]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("ar").includes(query),
          );
      })
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
      });
  }, [curriculumNamesById, packages, searchQuery, selectedCurriculum]);
  const totalPages = Math.max(1, Math.ceil(visiblePackages.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedPackages = visiblePackages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const packageCountFor = (curriculumId) =>
    packages.filter(
      (pkg) => String(entityId(pkg.curriculum)) === String(curriculumId),
    ).length;

  // بعد ما مودال الإضافة/التعديل يحفظ بنجاح، نحدّث القايمة محليًا بدل ما نعمل fetch تاني
  const handleSaved = (saved) => {
    setPackages((prev) => {
      const savedId = packageIdOf(saved);
      const exists = prev.some(
        (pkg) => String(packageIdOf(pkg)) === String(savedId),
      );
      return exists
        ? prev.map((pkg) =>
            String(packageIdOf(pkg)) === String(savedId) ? saved : pkg,
          )
        : [saved, ...prev];
    });
    setPage(1);
    // الـ backend يلغي isMostPopular من الباقة السابقة داخل المنهج نفسه.
    // إعادة التحميل تضمن انعكاس هذا التغيير على الكروت الأخرى فوراً.
    fetchPackages(saved);
  };

  const handleConfirmDelete = async () => {
    if (!deletePkg) return;
    const packageId = packageIdOf(deletePkg);
    setDeleting(true);
    try {
      await deletePackage(packageId);
      setPackages((prev) =>
        prev.filter((pkg) => String(packageIdOf(pkg)) !== String(packageId)),
      );
      setPage(1);
      setDeletePkg(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || "تعذر حذف الباقة، حاول مرة أخرى",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePackage = async (pkg) => {
    const packageId = packageIdOf(pkg);
    if (!packageId || togglingIds.includes(String(packageId))) return;
    const nextActive = pkg.isActive === false;
    setTogglingIds((current) => [...current, String(packageId)]);
    setError("");
    try {
      const response = await updatePackage(packageId, { isActive: nextActive });
      const updated = response.data?.data ?? response.data?.package ?? response.data;
      setPackages((current) =>
        current.map((item) =>
          String(packageIdOf(item)) === String(packageId)
            ? { ...item, ...(updated && typeof updated === "object" ? updated : {}), isActive: nextActive }
            : item,
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحديث حالة الباقة، حاول مرة أخرى");
    } finally {
      setTogglingIds((current) => current.filter((id) => id !== String(packageId)));
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-20 text-[#8C9198]"
        dir="rtl"
      >
        <Loader2 size={20} className="animate-spin ml-2" />
        <span className="text-[14px]">جاري تحميل الباقات...</span>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px]"
          dir="rtl"
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {packages.length > 0 && (
        <>
          <div className="relative mb-4 max-w-md" dir="rtl">
            <Search
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8C9198]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث باسم الباقة أو المنهج..."
              aria-label="البحث في الباقات"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-11 pl-4 text-sm text-[#1F2937] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#123C91]"
            />
          </div>
          <div
            className="mb-5 flex gap-2 overflow-x-auto pb-2"
            dir="rtl"
            aria-label="تصفية الباقات حسب المنهج"
          >
          <button
            type="button"
            onClick={() => {
              setSelectedCurriculum("all");
              setPage(1);
            }}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${selectedCurriculum === "all" ? "border-[#123C91] bg-[#123C91] text-white" : "border-gray-200 bg-white text-[#575F69] hover:border-[#123C91]"}`}
          >
            كل المناهج ({packages.length})
          </button>
          {curriculums.map((curriculumItem) => {
            const curriculumId = entityId(curriculumItem);
            const active = String(selectedCurriculum) === String(curriculumId);
            return (
              <button
                key={curriculumId}
                type="button"
                onClick={() => {
                  setSelectedCurriculum(curriculumId);
                  setPage(1);
                }}
                className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${active ? "border-[#123C91] bg-[#123C91] text-white" : "border-gray-200 bg-white text-[#575F69] hover:border-[#123C91]"}`}
              >
                {entityName(curriculumItem)} ({packageCountFor(curriculumId)})
              </button>
            );
          })}
          {unassignedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedCurriculum("unassigned");
                setPage(1);
              }}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${selectedCurriculum === "unassigned" ? "border-amber-600 bg-amber-600 text-white" : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-500"}`}
            >
              بدون منهج ({unassignedCount})
            </button>
          )}
          </div>
        </>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-20 text-[#8C9198] text-[14px]" dir="rtl">
          لا توجد باقات حالياً
        </div>
      ) : visiblePackages.length === 0 ? (
        <div className="text-center py-16 text-[#8C9198] text-[14px]" dir="rtl">
          {searchQuery.trim()
            ? "لا توجد باقات مطابقة للبحث"
            : "لا توجد باقات مرتبطة بهذا المنهج"}
        </div>
      ) : (
        <div className="space-y-4">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
            totalItems={visiblePackages.length}
            displayedCount={paginatedPackages.length}
            unitLabel="باقة"
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white" dir="rtl">
            <table className="w-full min-w-[900px] border-collapse text-right">
            <thead className="bg-[#F8FAFC] text-[13px] font-semibold text-[#575F69]">
              <tr>
                <th className="px-5 py-4">اسم الباقة</th>
                <th className="px-5 py-4">المنهج</th>
                <th className="px-5 py-4">السعر</th>
                <th className="px-5 py-4">عدد الحصص</th>
                <th className="px-5 py-4">تاريخ الإضافة</th>
                <th className="px-5 py-4">الحالة</th>
                <th className="px-5 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px] text-[#374151]">
              {paginatedPackages.map((pkg) => {
                const packageId = packageIdOf(pkg);
                const toggling = togglingIds.includes(String(packageId));
                return (
                  <tr key={packageId} className="transition-colors hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1F2937]">{pkg.name}</span>
                        {pkg.isMostPopular && (
                          <span className="rounded-full bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#123C91]">
                            الأكثر طلبًا
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">{curriculumNameOf(pkg)}</td>
                    <td className="px-5 py-4 font-semibold text-[#123C91]">
                      {Number(pkg.price || 0).toLocaleString("ar-EG")} جنيه
                    </td>
                    <td className="px-5 py-4">{pkg.sessions} حصة</td>
                    <td className="px-5 py-4 text-[#6B7280]">
                      {pkg.createdAt
                        ? new Date(pkg.createdAt).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={pkg.isActive !== false}
                          aria-label={pkg.isActive !== false ? "إلغاء تفعيل الباقة" : "تفعيل الباقة"}
                          title={pkg.isActive !== false ? "إلغاء تفعيل الباقة" : "تفعيل الباقة"}
                          disabled={toggling}
                          onClick={() => handleTogglePackage(pkg)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${pkg.isActive !== false ? "bg-[#00A63E]" : "bg-gray-300"}`}
                        >
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${pkg.isActive !== false ? "right-6" : "right-1"}`} />
                        </button>
                        <span className={pkg.isActive !== false ? "text-[#00A63E]" : "text-[#EF4444]"}>
                          {toggling ? "جاري التحديث..." : pkg.isActive !== false ? "نشطة" : "غير نشطة"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditPkg(pkg)}
                          aria-label={`تعديل باقة ${pkg.name}`}
                          className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-blue-50 hover:text-[#123C91]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletePkg(pkg)}
                          aria-label={`حذف باقة ${pkg.name}`}
                          className="rounded-lg p-2 text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <PackageModal open={showAdd} onClose={onCloseAdd} onSaved={handleSaved} />

      {/* Edit Modal */}
      <PackageModal
        open={!!editPkg}
        onClose={() => setEditPkg(null)}
        pkg={editPkg}
        onSaved={handleSaved}
      />

      {/* Delete Confirm */}
      {deletePkg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletePkg(null);
          }}
        >
          <div
            className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center"
            dir="rtl"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">
              حذف الباقة
            </h3>
            <p className="text-[13px] text-[#6B7280] mb-6">
              هل أنت متأكد من حذف باقة "{deletePkg.name}"؟ لا يمكن التراجع.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-[14px] hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                حذف
              </button>
              <button
                onClick={() => setDeletePkg(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagesTab;
