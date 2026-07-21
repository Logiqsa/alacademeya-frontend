import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";

import {
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  createBlogCategory,
} from "../../../services/APIService";
import { BLOG_COLORS } from "../../../components/admin/blogs/BlogColorPicker";
import BlogContentFields from "../../../components/admin/blogs/BlogContentFields";
import BlogSeoFields from "../../../components/admin/blogs/BlogSeoFields";
import BlogPublishPanel from "../../../components/admin/blogs/BlogPublishPanel";

const EMPTY_FORM = {
  coverColor: BLOG_COLORS[3].hex, // شكلي بس، مش بيتبعت للـ API
  coverImageFile: null,
  coverImageUrl: null,
  title: "",
  description: "",
  content: "",
  category: "",
  readingTime: "",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
};

const BlogFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [data, setData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getBlogCategories()
      .then((res) => setCategories((res.data?.data || []).map((c) => ({ id: c._id, name: c.name }))))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    getBlogPost(id)
      .then((res) => {
        const p = res.data?.data || {};
        setData({
          coverColor: EMPTY_FORM.coverColor,
          coverImageFile: null,
          coverImageUrl: p.coverImage ? `https://api.alacademeya.com/${p.coverImage}` : null,
          title: p.title || "",
          description: p.description || "",
          content: p.content || "",
          category: p.category?._id || "",
          readingTime: p.readingTime ?? "",
          isFeatured: Boolean(p.isFeatured),
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
      })
      .catch(() => setErrorMsg("تعذر تحميل بيانات المقال"))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleCreateCategory = async (name) => {
    setCreatingCategory(true);
    try {
      const res = await createBlogCategory({ name });
      const created = res.data?.data;
      if (created) {
        const mapped = { id: created._id, name: created.name };
        setCategories((prev) => [...prev, mapped]);
        handleField("category", mapped.id);
        return mapped;
      }
      return null;
    } catch (err) {
      alert(err?.response?.data?.message || "حدث خطأ أثناء إضافة التصنيف");
      return null;
    } finally {
      setCreatingCategory(false);
    }
  };

  const buildFormData = (status) => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("content", data.content);
    fd.append("category", data.category);
    fd.append("status", status);
    fd.append("readingTime", data.readingTime);
    fd.append("isFeatured", data.isFeatured);
    fd.append("seoTitle", data.seoTitle);
    fd.append("seoDescription", data.seoDescription);
    if (data.coverImageFile) fd.append("coverImage", data.coverImageFile);
    return fd;
  };

  const handleSave = async (status) => {
    if (!data.title.trim()) {
      setErrorMsg("عنوان المقال مطلوب");
      return;
    }
    if (!data.category) {
      setErrorMsg("يرجى اختيار تصنيف للمقال");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const fd = buildFormData(status);
      if (isEditMode) {
        await updateBlogPost(id, fd);
      } else {
        await createBlogPost(fd);
      }
      navigate("/admin/blogs");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء حفظ المقال");
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
      <div className="mx-auto max-w-5xl p-2" dir="rtl">
        <h3 className="text-[20px] font-semibold text-[#123C91] mb-5 font-['Tajawal']">
          {isEditMode ? "تعديل مقال" : "إضافة مقال جديد"}
        </h3>

        {errorMsg && (
          <div className="mb-4 bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3">{errorMsg}</div>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {/* العمود الرئيسي: العنوان/الملخص/المحتوى + السيو */}
          <div className="md:col-span-2 bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-6">
            <BlogContentFields data={data} onChange={handleField} />
            <BlogSeoFields data={data} onChange={handleField} />
          </div>

          {/* العمود الجانبي: الغلاف/التصنيف/وقت القراءة/مميز */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
            <BlogPublishPanel
              data={data}
              onChange={handleField}
              categories={categories}
              onCreateCategory={handleCreateCategory}
              creatingCategory={creatingCategory}
              coverPreviewUrl={
                data.coverImageFile ? URL.createObjectURL(data.coverImageFile) : data.coverImageUrl
              }
              onCoverFileSelect={(file) => handleField("coverImageFile", file)}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate("/admin/blogs")}
            disabled={saving}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#575F69] font-medium text-[14px] disabled:opacity-60"
          >
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : isEditMode ? "حفظ التعديلات" : "نشر المقال"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogFormPage;