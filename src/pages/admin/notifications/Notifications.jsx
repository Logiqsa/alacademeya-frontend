import { useCallback, useEffect, useState } from "react";
import StatsCardds from "../../../components/admin/notifications/StatsCards";
import NotificationsSection from "../../../components/admin/notifications/NotificationsSection";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import {
  getAllStudents,
  getNotifications,
  getUsers,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { mergeAdminNotifications } from "../../../utils/adminLocalNotifications";
import { filterIncompleteJoinNotifications } from "../../../utils/incompleteRegistration";

const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};

const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";

const enrichSubscriptionNotifications = (notifications, students) => {
  const studentsById = new Map();
  students.forEach((student) => {
    const name =
      student.user?.fullName || student.fullName || student.name || "";
    [idOf(student), idOf(student.user), student.studentId, student.userId]
      .filter(Boolean)
      .forEach((id) => studentsById.set(String(id), name));
  });

  return notifications.map((notification) => {
    const searchable = [
      notification.key,
      notification.type,
      notification.title,
      notification.description,
      notification.message,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!searchable.includes("subscription") && !searchable.includes("اشتراك"))
      return notification;

    const sources = [notification, notification.data, notification.metadata];
    const candidateIds = sources.flatMap((source) =>
      source
        ? [
            idOf(source.student),
            idOf(source.studentId),
            idOf(source.user),
            idOf(source.userId),
          ]
        : [],
    );
    const matchedId = candidateIds.find((id) => studentsById.has(String(id)));
    const studentName = matchedId && studentsById.get(String(matchedId));
    if (!studentName) return notification;

    return {
      ...notification,
      description: `قام الطالب ${studentName} بإنشاء طلب اشتراك جديد`,
      data: { ...notification.data, studentName },
    };
  });
};

const AdminNotificationss = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [res, usersResponse, studentsResponse] = await Promise.all([
        getNotifications(),
        getUsers({ limit: 100 }).catch(() => null),
        getAllStudents({ limit: 500 }).catch(() => null),
      ]);
      const usersBody = usersResponse?.data || {};
      const users = usersBody.data || usersBody.users || [];
      const students = extractList(studentsResponse?.data);
      setNotifications(
        mergeAdminNotifications(
          enrichSubscriptionNotifications(
            filterIncompleteJoinNotifications(extractList(res.data), users),
            students,
          ),
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
