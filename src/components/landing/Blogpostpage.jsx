import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Megaphone } from "lucide-react";
import {
    getPublicBlogPostBySlug,
    getPublicBlogPostsByCategory,
    getAssetUrl,
} from "../../services/api"; // ⚠️ عدّل المسار حسب مكان الملف عندك

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

const FallbackCover = () => (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#123C91] to-[#5B21B6]">
        <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="w-16 h-16 text-white/25" strokeWidth={1.5} />
        </div>
    </div>
);

const CoverImage = ({ post }) => {
    const url = getAssetUrl(post.coverImage);
    if (!url) return <FallbackCover />;
    return <img src={url} alt={post.title} className="w-full h-full object-cover" />;
};

const RelatedCard = ({ post }) => (
    <Link
        to={`/blog/${post.slug}`}
        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
    >
        <div className="h-32 relative">
            <CoverImage post={post} />
        </div>
        <div className="p-4 text-right">
            <h4 className="font-bold text-[15px] text-[#1F2937] mb-2 group-hover:text-[#123C91] transition-colors line-clamp-2">
                {post.title}
            </h4>
            <span className="text-[#123C91] font-bold text-[13px] flex items-center gap-1 w-fit">
                اقرأ المزيد <ArrowLeft size={14} />
            </span>
        </div>
    </Link>
);

const BlogPostPage = () => {
    const { slug } = useParams();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            setLoading(true);
            setNotFound(false);
            setPost(null);

            try {
                const res = await getPublicBlogPostBySlug(slug);
                const data = res?.data?.data?.blogPost;
                if (!data) throw new Error("not found");
                if (isMounted) setPost(data);

                // مقالات ذات صلة من نفس القسم
                if (data.category?.slug) {
                    try {
                        const relatedRes = await getPublicBlogPostsByCategory(data.category.slug);
                        const relatedData = relatedRes?.data?.data?.blogPosts ?? [];
                        if (isMounted) {
                            setRelatedPosts(relatedData.filter((p) => p.slug !== slug).slice(0, 3));
                        }
                    } catch {
                        if (isMounted) setRelatedPosts([]);
                    }
                }
            } catch (err) {
                if (isMounted) setNotFound(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadPost();
        window.scrollTo({ top: 0 });
        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="py-12 bg-gray-50 font-sans min-h-[60vh]" dir="rtl">
                <div className="max-w-3xl mx-auto px-4 animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
                    <div className="h-72 bg-gray-200 rounded-2xl mb-8" />
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="py-24 bg-gray-50 font-sans text-center" dir="rtl">
                <p className="text-[#1F2937] text-[20px] font-bold mb-4">المقال غير موجود</p>
                <Link to="/blogs" className="text-[#123C91] font-bold flex items-center gap-1 justify-center">
                    <ArrowRight size={16} /> ارجع لكل المقالات
                </Link>
            </div>
        );
    }

    return (
        <article className="py-12 bg-gray-50 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto px-4">
                <Link
                    to="/blogs"
                    className="inline-flex items-center gap-1 text-[#575F69] text-[14px] font-medium mb-8 hover:text-[#123C91] transition-colors"
                >
                    <ArrowRight size={16} /> رجوع للمدونة
                </Link>

                <div className="h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
                    <CoverImage post={post} />
                </div>

                <div className="flex items-center justify-start gap-4 text-[13px] text-gray-500 mb-4 flex-wrap">
                    <span className="bg-blue-50 text-[#123C91] px-3 py-1 rounded-full text-[12px] font-semibold">
                        {post.category?.name}
                    </span>
                    <span className="flex items-center gap-1">
                        {post.readingTime} دقائق
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 3" />
                        </svg>
                    </span>
                    <span>{formatDate(post.publishedAt)}</span>
                </div>

                <h1 className="font-['Tajawal'] font-bold text-[32px] md:text-[38px] text-[#123C91] mb-4 leading-tight">
                    {post.title}
                </h1>

                <p className="font-['IBM_Plex_Sans_Arabic'] text-[18px] text-[#1F2937B2] mb-10 leading-relaxed">
                    {post.description}
                </p>

                {/* محتوى المقال — لو الـ content جاي HTML من محرر نصوص (rich text editor) */}
                <div
                    className="prose prose-lg max-w-none font-['IBM_Plex_Sans_Arabic'] text-[#1F2937] leading-loose
                               prose-headings:font-['Tajawal'] prose-headings:text-[#123C91]
                               prose-a:text-[#123C91] prose-img:rounded-2xl"
                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                />
            </div>

            {relatedPosts.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 mt-16">
                    <h2 className="font-['Tajawal'] font-bold text-[26px] text-[#123C91] mb-6 text-center">
                        مقالات ذات صلة
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {relatedPosts.map((rp) => (
                            <RelatedCard key={rp._id} post={rp} />
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

export default BlogPostPage;