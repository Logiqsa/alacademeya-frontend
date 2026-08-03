import { useCallback, useEffect, useState } from "react";
import StatsCardds from "../../../components/admin/notifications/StatsCards";
import NotificationsSection from "../../../components/admin/notifications/NotificationsSection";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { getNotifications, getUsers } from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { mergeAdminNotifications } from "../../../utils/adminLocalNotifications";
import { filterIncompleteJoinNotifications } from "../../../utils/incompleteRegistration";

const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};

const AdminNotificationss = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [res, usersResponse] = await Promise.all([
        getNotifications(),
        getUsers({ limit: 100 }).catch(() => null),
      ]);
      const usersBody = usersResponse?.data || {};
      const users = usersBody.data || usersBody.users || [];
      setNotifications(
        mergeAdminNotifications(
          filterIncompleteJoinNotifications(extractList(res.data), users),
        ),
      );
    } catch (err) {
      setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data loading is intentionally triggered when the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <AdminLayout>
      <div
        className="max-w-7xl mx-auto p-2 space-y-6 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
         <Breadcrumbs homeTo="/admin-dashboard" />
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
