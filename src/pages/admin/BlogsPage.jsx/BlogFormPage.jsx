import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { Megaphone } from "lucide-react";

// استدعاء مكتبة Quill الأساسية
import Quill from "quill";
import "quill/dist/quill.snow.css";

import {
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  createBlogCategory,
} from "../../../services/APIService";

const BLOG_COLORS = [
  { name: "أصفر داكن", hex: "#B48B4C" },
  { name: "تركواز", hex: "#38B6AB" },
  { name: "موف", hex: "#9C27B0" },
  { name: "أزرق", hex: "#3F51B5" },
];

const EMPTY_FORM = {
  coverColor: BLOG_COLORS[3].hex,
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

  const fileInputRef = useRef(null);

  // مراجع خاصة بمحرر Quill الحديث
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);

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
        let coverUrl = null;
        if (p.coverImage) {
          coverUrl = p.coverImage.startsWith("http") ? p.coverImage : `https://api.alacademeya.com/${p.coverImage}`;
        }
        setData({
          coverColor: p.coverColor || BLOG_COLORS[3].hex,
          coverImageFile: null,
          coverImageUrl: coverUrl,
          title: p.title || "",
          description: p.description || "",
          content: p.content || "",
          category: p.category?._id || "",
          readingTime: p.readingTime ?? "",
          isFeatured: Boolean(p.isFeatured),
        });
        if (quillInstanceRef.current && p.content) {
          quillInstanceRef.current.root.innerHTML = p.content;
          quillInstanceRef.current.format("direction", "rtl");
          quillInstanceRef.current.format("align", "right");
        }
      })
      .catch(() => toast.error("عذراً، تعذر تحميل بيانات المقال بنجاح."))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  // إعداد وتفعيل محرر Quill مرة واحدة عند التحميل مع جعله يمين (RTL)
  useEffect(() => {
    if (!quillRef.current || quillInstanceRef.current) return;

    quillInstanceRef.current = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    // ضبط اتجاه الكتابة الافتراضي ومحاذاة السطر لليمين
    quillInstanceRef.current.format("direction", "rtl");
    quillInstanceRef.current.format("align", "right");

    // تعيين القيمة الابتدائية لو وجدت
    if (data.content) {
      quillInstanceRef.current.root.innerHTML = data.content;
    }

    // تحديث الحالة عند الكتابة
    quillInstanceRef.current.on("text-change", () => {
      const html = quillRef.current.querySelector(".ql-editor").innerHTML;
      setData((prev) => ({ ...prev, content: html }));
    });
  }, []);

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
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", data.title);
      fd.append("description", data.description);
      fd.append("content", data.content);
      fd.append("category", data.category);
      fd.append("status", status);
      fd.append("readingTime", data.readingTime || 0);
      fd.append("isFeatured", data.isFeatured);
      fd.append("coverColor", data.coverColor);

      fd.append("seoTitle", data.title);
      fd.append("seoDescription", data.description);

      if (data.coverImageFile) {
        fd.append("coverImage", data.coverImageFile);
      }

      let successMessage = "";
      if (isEditMode) {
        await updateBlogPost(id, fd);
        successMessage = "تم تعديل المقال بنجاح";
      } else {
        await createBlogPost(fd);
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

  const currentCoverPreview = data.coverImageFile
    ? URL.createObjectURL(data.coverImageFile)
    : data.coverImageUrl;

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

        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm space-y-6">

          {/* 1. لون الغلاف */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              لون الغلاف
            </label>
            <div className="flex gap-2.5">
              {BLOG_COLORS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleField("coverColor", color.hex)}
                  className={`w-8 h-8 rounded-lg transition-transform ${data.coverColor === color.hex ? "ring-2 ring-offset-2 ring-[#123C91] scale-105" : ""
                    }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* 2. صورة الغلاف */}
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2 text-right">
              صورة الغلاف
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleField("coverImageFile", e.target.files[0]);
                }
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-44 rounded-xl relative flex flex-col items-center justify-center cursor-pointer overflow-hidden border border-dashed border-gray-300 transition-all hover:opacity-95"
              style={{ backgroundColor: data.coverColor }}
            >
              {currentCoverPreview ? (
                <img src={currentCoverPreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover z-10" />
              ) : null}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <Megaphone className="text-white/80 mb-2" size={36} />
              </div>
            </div>
            <p className="text-center text-[12px] text-gray-400 mt-2">اضغط لإضافة صورة غلاف مميزة</p>
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
              <select
                value={data.category}
                onChange={(e) => handleField("category", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-[14px] text-gray-800 bg-white focus:outline-none focus:border-[#123C91]"
              >
                <option value="">اختر تصنيفاً...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
            <div className="border border-[#E5E5E5] rounded-xl overflow-hidden bg-white" dir="rtl">
              <div ref={quillRef} style={{ minHeight: "200px", direction: "rtl", textAlign: "right" }} />
            </div>
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

        {/* أزرار الحفظ والإلغاء السفلية */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] hover:bg-[#0d2d6d] transition-colors disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : isEditMode ? "حفظ التعديلات" : "نشر المقال"}
          </button>

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#575F69] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            حفظ كمسودة
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            disabled={saving}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>


        </div>

      </div>
    </AdminLayout>
  );
};

export default BlogFormPage;