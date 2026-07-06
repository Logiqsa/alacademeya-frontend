import { useEffect, useState } from "react";
import { getContactSettings } from "../services/APIService";

export const whatsappLink = (number) => {
  const digits = String(number || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

const useContactSettings = () => {
  const [contactSettings, setContactSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getContactSettings()
      .then((res) => {
        if (active) setContactSettings(res.data?.data || null);
      })
      .catch(() => {
        if (active) setContactSettings(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { contactSettings, loading };
};

export default useContactSettings;
