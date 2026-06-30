import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2, Pencil, Plus, BookOpen } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Static / Mock Data — replace with API data when ready                */
/* ------------------------------------------------------------------ */

const MOCK_CURRICULA = [
    {
        id: 'egy',
        name: 'المنهج المصرى',
        stages: [
            {
                id: 'primary',
                name: 'ابتدائية',
                grades: ['الأول الابتدائي', 'الثانى الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي', 'الخامس الابتدائي'],
            },
            { id: 'middle', name: 'إعدادية', grades: ['الأول الإعدادي', 'الثاني الإعدادي', 'الثالث الإعدادي'] },
            { id: 'secondary', name: 'ثانوية', grades: ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'] },
        ],
    },
    {
        id: 'sa',
        name: 'المنهج السعودى',
        stages: [
            { id: 'primary', name: 'ابتدائية', grades: ['الأول الابتدائي', 'الثانى الابتدائي', 'الثالث الابتدائي'] },
            { id: 'middle', name: 'متوسطة', grades: ['الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'] },
            { id: 'secondary', name: 'ثانوية', grades: ['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'] },
        ],
    },
];

/* ------------------------------------------------------------------ */
/* Grade Pill                                                           */
/* ------------------------------------------------------------------ */

const GradePill = ({ label }) => (
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#F2F4F7] border border-[#E5E5E5] text-[#1F2937] font-['IBM_Plex_Sans_Arabic'] text-[13px] whitespace-nowrap">
        {label}
    </span>
);

/* ------------------------------------------------------------------ */
/* Stage Row — collapsible, lists grade pills                           */
/* ------------------------------------------------------------------ */

const StageRow = ({ stage, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#F9FAFA] hover:bg-[#F2F4F7] transition-colors cursor-pointer"
            >
                <span className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] sm:text-[15px] text-[#1F2937]">
                    {stage.name}
                </span>
                {open ? (
                    <ChevronUp size={16} className="text-[#575F69]" />
                ) : (
                    <ChevronDown size={16} className="text-[#575F69]" />
                )}
            </button>

            {open && (
                <div className="px-4 py-4 space-y-2">
                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] text-[#8C9198]">الصفوف الدراسية</p>
                    <div className="flex flex-wrap gap-2">
                        {stage.grades.map((g) => (
                            <GradePill key={g} label={g} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Curriculum Card — collapsible, lists stage rows                      */
/* ------------------------------------------------------------------ */

const CurriculumCard = ({ curriculum, onEdit, onDelete, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 text-right">
                    <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center shrink-0">
                        <BookOpen size={18} className="text-[#123C91]" />
                    </div>
                    <div>
                        <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium mb-2 text-[15px] sm:text-[16px] text-[#1F2937]">
                            {curriculum.name}
                        </h3>
                        <p className="font-['IBM_Plex_Sans_Arabic'] text-[12px] sm:text-[13px] text-[#8C9198]">
                            {curriculum.stages.length} مراحل دراسية
                        </p>
                    </div>

                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen((p) => !p)}
                        className="text-[#575F69] cursor-pointer p-1 -m-1"
                        aria-label="عرض / إخفاء"
                    >
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete?.(curriculum)}
                        className="text-[#D92D20] cursor-pointer p-1 -m-1 hover:opacity-80"
                        aria-label="حذف"
                    >
                        <Trash2 size={17} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit?.(curriculum)}
                        className="text-[#575F69] cursor-pointer p-1 -m-1 hover:opacity-80"
                        aria-label="تعديل"
                    >
                        <Pencil size={17} />
                    </button>
                </div>


            </div>

            {open && (
                <div className="px-5 pb-5 space-y-3">
                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#8C9198]">المراحل الدراسية</p>
                    {curriculum.stages.map((stage, idx) => (
                        <StageRow key={stage.id} stage={stage} defaultOpen={idx === 0} />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Main Section                                                         */
/* ------------------------------------------------------------------ */

const AcademicStructureSection = () => {
    const navigate = useNavigate();
    const [curricula, setCurricula] = useState(MOCK_CURRICULA);

    const handleAdd = () => navigate('/admin/curriculum/create');
    const handleEdit = (curriculum) => navigate(`/admin/curriculum/${curriculum.id}/edit`);
    const handleDelete = (curriculum) => {
        setCurricula((prev) => prev.filter((c) => c.id !== curriculum.id));
    };

    return (
        <div dir="rtl" className="space-y-4">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-right">
                    <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937]">
                        الهيكل الأكاديمى
                    </h2>
                    <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[13px] sm:text-[14px]">
                        إدارة وتخصيص المناهج الدراسية ، المراحل التعليمية والصفوف.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#123C91] text-white rounded-xl font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] sm:text-[15px] cursor-pointer hover:bg-[#0F3278] transition-colors w-fit"
                >
                    <Plus size={16} />
                    إضافة منهج
                </button>
            </div>

            <div className="space-y-4">
                {curricula.map((curriculum) => (
                    <CurriculumCard
                        key={curriculum.id}
                        curriculum={curriculum}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}

                {curricula.length === 0 && (
                    <div className="bg-white border border-dashed border-[#E5E5E5] rounded-2xl py-12 text-center">
                        <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#8C9198]">
                            لا توجد مناهج دراسية مضافة بعد.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicStructureSection;