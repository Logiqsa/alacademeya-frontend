import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import {
    getBlogCategories,
    getPublicBlogPosts,
    getPublicBlogPostsByCategory,
    getAssetUrl,
} from "../../services/APIService";

const ALL_CATEGORY = { _id: "all", name: "كل المقالات", slug: "all" };
const POSTS_PER_PAGE = 6;

const formatDate = (isoDate) => {
    if (!isoDate) return "";
    try {
        return new Date(isoDate).toLocaleDateString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return isoDate;
    }
};

// بيتعرض لما البوست معندوش coverImage
const FallbackCover = ({ small }) => {
    const iconSize = small ? "w-10 h-10" : "w-14 h-14";
    return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#123C91] to-[#5B21B6]">
            <div className="absolute inset-0 flex items-center justify-center">
                <Megaphone className={`${iconSize} text-white/25`} strokeWidth={1.5} />
            </div>
        </div>
    );
};

const CoverImage = ({ post, small }) => {
    const url = getAssetUrl(post.coverImage);
    if (!url) return <FallbackCover small={small} />;
    return (
        <img
            src={url}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
        />
    );
};

const BlogCard = ({ post }) => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-40 relative">
            <CoverImage post={post} small />
            <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/30">
                {post.category?.name}
            </span>
        </div>
        <div className="p-4 text-right">
            <div className="flex items-center justify-between text-[14px] text-gray-400 mb-2">
                <span>{post.readingTime} دقائق</span>
                <span>{formatDate(post.publishedAt)}</span>
            </div>
            <h3 className="font-bold text-[16px] text-[#1F2937] mb-2">{post.title}</h3>
            <p className="text-[14px] text-gray-500 mb-4 line-clamp-2">{post.description}</p>
            <Link
                to={`/blog/${post.slug}`}
                className="text-[#123C91] font-bold text-[14px] flex items-center gap-1 w-fit"
            >
                اقرأ المزيد <ArrowLeft size={16} />
            </Link>
        </div>
    </div>
);

const AllBlogsPage = () => {
    const [categories, setCategories] = useState([ALL_CATEGORY]);
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // تحميل الأقسام مرة واحدة
    useEffect(() => {
        let isMounted = true;
        getBlogCategories()
            .then((res) => {
                if (!isMounted) return;
                const cats = res?.data?.data ?? [];
                setCategories([ALL_CATEGORY, ...cats]);
            })
            .catch(() => {
                /* لو فشل تحميل الأقسام، هنفضل شغالين بـ "كل المقالات" بس */
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // تحميل البوستات كل ما القسم المختار يتغير
    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            try {
                setLoading(true);
                const res =
                    activeCategory.slug === "all"
                        ? await getPublicBlogPosts()
                        : await getPublicBlogPostsByCategory(activeCategory.slug);

                const data =
                    activeCategory.slug === "all"
                        ? res?.data?.data ?? []
                        : res?.data?.data?.blogPosts ?? [];

                if (isMounted) {
                    setPosts(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setPosts([]);
                    setError("تعذر تحميل المقالات حاليًا");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPosts();
        return () => {
            isMounted = false;
        };
    }, [activeCategory]);

    const filteredPosts = useMemo(() => {
        const term = searchTerm.trim();
        if (!term) return posts;
        return posts.filter(
            (post) => post.title?.includes(term) || post.description?.includes(term)
        );
    }, [posts, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    const safePage = currentPage > totalPages ? 1 : currentPage;

    const paginatedPosts = filteredPosts.slice(
        (safePage - 1) * POSTS_PER_PAGE,
        safePage * POSTS_PER_PAGE
    );

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

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

                <div className="mb-10">
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="ابحث في المقالات..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pr-10 pl-11 text-[14px] text-right placeholder:text-gray-400 focus:outline-none focus:border-[#123C91] focus:bg-white transition-colors"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>

                    <div className="flex justify-start gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                                    activeCategory._id === cat._id
                                        ? "bg-[#123C91] text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-72 rounded-2xl bg-white border border-gray-200 animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <p className="text-center text-red-400 mb-12">{error}</p>
                )}

                {!loading && !error && paginatedPosts.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {paginatedPosts.map((post) => (
                            <BlogCard key={post._id} post={post} />
                        ))}
                    </div>
                )}

                {!loading && !error && paginatedPosts.length === 0 && (
                    <p className="text-center text-gray-400 mb-12">مفيش مقالات مطابقة للبحث</p>
                )}

                {!loading && totalPages > 1 && (
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