import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, LoaderCircle, RefreshCw } from "lucide-react";
import { getCurrentPolicy } from "../services/APIService";
import { normalizeRichTextHtml } from "../utils/richTextHtml";
import Seo from "../components/seo/Seo";
import { cleanDescription } from "../components/seo/seoCore";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const localized = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value.ar || value.en || "";
};

const POLICY_TITLES = {
  instructor_agreement: "اتفاقية المحاضر",
  course_publishing_policy: "سياسة نشر الدورات",
  revenue_share_agreement: "اتفاقية مشاركة الإيرادات",
  learner_course_terms: "شروط شراء والالتحاق بالدورات",
};
const POLICY_PATHS = {
  instructor_agreement: "/policies/instructor-agreement",
  course_publishing_policy: "/policies/course-publishing",
  revenue_share_agreement: "/policies/revenue-share",
  learner_course_terms: "/policies/course-terms",
};

export default function InstructorAgreementPage({
  policyType = "instructor_agreement",
}) {
  const [policyResponse, setPolicyResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadedPolicyType, setLoadedPolicyType] = useState("");
  const requestSequence = useRef(0);

  const load = useCallback(() => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError("");
    getCurrentPolicy(policyType)
      .then((response) => {
        if (requestId !== requestSequence.current) return;
        setPolicyResponse(unwrap(response));
        setLoadedPolicyType(policyType);
      })
      .catch((requestError) => {
        if (requestId !== requestSequence.current) return;
        setLoadedPolicyType(policyType);
        setError(
          requestError?.response?.data?.message ||
            "تعذر تحميل اتفاقية المحاضر حاليًا.",
        );
      })
      .finally(() => {
        if (requestId === requestSequence.current) setLoading(false);
      });
  }, [policyType]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => {
      window.clearTimeout(timer);
      requestSequence.current += 1;
    };
  }, [load]);

  const policy = loadedPolicyType === policyType ? policyResponse : null;

  return (
    <>
    <Seo title={localized(policy?.title) || POLICY_TITLES[policyType]} description={cleanDescription(localized(policy?.content), POLICY_TITLES[policyType])} path={POLICY_PATHS[policyType]} />
    <main dir="rtl" className="min-h-[65vh] bg-[#F6F8FB] px-4 py-10 sm:py-14">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#DDE4EC] bg-white shadow-sm">
        <header className="border-b border-[#E5EAF1] bg-linear-to-l from-[#123C91] to-[#176FA5] px-5 py-7 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/15">
              <FileText size={23} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                {localized(policy?.title) || POLICY_TITLES[policyType]}
              </h1>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid min-h-72 place-items-center text-[#123C91]">
            <LoaderCircle className="animate-spin" size={30} />
          </div>
        ) : error ? (
          <div className="grid min-h-72 place-items-center p-6 text-center">
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-5 py-2.5 text-sm font-bold text-white">
                <RefreshCw size={16} /> إعادة المحاولة
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-8">
            {policy?.publishedAt && (
              <p className="mb-5 text-xs text-[#667085]">
                تاريخ النشر: {new Date(policy.publishedAt).toLocaleDateString("ar-EG")}
              </p>
            )}
            <article
              className="policy-rich-content text-sm leading-8 text-[#344054] sm:text-base"
              dangerouslySetInnerHTML={{ __html: normalizeRichTextHtml(localized(policy?.content)) }}
            />
          </div>
        )}
      </section>
    </main>
    </>
  );
}
