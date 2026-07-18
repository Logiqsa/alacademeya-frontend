import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Megaphone, Sigma, User, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

import featuredImage from "../../assets/featured-exams.svg"; // ⚠️ عدّلي المسار ده حسب مكان الصورة عندك في المشروع

const categories = ["كل المقالات", "تعليمي", "تجارب", "نصائح", "أخبار"];

// ⚠️ بيانات افتراضية بالكامل — استبدليها بـ useState + useEffect لجلب المقالات والفيتشرد بوست من الـ API
const featuredPosts = [
  {
    id: 0,
    title: "كيف تستعد لامتحانات نهاية العام بكفاءة عالية من خلال منصتنا التعليمية المتكاملة من منزلك؟",
    excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم لتحقيق أعلى الدرجات.",
    category: "تعليمي",
    date: "2025-01-08",
    readTime: "10 دقائق",
    image: featuredImage,
  },
];

const blogPosts = [
  { id: 1, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "announcement" },
  { id: 2, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "math" },
  { id: 3, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "avatar" },
  { id: 4, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "pinkAnnouncement" },
  { id: 5, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "avatarGray" },
  { id: 6, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "math" },
  { id: 7, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "academy" },
  { id: 8, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "math" },
  { id: 9, title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", readTime: "10 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "pinkAnnouncement" },
  { id: 10, title: "كيف تستعد للامتحانات؟", category: "نصائح", date: "2025-01-08", readTime: "8 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "avatar" },
  { id: 11, title: "كيف تستعد للامتحانات؟", category: "أخبار", date: "2025-01-08", readTime: "6 دقائق", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "academy" },
  { id: 12, title: "كيف تستعد للامتحانات؟", category: "تجارب", date: "2025-01-08", readTime: "12 دقيقة", excerpt: "اكتشف أفضل استراتيجيات المذاكرة التي يوصي بها خبراء التعليم.", variant: "math" },
];

const POSTS_PER_PAGE = 6; // ⚠️ عدّليها حسب اللي هيرجع من الـ API، أو اعتمدي على meta.per_page لو موجودة

// صور مولّدة بالكود (SVG/CSS) لكروت الجريد بس — الفيتشرد بوست بقى بيستخدم صورة حقيقية Import
const CoverImage = ({ variant, small }) => {
  const iconSize = small ? "w-10 h-10" : "w-14 h-14";

  switch (variant) {
    case "academy":
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#0C4A6E]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#0F766E]" strokeWidth={2} />
            </div>
          </div>
        </div>
      );

    case "math":
      return (
        <div className="w-full h-full relative overflow-hidden bg-[#1F2937]">
          <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" fill="#1F2937" />
            <text x="20" y="40" fill="#9CA3AF" fontSize="18" fontFamily="serif">(a-b)²</text>
            <text x="20" y="80" fill="#9CA3AF" fontSize="16" fontFamily="serif">y = ax + b</text>
            <line x1="20" y1="88" x2="110" y2="88" stroke="#6B7280" strokeWidth="1" />
            <text x="24" y="108" fill="#9CA3AF" fontSize="14" fontFamily="serif">Δy / Δx</text>
            <text x="230" y="55" fill="#9CA3AF" fontSize="16" fontFamily="serif">a² + b²</text>
            <text x="230" y="125" fill="#9CA3AF" fontSize="14" fontFamily="serif">= c²</text>
            <line x1="0" y1="0" x2="400" y2="200" stroke="#374151" strokeWidth="2" opacity="0.4" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sigma className={`${iconSize} text-white/20`} strokeWidth={1.5} />
          </div>
        </div>
      );

    case "pinkAnnouncement":
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#9D174D] to-[#6D28D9]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className={`${iconSize} text-white/25`} strokeWidth={1.5} />
          </div>
        </div>
      );

    case "avatar":
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
            <User className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
          </div>
        </div>
      );

    case "avatarGray":
      return (
        <div className="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-100" strokeWidth={1.5} />
          </div>
        </div>
      );

    case "announcement":
    default:
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#123C91] to-[#5B21B6]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className={`${iconSize} text-white/25`} strokeWidth={1.5} />
          </div>
        </div>
      );
  }
};

const BlogCard = ({ post }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-40 relative">
      <CoverImage variant={post.variant} small />
      <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/30">
        {post.category}
      </span>
    </div>
    <div className="p-4 text-right">
      <div className="flex items-center justify-between text-[12px] text-gray-400 mb-2">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <h3 className="font-bold text-[16px] text-[#1F2937] mb-2">{post.title}</h3>
      <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>
      <Link to={`/blog/${post.id}`} className="text-[#123C91] font-bold text-[14px]">
        اقرأ المزيد
      </Link>
    </div>
  </div>
);

const FeaturedPost = ({ post, onPrev, onNext }) => (
  <div className="relative mb-10">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
        {/* المحتوى */}
        <div className="md:w-1/2 flex flex-col justify-center text-right">
          <div className="flex items-center justify-end gap-4 text-[13px] text-gray-400 mb-4">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              {post.readTime}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
            <span className="bg-blue-50 text-[#123C91] px-3 py-1 rounded-full text-[12px] font-semibold">
              {post.category}
            </span>
          </div>

          <h2 className="font-bold text-[22px] text-[#1F2937] mb-4 leading-relaxed">
            {post.title}
          </h2>

          <Link to={`/blog/${post.id}`} className="text-gray-500 hover:text-[#123C91] text-[14px] self-start underline underline-offset-2">
            اقرأ المزيد
          </Link>
        </div>

        {/* الصورة — Import حقيقي من الـ assets */}
        <div className="md:w-1/2 w-full h-56 md:h-64 rounded-2xl overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>

    {/* أسهم الكاروسيل — برة الكارت بمسافة أوضح */}
    <button
      onClick={onPrev}
      className="flex absolute top-1/2 -translate-y-1/2 -left-6 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-400 hover:text-[#123C91] hover:border-[#123C91] transition-colors"
    >
      <ChevronLeft size={20} />
    </button>
    <button
      onClick={onNext}
      className="flex absolute top-1/2 -translate-y-1/2 -right-6 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-400 hover:text-[#123C91] hover:border-[#123C91] transition-colors"
    >
      <ChevronRight size={20} />
    </button>
  </div>
);

const AllBlogsPage = () => {
  const [activeCategory, setActiveCategory] = useState("كل المقالات");
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "كل المقالات" || post.category === activeCategory;
      const matchesSearch = post.title.includes(searchTerm) || post.excerpt.includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = currentPage > totalPages ? 1 : currentPage;

  const paginatedPosts = filteredPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  );

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevFeatured = () =>
    setFeaturedIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1));
  const handleNextFeatured = () =>
    setFeaturedIndex((prev) => (prev === featuredPosts.length - 1 ? 0 : prev + 1));

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="py-12 bg-gray-50 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-center font-bold text-[40px] text-[#123C91] mb-2">المدونة</h1>
        <p className="text-center text-gray-500 mb-10">
          مقالات ونصائح تعليمية من خبراء تساعدك على تحقيق أعلى النتائج
        </p>

        <FeaturedPost
          post={featuredPosts[featuredIndex]}
          onPrev={handlePrevFeatured}
          onNext={handleNextFeatured}
        />

        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ابحث في المقالات..."
              className="w-full p-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:border-[#123C91]"
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2 rounded-full text-[14px] transition-colors ${
                  activeCategory === cat
                    ? "bg-[#123C91] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {paginatedPosts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mb-12">مفيش مقالات مطابقة للبحث</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg ${
                  page === safePage ? "bg-[#123C91] text-white" : "bg-white border"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-2 rounded-lg border bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBlogsPage;