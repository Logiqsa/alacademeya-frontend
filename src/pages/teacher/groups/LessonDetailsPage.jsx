import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonRecordings from "../../../components/teacher/groups/lessons/LessonRecordings";
import LessonQuizzes from "../../../components/teacher/groups/lessons/LessonQuizzes";
import LessonAssignments from "../../../components/teacher/groups/lessons/LessonAssignments";
import LessonFiles from "../../../components/teacher/groups/lessons/LessonFiles";
import LiveLessonLink from "../../../components/teacher/groups/lessons/LiveLessonLink";
import LessonStats from "../../../components/teacher/groups/lessons/LessonStats";


// ─── Status Badge (reused from LessonsTable) ─────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        قادمة: "bg-[#EAF4FF] text-[#123C91]",
        "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
        منتهية: "bg-[#D32F2F26] text-[#D32F2F]",
        ملغية: "bg-[#1F293726] text-[#1F2937]",
    };
    return (
        <span
            className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
};

// ─── Demo lesson data ─────────────────────────────────────────────────────────
const DEMO_LESSON = {
    id: "L001",
    title: "المصفوفات_2",
    groupName: "مجموعة الرياضيات A",
    date: "2024-06-13",
    time: "5:00 م",
    duration: "90 دقيقة",
    status: "مباشر الآن",
    totalStudents: 22,
    attendance: 18,
    absence: 4,
    lessonUrl: "https://lesson.link/xyz789",
};

// ─── Page Header ──────────────────────────────────────────────────────────────
const PageHeader = ({ lesson, onBack }) => (

    <div dir="rtl" className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
           
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1
                        className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3"
                    >
                        {lesson.title}
                    </h1>
                    <StatusBadge status={lesson.status} />
                </div>
                <p
                    cclassName="text-[16px] font-normal leading-6 text-[#575F69]"
                >
                    {lesson.groupName} • {lesson.date} • {lesson.time} • {lesson.duration}
                </p>
            </div>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const LessonDetailsPage = ({ lesson = DEMO_LESSON, onBack }) => {
    return (
        <TeacherLayout>
            <div
                className="w-full p-1 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl"
            >
              
                <div className="mx-auto space-y-5">
                    
                    {/* Header */}
                    <PageHeader lesson={lesson} onBack={onBack || (() => window.history.back())} />

                    {/* Stats */}
                    <LessonStats
                        totalStudents={lesson.totalStudents}
                        attendance={lesson.attendance}
                        absence={lesson.absence}
                    />

                    {/* Live Link */}
                    <LiveLessonLink lessonUrl={lesson.lessonUrl} isLive={lesson.status === "مباشر الآن"} />

                    {/* Files */}
                    <LessonFiles />

                    {/* Assignments + Quizzes side by side on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <LessonAssignments />
                        <LessonQuizzes />
                    </div>

                    {/* Recordings */}
                    <LessonRecordings />
                </div>
            </div>
        </TeacherLayout>
    );
};

export default LessonDetailsPage;