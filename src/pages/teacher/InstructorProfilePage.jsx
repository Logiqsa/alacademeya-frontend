import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ExternalLink,
  LoaderCircle,
  Pencil,
  UserRound,
} from "lucide-react";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";
import { AuthContext } from "../../context/AuthContext";
import { getMyInstructorProfile } from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";

const unwrap = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.instructor || data?.profile || data;
};

export default function InstructorProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyInstructorProfile()
      .then((response) => active && setProfile(unwrap(response)))
      .catch(
        (requestError) =>
          active &&
          setError(getApiErrorMessage(requestError, "تعذر تحميل ملف المحاضر.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <TeacherLayout>
        <div className="grid min-h-[60vh] place-items-center text-[#123C91]">
          <LoaderCircle size={34} className="animate-spin" />
        </div>
      </TeacherLayout>
    );

  const account = profile?.user || user || {};
  const name =
    account.fullName ||
    profile?.fullName ||
    profile?.name ||
    "محاضر الأكاديمية";
  const avatar =
    profile?.avatar ||
    profile?.profileImage ||
    account.profileImage ||
    account.avatar;
  const slug =
    profile?.profileSlug || profile?.slug || user?.instructorProfileSlug;

  return (
    <TeacherLayout>
      <main dir="rtl" className="min-h-full bg-[#F5F7FB] p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#667085]">
                حساب مقدم المحتوى
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#17213A]">
                ملفي الشخصي
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {slug && (
                <Link
                  to={`/instructors/${encodeURIComponent(slug)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#123C91] bg-white px-4 py-2.5 text-sm font-bold text-[#123C91]"
                >
                  <ExternalLink size={16} /> عرض الملف العام
                </Link>
              )}
              <Link
                to="/instructor/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-4 py-2.5 text-sm font-bold text-white"
              >
                <Pencil size={16} /> تعديل الملف
              </Link>
            </div>
          </header>

          {error || !profile ? (
            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center text-red-700">
              {error || "لم يتم العثور على ملف المحاضر."}
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="h-28 bg-linear-to-l from-[#123C91] to-[#1E55B3]" />
              <div className="px-5 pb-6 sm:px-8">
                <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow"
                      />
                    ) : (
                      <span className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-white bg-[#EAF2FF] text-3xl font-bold text-[#123C91] shadow">
                        {name.trim().charAt(0)}
                      </span>
                    )}
                    <div className="pb-1">
                      <h2 className="text-xl font-extrabold text-[#17213A]">
                        {name}
                      </h2>
                      <p className="mt-1 text-sm text-[#667085]">
                        {profile.headline || "محاضر بالأكاديمية"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-bold text-[#123C91]">
                      محاضر
                    </span>
                    {user?.role === "teacher" && (
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                        معلم
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      {profile.status === "suspended" ? "موقوف" : "نشط"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-[1fr_280px]">
                  <div className="rounded-2xl bg-[#F8FAFC] p-5">
                    <h3 className="font-bold text-[#17213A]">نبذة عني</h3>
                    <p className="mt-3 text-sm leading-8 text-[#667085]">
                      {profile.bio || "لم تتم إضافة نبذة إلى الملف بعد."}
                    </p>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-[#E5EAF1] p-5">
                    <p className="flex items-center gap-2 text-sm text-[#667085]">
                      <UserRound size={17} className="text-[#123C91]" /> حالة
                      الملف:{" "}
                      <strong className="text-[#17213A]">
                        {profile.status === "suspended" ? "موقوف" : "نشط"}
                      </strong>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-[#667085]">
                      <BookOpen size={17} className="text-[#123C91]" /> نوع
                      الحساب:{" "}
                      <strong className="text-[#17213A]">مقدم محتوى</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </TeacherLayout>
  );
}
