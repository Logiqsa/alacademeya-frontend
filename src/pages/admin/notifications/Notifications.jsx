import React, { useCallback, useEffect, useState } from 'react';
import StatsCardds from '../../../components/admin/notifications/StatsCards';
import NotificationsSection from '../../../components/admin/notifications/NotificationsSection';
import AdminLayout from '../../../components/admin/layout/AdminLayout';
import { getNotifications } from '../../../services/authService';

const extractList = (resData) => {
    if (!resData) return [];
    const root = resData?.data || resData;
    const raw = root?.data || root || [];
    return Array.isArray(raw) ? raw : [];
};

const AdminNotificationss = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await getNotifications();
            setNotifications(extractList(res.data));
        } catch (err) {
            setLoadError(err.response?.data?.message || 'تعذر تحميل الإشعارات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-2 space-y-6 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
                <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
                    الإشعارات
                </h1>

                <p className="text-[16px] font-normal leading-6 text-[#575F69]">
                    متابعة جميع التحديثات والتنبيهات المهمة
                </p>

                <StatsCardds notifications={notifications} />
                <NotificationsSection
                    notifications={notifications}
                    loading={loading}
                    loadError={loadError}
                    onChange={setNotifications}
                />
            </div>
        </AdminLayout>
    );
};
export default AdminNotificationss;