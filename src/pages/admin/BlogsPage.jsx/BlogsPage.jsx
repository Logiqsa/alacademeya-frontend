import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import BlogsStatsBar from "../../../components/admin/blogs/BlogsStatsBar";
import BlogsFilters from "../../../components/admin/blogs/BlogsFilters";
import BlogCard from "../../../components/admin/blogs/BlogCard";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import { getBlogPosts, getBlogCategories, deleteBlogPost } from "../../../services/APIService";

const PAGE_SIZE = 6;

const mapPost = (p) => {
  let coverUrl = null;
  if (p.coverImage) {
    if (p.coverImage.startsWith("http://") || p.coverImage.startsWith("https://")) {
      coverUrl = p.coverImage;
    } else {
      const cleanPath = p.coverImage.startsWith("/") ? p.coverImage : `/${p.coverImage}`;
      coverUrl = `https://api.alacademeya.com${cleanPath}`;
    }
  }

  return {
    id: p._id,
    title: p.title,
    description: p.description,
    status: p.status,
    categoryName: p.category?.name || "—",
    coverImageUrl: coverUrl,
    readingTime: p.readingTime ?? "—",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-CA") : "—",
  };
};


const BlogsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterCategory, setFilterCategory] = useState("جميع التصنيفات");
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [postsRes, categoriesRes] = await Promise.all([
        getBlogPosts(),
        getBlogCategories().catch(() => ({ data: { data: [] } })),
      ]);
      setPosts((postsRes.data?.data || []).map(mapPost));
      setCategories(categoriesRes.data?.data || []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء تحميل المقالات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (post) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${post.title}"؟`)) return;
    try {
      await deleteBlogPost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      alert(err?.response?.data?.message || "حدث خطأ أثناء حذف المقال");
    }
  };

  const filtered = posts.filter((p) => {
    const matchesSearch = p.title.includes(search) || p.description?.includes(search);
    const matchesStatus =
      filterStatus === "جميع الحالات" ||
      (filterStatus === "published" && p.status === "published") ||
      (filterStatus === "draft" && p.status === "draft");
    const matchesCategory = filterCategory === "جميع التصنيفات" || p.categoryName === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    draft: posts.filter((p) => p.status === "draft").length,
    published: posts.filter((p) => p.status === "published").length,
    total: posts.length,
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              المدونة التعليمية
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              أنشئ وتحكم في المقالات وأخبار الأكاديمية
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/blogs/add")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة مقال جديد
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-[#FFE9E9] text-[#D32F2F] text-sm rounded-lg px-4 py-3">{errorMsg}</div>
        )}

        <div className="mb-6">
          <BlogsStatsBar {...stats} />
        </div>

        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full mb-4">
          <BlogsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
            filterCategory={filterCategory}
            onFilterCategoryChange={(v) => { setFilterCategory(v); setPage(1); }}
            categoryOptions={["جميع التصنيفات", ...categories.map((c) => c.name)]}
          />
        </div>

        {loading ? (
          <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 flex items-center justify-center gap-2 text-[#575F69]">
            <Loader2 size={18} className="animate-spin" />
            جارٍ تحميل المقالات...
          </div>
        ) : paginated.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {paginated.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={(id) => navigate(`/admin/blogs/${id}/edit`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">لا توجد مقالات مطابقة</p>
        )}

        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginated.length}
          unitLabel="مقال"
        />
      </div>
    </AdminLayout>
  );
};

export default BlogsPage;