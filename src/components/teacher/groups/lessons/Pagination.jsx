import React from 'react';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const Pagination = ({ page, totalPages, onChange, totalItems, displayedCount }) => {
    return (
        <div className="flex items-center justify-between px-2 py-6 text-sm text-gray-500 w-full" >

            <span className="font-medium text-gray-500">
                عرض {displayedCount} من اصل {totalItems} حصة
            </span>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                    <HiChevronRight size={20} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onChange(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === i + 1
                                ? "bg-[#123C91] text-white shadow-sm"
                                : "border border-gray-200 hover:bg-gray-100 text-gray-600"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all"
                >
                    <HiChevronLeft size={20} />
                </button>
            </div>


        </div>
    );
};

export default Pagination;