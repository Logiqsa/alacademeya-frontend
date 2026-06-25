import React from 'react';
import TeacherLayout from '../../../components/teacher/layout/TeacherLayout';
import StatsCardds from '../../../components/teacher/notifications/StatsCards';
import NotificationsSection from '../../../components/teacher/notifications/NotificationsSection';



const Notificationss = () => {
    return (
        <TeacherLayout>
            <div className="max-w-7xl mx-auto p-2 space-y-6 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
                <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
                    الإشعارات
                </h1>


                <p className="text-[16px] font-normal leading-6 text-[#575F69]">
                    متابعة جميع التحديثات والتنبيهات المهمة
                </p>

                <StatsCardds />
                <NotificationsSection />
            </div>
        </TeacherLayout>
    );
};
export default Notificationss;