import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Layers3,
  LoaderCircle,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import {
  createCourseCategory,
  deleteCourseCategory,
  getAdminCourseCategories,
  updateCourseCategory,
} from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";
import { confirmToast } from "../../utils/confirmToast";

const unwrapList = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return Array.isArray(data) ? data : data?.items || [];
};
const emptyForm = { id: "", nameAr: "", nameEn: "", isActive: true };

export default function CourseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(unwrapList(await getAdminCourseCategories()));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تحميل تصنيفات الدورات"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial API synchronization
    load();
  }, [load]);

  const activeCount = useMemo(
    () => categories.filter((item) => item.isActive !== false).length,
    [categories],
  );
  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };
  const openEdit = (category) => {
    setForm({
      id: category._id || category.id,
      nameAr: category.name?.ar || "",
      nameEn: category.name?.en || "",
      isActive: category.isActive !== false,
    });
    setShowForm(true);
  };
  const closeForm = () => {
    if (!saving) setShowForm(false);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.nameAr.trim() && !form.nameEn.trim())
      return toast.error("اكتب اسم التصنيف بالعربية أو الإنجليزية");
    setSaving(true);
    const payload = {
      name: { ar: form.nameAr.trim(), en: form.nameEn.trim() },
      isActive: form.isActive,
    };
    try {
      if (form.id) await updateCourseCategory(form.id, payload);
      else await createCourseCategory(payload);
      toast.success(form.id ? "تم تعديل التصنيف" : "تم إنشاء التصنيف");
      setShowForm(false);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر حفظ التصنيف"));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (category) => {
    const id = category._id || category.id;
    setUpdatingId(id);
    try {
      await updateCourseCategory(id, { isActive: category.isActive === false });
      setCategories((items) =>
        items.map((item) =>
          (item._id || item.id) === id
            ? { ...item, isActive: item.isActive === false }
            : item,
        ),
      );
      toast.success(
        category.isActive === false ? "تم تفعيل التصنيف" : "تم إيقاف التصنيف",
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تحديث التصنيف"));
    } finally {
      setUpdatingId("");
    }
  };

  const remove = async (category) => {
    const id = category._id || category.id;
    const confirmed = await confirmToast({
      title: "حذف التصنيف؟",
      message: `سيتم حذف تصنيف «${category.name?.ar || category.name?.en || "بدون اسم"}» نهائيًا. لا يمكن حذف تصنيف مستخدم في دورة.`,
      confirmLabel: "حذف",
      danger: true,
    });
    if (!confirmed) return;
    setUpdatingId(id);
    try {
      await deleteCourseCategory(id);
      setCategories((items) => items.filter((item) => (item._id || item.id) !== id));
      toast.success("تم حذف التصنيف");
    } catch (error) {
      const code = error?.apiError?.code || error?.response?.data?.code;
      toast.error(code === "COURSE_CATEGORY_IN_USE" ? "لا يمكن حذف التصنيف لأنه مستخدم في دورة واحدة أو أكثر." : getApiErrorMessage(error, "تعذر حذف التصنيف"));
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <AdminLayout>
      <main dir="rtl" className="min-h-full space-y-4 bg-[#F5F7FB] p-4 sm:p-6">
        <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#1E55B3] p-6 text-white shadow-sm sm:p-8">
          <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8FE3D8]">
                إدارة المحتوى
              </p>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                تصنيفات الدورات
              </h1>
              <p className="mt-2 text-sm text-white/75">
                نظّم التصنيفات التي تظهر للطلاب في كتالوج الدورات.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#123C91] transition hover:bg-[#F1F6FF]"
            >
              <Plus size={18} /> إضافة تصنيف
            </button>
          </div>
        </header>

        <section className="grid gap-3 py-0! sm:grid-cols-2">
          <Stat
            icon={<Layers3 size={23} />}
            label="إجمالي التصنيفات"
            value={categories.length}
            color="blue"
          />
          <Stat
            icon={<CheckCircle2 size={23} />}
            label="التصنيفات النشطة"
            value={activeCount}
            color="green"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E3E9F2] bg-white py-0! shadow-xs">
          <div className="border-b border-[#EEF1F5] p-5">
            <h2 className="font-extrabold text-[#17213A]">قائمة التصنيفات</h2>
            <p className="mt-1 text-xs text-[#98A2B3]">
              الأسماء وحالة الظهور في الكتالوج
            </p>
          </div>
          {loading ? (
            <div className="grid min-h-72 place-items-center">
              <LoaderCircle size={34} className="animate-spin text-[#123C91]" />
            </div>
          ) : categories.length ? (
            <>
              <div className="grid gap-3 p-4 md:hidden">
                {categories.map((category) => (
                  <CategoryCard
                    key={category._id || category.id}
                    category={category}
                    updatingId={updatingId}
                    onToggle={toggle}
                    onEdit={openEdit}
                    onDelete={remove}
                  />
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-right">
                  <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="px-6 py-4">الاسم بالعربية</th>
                      <th className="px-6 py-4">الاسم بالإنجليزية</th>
                      <th className="px-6 py-4 text-center">الحالة</th>
                      <th className="px-6 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F5]">
                    {categories.map((category) => {
                      const id = category._id || category.id;
                      return (
                        <tr key={id} className="transition hover:bg-[#FAFCFF]">
                          <td className="px-6 py-4 font-bold">
                            <Link
                              to={`/admin/course-categories/${encodeURIComponent(id)}/courses`}
                              className="text-[#123C91] underline decoration-[#123C91]/25 underline-offset-4 transition hover:decoration-[#123C91]"
                            >
                              {category.name?.ar || "—"}
                            </Link>
                          </td>
                          <td dir="ltr" className="px-6 py-4 text-[#475467]">
                            {category.name?.en || "—"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <StatusButton
                              category={category}
                              updatingId={updatingId}
                              onToggle={toggle}
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2"><EditButton onClick={() => openEdit(category)} /><DeleteButton disabled={updatingId === id} onClick={() => remove(category)} /></div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="px-4 py-14 text-center text-[#667085]">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF4FF] text-[#123C91]">
                <Tags size={27} />
              </span>
              <h2 className="mt-3 font-bold text-[#17213A]">
                لا توجد تصنيفات بعد
              </h2>
              <p className="mt-1 text-sm">ابدأ بإضافة أول تصنيف للدورات.</p>
            </div>
          )}
        </section>

        {showForm && (
          <div
            className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4"
            onMouseDown={closeForm}
          >
            <form
              onSubmit={save}
              onMouseDown={(event) => event.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-5">
                <div>
                  <h2 className="text-xl font-extrabold text-[#17213A]">
                    {form.id ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
                  </h2>
                  <p className="mt-1 text-xs text-[#98A2B3]">
                    أدخل الاسم الذي سيظهر في كتالوج الدورات.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7]"
                  aria-label="إغلاق"
                >
                  <X size={19} />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <Field
                  label="الاسم بالعربية"
                  placeholder="مثال: البرمجة"
                  value={form.nameAr}
                  onChange={(nameAr) =>
                    setForm((value) => ({ ...value, nameAr }))
                  }
                />
                <Field
                  label="الاسم بالإنجليزية"
                  placeholder="Example: Programming"
                  value={form.nameEn}
                  dir="ltr"
                  onChange={(nameEn) =>
                    setForm((value) => ({ ...value, nameEn }))
                  }
                />
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DCE3EC] bg-[#F8FAFC] p-4 text-sm text-[#344054]">
                  <span>
                    <strong className="block">إظهار التصنيف</strong>
                    <small className="mt-1 block text-[#98A2B3]">
                      سيظهر للطلاب في كتالوج الدورات
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#123C91]"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-[#EAECF0] bg-[#FAFBFC] px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-[#D0D5DD] px-5 py-2.5 font-bold text-[#344054]"
                >
                  إلغاء
                </button>
                <button
                  disabled={saving}
                  className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-6 py-2.5 font-bold text-white disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}

const Stat = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#E3E9F2] bg-white p-5 shadow-xs">
    <span
      className={`grid h-12 w-12 place-items-center rounded-xl ${color === "green" ? "bg-emerald-50 text-emerald-700" : "bg-[#EAF2FF] text-[#123C91]"}`}
    >
      {icon}
    </span>
    <div>
      <p className="text-sm text-[#667085]">{label}</p>
      <strong className="mt-1 block text-2xl text-[#17213A]">{value}</strong>
    </div>
  </div>
);
const StatusButton = ({ category, updatingId, onToggle }) => {
  const id = category._id || category.id;
  return (
    <button
      type="button"
      onClick={() => onToggle(category)}
      disabled={updatingId === id}
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${category.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
    >
      {updatingId === id
        ? "جاري التحديث..."
        : category.isActive !== false
          ? "نشط"
          : "غير نشط"}
    </button>
  );
};
const EditButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-[#C9D7ED] px-4 py-2.5 text-sm font-bold text-[#123C91] hover:bg-[#EEF4FF]"
  >
    <Edit3 size={15} /> تعديل
  </button>
);
const DeleteButton = ({ onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /> حذف</button>
);
const CategoryCard = ({ category, updatingId, onToggle, onEdit, onDelete }) => (
  <article className="rounded-xl border border-[#E5EAF1] p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <Link
          to={`/admin/course-categories/${encodeURIComponent(category._id || category.id)}/courses`}
          className="font-bold text-[#123C91] underline decoration-[#123C91]/25 underline-offset-4"
        >
          {category.name?.ar || "بدون اسم عربي"}
        </Link>
        <p dir="ltr" className="mt-1 text-right text-sm text-[#667085]">
          {category.name?.en || "No English name"}
        </p>
      </div>
      <StatusButton
        category={category}
        updatingId={updatingId}
        onToggle={onToggle}
      />
    </div>
    <div className="mt-4 flex gap-2">
      <EditButton onClick={() => onEdit(category)} />
      <DeleteButton disabled={updatingId === (category._id || category.id)} onClick={() => onDelete(category)} />
    </div>
  </article>
);
const Field = ({ label, value, onChange, placeholder, dir }) => (
  <label className="block text-sm font-bold text-[#344054]">
    {label}
    <input
      dir={dir}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 h-12 w-full rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] px-4 font-normal outline-none focus:border-[#123C91] focus:bg-white"
    />
  </label>
);
