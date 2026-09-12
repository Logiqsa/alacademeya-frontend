import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  createInstructorProfile,
  getMyInstructorProfile,
  updateMyInstructorProfile,
} from "../../services/APIService";
import { INSTRUCTOR_AGREEMENT_VERSION } from "../../config/instructor";
import {
  getApiErrorCode,
  getApiErrorMessage,
  normalizeApiError,
} from "../../services/apiError";

const unwrap = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.instructor || data?.profile || data;
};

export default function InstructorOnboardingPage() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eligibilityError, setEligibilityError] = useState(null);
  const [form, setForm] = useState({ headline: "", bio: "", accepted: false });

  useEffect(() => {
    let active = true;
    getMyInstructorProfile()
      .then((response) => {
        const current = unwrap(response);
        if (!active) return;
        setProfile(current);
        setForm({
          headline: current.headline || "",
          bio: current.bio || "",
          accepted: true,
        });
      })
      .catch((error) => {
        const apiError = normalizeApiError(error);
        if (
          !active ||
          apiError.code === "INSTRUCTOR_PROFILE_NOT_FOUND" ||
          apiError.status === 404
        )
          return;
        setEligibilityError(normalizeApiError(error));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const activate = (current) => {
    updateUser({
      ...user,
      accountType: "instructor",
      instructorId: current.id || current._id,
      instructorStatus: current.status,
      instructorProfileSlug: current.profileSlug || "",
    });
    navigate("/teacher/courses", { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!profile && !form.accepted) {
      toast.error("يجب الموافقة على اتفاقية المحاضر للمتابعة");
      return;
    }
    setSaving(true);
    try {
      const response = profile
        ? await updateMyInstructorProfile({
            headline: form.headline.trim(),
            bio: form.bio.trim(),
          })
        : await createInstructorProfile({
            agreementAccepted: true,
            agreementVersion: INSTRUCTOR_AGREEMENT_VERSION,
            headline: form.headline.trim() || undefined,
            bio: form.bio.trim() || undefined,
          });
      const current = unwrap(response);
      setProfile(current);
      toast.success(profile ? "تم تحديث ملف المحاضر" : "تم تفعيل هوية المحاضر");
      activate(current);
    } catch (error) {
      const code = getApiErrorCode(error);
      if (code === "INSTRUCTOR_ALREADY_EXISTS") {
        const current = unwrap(await getMyInstructorProfile());
        activate(current);
      } else {
        setEligibilityError(normalizeApiError(error));
        toast.error(getApiErrorMessage(error, "تعذر حفظ ملف المحاضر"));
      }
    } finally {
      setSaving(false);
    }
  };

  const blockedMessage = {
    ACCOUNT_NOT_ACTIVE: "يجب تفعيل الحساب أولاً.",
    INSTRUCTOR_NOT_ELIGIBLE: "نوع هذا الحساب غير مؤهل لإنشاء هوية محاضر.",
    TEACHER_PROFILE_NOT_FOUND: "أكمل ملف المعلم أولاً.",
    TEACHER_NOT_APPROVED: "يجب أن توافق الإدارة على حساب المعلم أولاً.",
    INSTRUCTOR_SUSPENDED:
      "هوية المحاضر موقوفة حالياً ولا يمكنها إنشاء أو تعديل الدورات.",
    INSTRUCTOR_AGREEMENT_REQUIRED: "يجب قبول اتفاقية المحاضر الحالية.",
    INSTRUCTOR_AGREEMENT_VERSION_MISMATCH:
      "نسخة اتفاقية المحاضر غير متوافقة. تواصل مع الدعم قبل المتابعة.",
  }[eligibilityError?.code];

  return (
    <AuthLayout>
      <main
        dir="rtl"
        className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8"
      >
        <h1 className="text-2xl font-extrabold text-[#1F2937]">
          {profile ? "ملف المحاضر" : "الانضمام كمحاضر"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#667085]">
          {profile
            ? "حدّث بيانات ملفك العام التي تظهر للطلاب."
            : "أكمل ملفك العام، ثم وافق صراحةً على الاتفاقية قبل إنشاء الدورات."}
        </p>
        {loading ? (
          <LoaderCircle className="mx-auto my-14 animate-spin text-[#123C91]" />
        ) : blockedMessage ? (
          <div className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">
            <strong>{blockedMessage}</strong>
            <p className="mt-2 text-sm">رمز الخطأ: {eligibilityError.code}</p>
          </div>
        ) : profile?.status === "suspended" ? (
          <div className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">
            هوية المحاضر موقوفة. لا يمكن تعديل الدورات حتى تعيد الإدارة تفعيلها.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm font-bold">
              العنوان المهني
              <input
                value={form.headline}
                onChange={(e) =>
                  setForm((v) => ({ ...v, headline: e.target.value }))
                }
                maxLength={160}
                className="mt-2 h-12 w-full rounded-xl border px-4 font-normal"
                placeholder="مثال: محاضر رياضيات"
              />
            </label>
            <label className="block text-sm font-bold">
              نبذة عامة
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((v) => ({ ...v, bio: e.target.value }))
                }
                maxLength={2000}
                rows={6}
                className="mt-2 w-full rounded-xl border p-4 font-normal"
              />
            </label>
            {!profile && (
              <label className="flex items-start gap-3 rounded-xl border bg-[#F8FAFC] p-4 text-sm leading-7">
                <input
                  type="checkbox"
                  checked={form.accepted}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, accepted: e.target.checked }))
                  }
                  className="mt-1"
                />
                <span>
                  أوافق على اتفاقية المحاضر الحالية (الإصدار{" "}
                  {INSTRUCTOR_AGREEMENT_VERSION}) وعلى شروط نشر المحتوى.
                </span>
              </label>
            )}
            <button
              disabled={saving || (!profile && !form.accepted)}
              className="h-12 w-full rounded-xl bg-[#123C91] font-bold text-white disabled:opacity-50"
            >
              {saving
                ? "جاري الحفظ..."
                : profile
                  ? "حفظ الملف"
                  : "الموافقة وتفعيل هوية المحاضر"}
            </button>
          </form>
        )}
      </main>
    </AuthLayout>
  );
}
