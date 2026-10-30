import { useEffect, useState } from "react";

import NotificationsList from "../notifications/NotificationsSection";
import { getNotifications } from "../../../services/APIService";
import { mergeAdminNotifications } from "../../../utils/adminLocalNotifications";

const extractList = (response) => {
  const body = response?.data?.data ?? response?.data ?? response ?? [];
  return Array.isArray(body) ? body : body.items || body.results || [];
};

const NotificationsSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getNotifications();
        setNotifications(
          mergeAdminNotifications(extractList(response)),
        );
      } catch (err) {
        setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <NotificationsList
      compact
      maxItems={4}
      notifications={notifications}
      loading={loading}
      loadError={loadError}
      onChange={setNotifications}
    />
  );
};

export default NotificationsSection;
