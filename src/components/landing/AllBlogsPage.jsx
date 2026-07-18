import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = ["كل المقالات", "تعليمي", "تجارب", "نصائح", "أخبار"];

const BlogCard = ({ post }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-40 bg-gray-200 relative">
      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      <span className="absolute top-3 right-3 bg-[#123C91] text-white text-[10px] px-2 py-1 rounded">
        {post.category}
      </span>
    </div>
    <div className="p-4 text-right">
      <div className="text-[12px] text-gray-400 mb-2">{post.date}</div>
      <h3 className="font-bold text-[16px] text-[#1F2937] mb-2">{post.title}</h3>
      <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>
      <Link to={`/blog/${post.id}`} className="text-[#123C91] font-bold text-[14px]">
        اقرأ المزيد
      </Link>
    </div>
  </div>
);

const AllBlogsPage = () => {
  const [activeCategory, setActiveCategory] = useState("كل المقالات");

  return (
    <div className="py-12 bg-gray-50 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* العنوان */}
        <h1 className="text-center font-bold text-[40px] text-[#123C91] mb-2">المدونة</h1>
        <p className="text-center text-gray-500 mb-8">مقالات ونصائح تعليمية من خبراء تساعدك على تحقيق أعلى النتائج</p>

        {/* شريط البحث والتصنيفات */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative mb-6">
            <input type="text" placeholder="بحث في المقالات..." className="w-full p-3 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:border-[#123C91]" />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
          
          <div className="flex justify-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-[14px] transition-colors ${
                  activeCategory === cat ? "bg-[#123C91] text-white" : "bg-white border text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة المقالات */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* كرر هذا المكون بناءً على بيانات الـ API */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BlogCard key={i} post={{ title: "كيف تستعد للامتحانات؟", category: "تعليمي", date: "2025-01-08", excerpt: "اكتشف أفضل استراتيجيات المذاكرة...", image: "" }} />
          ))}
        </div>

        {/* الترقيم (Pagination) */}
        <div className="flex justify-center items-center gap-2">
          <button className="p-2 rounded-lg border bg-white"><ChevronRight size={18} /></button>
          {[1, 2, 3, 4].map((page) => (
            <button key={page} className={`w-8 h-8 rounded-lg ${page === 1 ? "bg-[#123C91] text-white" : "bg-white border"}`}>
              {page}
            </button>
          ))}
          <button className="p-2 rounded-lg border bg-white"><ChevronLeft size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default AllBlogsPage;