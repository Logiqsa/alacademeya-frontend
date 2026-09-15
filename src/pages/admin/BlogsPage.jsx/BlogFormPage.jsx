import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { ChevronDown, ChevronLeft, ChevronRight, FileText, ImagePlus, Save, Send, X } from "lucide-react";
import { addBlogCreatedNotification } from "../../../utils/adminLocalNotifications";
import RichTextEditor from "../../../components/shared/RichTextEditor";

import {
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  createBlogCategory,
  getAssetUrl,
} from "../../../services/APIService";

const EMPTY_FORM = {
  coverImageFile: null,
  coverImageUrl: null,
  title: "",
  description: "",
  content: "",
  category: "",
  readingTime: "",
  isFeatured: false,
};

const BlogFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [isDraftSidebarOpen, setIsDraftSidebarOpen] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getBlogCategories()
      .then((res) => setCategories((res.data?.data || []).map((c) => ({ id: c._id, name: c.name }))))
      .catch(() => setCategories([]));
  }, []);

  const coverPreview = useMemo(
    () => data.coverImageFile
      ? URL.createObjectURL(data.coverImageFile)
      : data.coverImageUrl,
    [data.coverImageFile, data.coverImageUrl]
  );

  useEffect(() => () => {
    if (data.coverImageFile && coverPreview) URL.revokeObjectURL(coverPreview);
  }, [data.coverImageFile, coverPreview]);

  useEffect(() => {
    if (!isEditMode) return;
    getBlogPost(id)
      .then((res) => {
        const responseData = res.data?.data;
        const p = responseData?.blogPost || responseData || {};
        setData({
          coverImageFile: null,
          coverImageUrl: getAssetUrl(p.coverImage),
          title: p.title || "",
          description: p.description || "",
          content: p.content || "",
          category: p.category?._id || p.category || "",
          readingTime: p.readingTime ?? "",
          isFeatured: Boolean(p.isFeatured),
        });
      })
      .catch(() => toast.error("عذراً، تعذر تحميل بيانات المقال بنجاح."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("يرجى إدخال اسم التصنيف الجديد.");
      return;
    }
    setCreatingCategory(true);
    try {
      const res = await createBlogCategory({ name: newCategoryName.trim() });
      const created = res.data?.data;
      if (created) {
        const mapped = { id: created._id, name: created.name };
        setCategories((prev) => [...prev, mapped]);
        handleField("category", mapped.id);
        setNewCategoryName("");
        toast.success("تم إضافة التصنيف الجديد بنجاح.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "عذراً، حدث خطأ أثناء إضافة التصنيف.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSave = async (status) => {
    const editorContent = data.content ?? "";
    if (!data.title.trim()) {
      toast.error("الحقل المطلوب: يرجى إدخال عنوان المقال.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!data.category) {
      toast.error("الحقل المطلوب: يرجى اختيار التصنيف الخاص بالمقال.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!isEditMode && !data.coverImageFile) {
      toast.error("يرجى اختيار صورة للمقال.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("description", data.description || "");
      fd.append("content", editorContent);
      fd.append("category", data.category);
      fd.append("status", status);
      fd.append("readingTime", data.readingTime || 0);
      fd.append("isFeatured", String(data.isFeatured));
      fd.append("seoTitle", data.title);
      fd.append("seoDescription", data.description || "");
      if (data.coverImageFile) {
        fd.append("coverImage", data.coverImageFile);
      }

      let successMessage = "";
      if (isEditMode) {
        await updateBlogPost(id, fd);
        successMessage = "تم تعديل المقال بنجاح";
      } else {
        const createResponse = await createBlogPost(fd);
        const createdData = createResponse?.data?.data;
        const createdBlog = createdData?.blogPost || createdData || { title: data.title };
        addBlogCreatedNotification({ ...createdBlog, title: createdBlog.title || data.title });
        successMessage = "تم إضافة المقال بنجاح";
      }

      navigate("/admin/blogs", { state: { toastMessage: successMessage } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "عذراً، حدث خطأ أثناء حفظ المقال. يرجى المحاولة مرة أخرى.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-[#575F69]">جاري تحميل المقال...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="mx-auto p-4 font-['IBM_Plex_Sans_Arabic'] relative" dir="rtl">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[20px] font-bold text-[#123C91] font-['Tajawal']">
            {isEditMode ? "تعديل مقال" : "إضافة مقال جديد"}
          </h3>
        </div>

        <div className={`grid items-start gap-5 transition-[grid-template-columns] duration-300 ${isDraftSidebarOpen ? "xl:grid-cols-[minmax(0,1fr)_300px]" : "xl:grid-cols-[minmax(0,1fr)_72px]"}`}>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 shadow-sm space-y-6 sm:p-6">

          {/* صورة المقال فقط، بدون ألوان غلاف */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              صورة المقال {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleField("coverImageFile", file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-48 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#123C91] hover:bg-blue-50/40 transition-colors"
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="معاينة صورة المقال"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white font-medium opacity-0 hover:opacity-100 transition-opacity">
                    اضغط لتغيير الصورة
                  </span>
                </>
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                  <ImagePlus size={34} className="text-[#123C91]" />
                  <span className="font-medium">اضغط لإضافة صورة المقال</span>
                  <span className="text-[12px] text-gray-400">PNG أو JPG أو WEBP</span>
                </span>
              )}
            </button>
          </div>

          {/* 3. عنوان المقال */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              عنوان المقال <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="ادخل عنوان المقال..."
              value={data.title}
              onChange={(e) => handleField("title", e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#123C91]"
            />
          </div>

          {/* 4. التصنيف وإضافة تصنيف جديد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
                التصنيف <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={data.category}
                  onChange={(e) => handleField("category", e.target.value)}
                  className="w-full h-11 appearance-none rounded-xl border border-[#E5E5E5] bg-white pr-4 pl-11 text-[14px] text-gray-800 cursor-pointer focus:outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10"
                >
                  <option value="" disabled>اختر تصنيفاً...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
                إضافة تصنيف جديد
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="اسم التصنيف الجديد..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl border border-[#E5E5E5] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#123C91]"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="px-5 h-11 rounded-xl bg-[#123C91] text-white font-medium text-[14px] shrink-0 hover:bg-[#0d2d6d] transition-colors disabled:opacity-50"
                >
                  {creatingCategory ? "جارٍ..." : "إضافة"}
                </button>
              </div>
            </div>
          </div>

          {/* 5. وقت القراءة */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              وقت القراءة (بالدقائق)
            </label>
            <input
              type="number"
              placeholder="60 دقيقة"
              value={data.readingTime}
              onChange={(e) => handleField("readingTime", e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#123C91]"
            />
          </div>

          {/* 6. ملخص المقال */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              ملخص المقال
            </label>
            <textarea
              rows={3}
              placeholder="اكتب ملخص المقال هنا..."
              value={data.description}
              onChange={(e) => handleField("description", e.target.value)}
              className="w-full p-4 rounded-xl border border-[#E5E5E5] text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#123C91] resize-none"
            />
          </div>

          {/* 7. محتوى المقال */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              محتوى المقال
            </label>
            <RichTextEditor value={data.content} onChange={(value) => handleField("content", value)} disabled={saving} ariaLabel="محتوى المقال" placeholder="ابدأ كتابة محتوى المقال هنا…" />
          </div>

          {/* 8. مقال مميز */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-[14px] font-bold text-[#1F2937]">مقال مميز</h4>
              <p className="text-[12px] text-gray-400">إضافة المقال إلى قسم المقالات المميزة</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.isFeatured}
                onChange={(e) => handleField("isFeatured", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#123C91]"></div>
            </label>
          </div>

        </div>

        <aside className="overflow-hidden rounded-2xl border border-[#DCE3EC] bg-white shadow-sm xl:sticky xl:top-0">
          <div className={`flex items-center border-b border-[#EAECF0] p-3 ${isDraftSidebarOpen ? "justify-between" : "justify-center"}`}>
            {isDraftSidebarOpen && <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-lg bg-[#EEF4FF] text-[#123C91]"><FileText size={18} /></span><div><h4 className="text-sm font-bold text-[#1F2937]">إجراءات المقال</h4><p className="text-[11px] text-[#667085]">الحفظ والنشر</p></div></div>}
            <button type="button" onClick={() => setIsDraftSidebarOpen((open) => !open)} className="grid size-9 place-items-center rounded-lg text-[#475467] transition hover:bg-[#F2F4F7]" aria-expanded={isDraftSidebarOpen} aria-label={isDraftSidebarOpen ? "طي سايدبار المسودة" : "فتح سايدبار المسودة"} title={isDraftSidebarOpen ? "طي السايدبار" : "فتح السايدبار"}>
              {isDraftSidebarOpen ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
            </button>
          </div>

          {isDraftSidebarOpen ? <div className="space-y-3 p-4">
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs leading-6 text-[#667085]">
              {isEditMode ? "احفظ التعديلات الحالية كمسودة أو انشر النسخة المحدثة." : "يمكنك حفظ المقال كمسودة والعودة لاستكماله لاحقًا."}
            </div>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#B8C7DD] py-3 text-[14px] font-bold text-[#123C91] transition hover:bg-[#F3F7FD] disabled:opacity-60"
          >
            <Save size={17} />{saving ? "جارٍ الحفظ..." : "حفظ كمسودة"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] py-3 text-[14px] font-bold text-white transition hover:bg-[#0d2d6d] disabled:opacity-60"
          >
            <Send size={17} />{saving ? "جارٍ الحفظ..." : isEditMode ? "حفظ ونشر التعديلات" : "نشر المقال"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium text-[#667085] transition hover:bg-[#F2F4F7] disabled:opacity-60"
          >
            <X size={16} />إلغاء
          </button>
          </div> : <div className="flex flex-col items-center gap-2 p-3">
            <button type="button" onClick={() => handleSave("draft")} disabled={saving} className="grid size-10 place-items-center rounded-xl border border-[#B8C7DD] text-[#123C91] hover:bg-[#F3F7FD] disabled:opacity-60" aria-label="حفظ كمسودة" title="حفظ كمسودة"><Save size={18} /></button>
            <button type="button" onClick={() => handleSave("published")} disabled={saving} className="grid size-10 place-items-center rounded-xl bg-[#123C91] text-white hover:bg-[#0d2d6d] disabled:opacity-60" aria-label="نشر المقال" title="نشر المقال"><Send size={18} /></button>
          </div>}
        </aside>
        </div>

      </div>
    </AdminLayout>
  );
};

export default BlogFormPage;
