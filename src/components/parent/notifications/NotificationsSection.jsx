import React, { useState } from 'react';
import { Bell, BellRing, GraduationCap, Settings } from 'lucide-react';
import NotificationCard from './NotificationCard';

const allNotifications = [
    { id: 1, title: "إلغاء درس", desc: "تم إلغاء درس اللغة العربية المقرر غداً بسبب ظرف طارئ للمعلم", time: "منذ 5 دقائق", type: "academic", read: false },
    { id: 2, title: "تنبيه تجديد الاشتراك", desc: "سينتهي اشتراك سلمى الحالي بعد 3 أيام، قم بالتجديد لتجنب انقطاع الخدمة", time: "منذ ساعة", type: "system", read: true },
    { id: 3, title: "تأكيد الدفع", desc: "تم استلام مبلغ 700 جنيه مصري للاشتراك الشهري بنجاح وتم تفعيل الباقة", time: "منذ 3 أيام", type: "system", read: false },
    { id: 4, title: "إلغاء درس", desc: "تم إلغاء درس الجغرافيا المقرر غداً بسبب ظرف طارئ للمعلم", time: "منذ 5 أيام", type: "academic", read: true },
];

const tabs = [
    { key: 'all', label: 'الكل', icon: Bell },
    { key: 'unread', label: 'غير مقروءة', icon: BellRing },
    { key: 'academic', label: 'الأكاديمية', icon: GraduationCap },
    { key: 'system', label: 'النظام والإدارة', icon: Settings },
];

const NotificationsSection = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [readState, setReadState] = useState(() =>
        Object.fromEntries(allNotifications.map(n => [n.id, n.read]))
    );

    const filtered = allNotifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !readState[n.id];
        if (activeTab === 'academic') return n.type === 'academic';
        if (activeTab === 'system') return n.type === 'system';
    });

    const toggleRead = (id) => setReadState(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="w-full bg-white p-6 rounded-2xl border border-[#E5E5E5]" dir="rtl">
            <h2
                className="text-[16px] leading-4 text-right text-[#1F2937] mb-3"
                style={{
                    fontFamily: "'Tajawal', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0px'
                }}
            >
                جميع الإشعارات
            </h2>


            <p
                className="text-[16px] leading-6 text-right text-[#6B7280] mt-1 mb-5"
                style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    fontWeight: 400,
                    letterSpacing: '0px'
                }}
            >تصفية وإدارة الإشعارات حسب النوع</p>

            <div
                className="flex items-center p-1 mb-5"
                dir="rtl"
                style={{
                    width: '568px',
                    height: '38px',
                    borderRadius: '999px',
                    backgroundColor: '#EAF4FF'
                }}
            >
                {tabs.map(({ icon: Icon, key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-full transition-all duration-200 ${activeTab === key
                                ? 'bg-white text-[#123C91] shadow-sm'
                                : 'text-[#1F2937] hover:text-[#123C91]'
                            }`}
                        style={{
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '20px',
                            letterSpacing: '0px',
                            textAlign: 'center'
                        }}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2.5">
                {filtered.map(n => (
                    <NotificationCard
                        key={n.id}
                        title={n.title}
                        description={n.desc}
                        time={n.time}
                        type={n.type}
                        isRead={readState[n.id]}
                        onToggleRead={() => toggleRead(n.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationsSection;