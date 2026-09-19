import { useEffect, useState } from "react";
import { getLandingPageSettings } from "../services/APIService";

export const DEFAULT_LANDING_PAGE_SETTINGS = {
  sections: {
    hero: true,
    featuredCourses: true,
    pricing: true,
    stats: true,
    features: true,
    blog: true,
    services: true,
    faq: true,
  },
  stats: {
    teachers: 40,
    students: 12000,
    courses: 1000,
    satisfaction: 97,
  },
};

const mergeSettings = (settings) => ({
  sections: {
    ...DEFAULT_LANDING_PAGE_SETTINGS.sections,
    ...(settings?.sections || {}),
  },
  stats: {
    ...DEFAULT_LANDING_PAGE_SETTINGS.stats,
    ...(settings?.stats || {}),
  },
});

export default function useLandingPageSettings() {
  const [settings, setSettings] = useState(DEFAULT_LANDING_PAGE_SETTINGS);

  useEffect(() => {
    let active = true;
    getLandingPageSettings()
      .then((response) => {
        if (active) setSettings(mergeSettings(response.data?.data));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return settings;
}
