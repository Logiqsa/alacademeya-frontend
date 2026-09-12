import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { normalizeApiError } from "../../../../services/apiError";
import { confirmToast } from "../../../../utils/confirmToast";
import {
  editCourseReview,
  fetchAdminCourseReviews,
  fetchCourseAccess,
  fetchCourseReviews,
  fetchInstructorCourseReviews,
  fetchMyCourseReview,
  removeAdminCourseReview,
  removeCourseReview,
  submitCourseReview,
} from "../../api/coursesApi";
import CourseRatingSummary from "./CourseRatingSummary";
import CourseReviewActions from "./CourseReviewActions";
import CourseReviewFilters from "./CourseReviewFilters";
import CourseReviewFormModal from "./CourseReviewFormModal";
import CourseReviewList from "./CourseReviewList";

const LIMIT = 10;
const learnerRoles = new Set(["user", "student", "teacher", "parent"]);

export default function ReviewsPanel({ course, user = null, mode = "public", onCourseRefresh }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [access, setAccess] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [ownershipLoading, setOwnershipLoading] = useState(mode === "public" && Boolean(user));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const loadReviews = useCallback(async (requestedPage = page) => {
    setLoading(true); setError("");
    try {
      const params = { page: requestedPage, limit: LIMIT, sort, ...(rating ? { rating: Number(rating) } : {}) };
      const loader = mode === "admin" ? fetchAdminCourseReviews : mode === "instructor" ? fetchInstructorCourseReviews : fetchCourseReviews;
      const result = await loader(course.id, params);
      setItems(result.items); setPagination(result.pagination);
    } catch (requestError) { setError(normalizeApiError(requestError).message || "تعذر تحميل التقييمات."); }
    finally { setLoading(false); }
  }, [course.id, mode, page, rating, sort]);

  const loadOwnership = useCallback(async () => {
    if (mode !== "public" || !user || !learnerRoles.has(user.role)) { setOwnershipLoading(false); return; }
    setOwnershipLoading(true);
    const [accessResult, reviewResult] = await Promise.allSettled([fetchCourseAccess(course.id), fetchMyCourseReview(course.id)]);
    if (accessResult.status === "fulfilled") setAccess(accessResult.value);
    if (reviewResult.status === "fulfilled") setMyReview(reviewResult.value);
    setOwnershipLoading(false);
  }, [course.id, mode, user]);

  useEffect(() => { const timer = window.setTimeout(loadReviews, 0); return () => window.clearTimeout(timer); }, [loadReviews]);
  useEffect(() => { const timer = window.setTimeout(loadOwnership, 0); return () => window.clearTimeout(timer); }, [loadOwnership]);

  const refreshAfterMutation = async (targetPage = page) => Promise.all([loadReviews(targetPage), loadOwnership(), onCourseRefresh?.()]);
  const changeSort = (value) => { setPage(1); setSort(value); };
  const changeRating = (value) => { setPage(1); setRating(value); };
  const openForm = (isEdit) => { setEditing(isEdit); setFormError(null); setFormOpen(true); };
  const submit = async (payload, setInlineErrors) => {
    setSubmitting(true); setFormError(null);
    try {
      if (editing) await editCourseReview(course.id, payload); else await submitCourseReview(course.id, payload);
      await refreshAfterMutation(1); setPage(1); setFormOpen(false); toast.success(editing ? "تم تحديث تقييمك" : "تم نشر تقييمك");
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      if (apiError.code === "COURSE_REVIEW_TEXT_MAX_LENGTH") setInlineErrors((current) => ({ ...current, reviewText: apiError.message }));
      if (apiError.code === "COURSE_REVIEW_ALREADY_EXISTS") { await loadOwnership(); setEditing(true); }
      if (apiError.code === "COURSE_REVIEW_NOT_FOUND") await loadOwnership();
      if (["COURSE_ENROLLMENT_REQUIRED", "COURSE_ACCESS_REVOKED", "COURSE_OWNER_CANNOT_REVIEW"].includes(apiError.code)) { await loadOwnership(); setFormOpen(false); }
      setFormError({ ...apiError, message: apiError.code === "COURSE_REVIEW_REQUIRES_STARTED_LESSON" ? "ابدأ درساً واحداً على الأقل قبل إضافة تقييمك. تم الاحتفاظ بما كتبته." : apiError.message });
    } finally { setSubmitting(false); }
  };
  const deleteOwn = async () => {
    if (!await confirmToast({ title: "حذف تقييمك؟", message: "سيتم حذف تقييمك نهائياً من الدورة.", confirmLabel: "حذف", danger: true })) return;
    setDeletingId("own");
    try { await removeCourseReview(course.id); await refreshAfterMutation(); toast.success("تم حذف تقييمك"); }
    catch (requestError) { const apiError = normalizeApiError(requestError); if (apiError.code === "COURSE_REVIEW_NOT_FOUND") await loadOwnership(); toast.error(apiError.message); }
    finally { setDeletingId(""); }
  };
  const deleteAdmin = async (review) => {
    if (!review.id || !await confirmToast({ title: "حذف التقييم؟", message: "سيتم حذف تقييم المتعلم وتحديث متوسط الدورة.", confirmLabel: "حذف", danger: true })) return;
    setDeletingId(review.id);
    try { await removeAdminCourseReview(course.id, review.id); const target = items.length === 1 && page > 1 ? page - 1 : page; if (target !== page) setPage(target); else await refreshAfterMutation(target); if (target !== page) await onCourseRefresh?.(); toast.success("تم حذف التقييم"); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setDeletingId(""); }
  };

  return <div className="space-y-3" id="course-reviews"><CourseRatingSummary averageRating={course.averageRating ?? course.rating} ratingCount={course.ratingCount} />{mode === "public" && <CourseReviewActions user={user} access={access} myReview={myReview} loading={ownershipLoading} deleting={deletingId === "own"} onAdd={() => openForm(false)} onEdit={() => openForm(true)} onDelete={deleteOwn} />}<div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-extrabold text-[#1F2937]">آراء المتعلمين</h2><p className="mt-0.5 text-sm text-[#667085]">{pagination.total.toLocaleString("ar-EG")} تقييم</p></div><CourseReviewFilters sort={sort} rating={rating} onSortChange={changeSort} onRatingChange={changeRating} /></div><CourseReviewList items={items} pagination={pagination} loading={loading} error={error} filtered={Boolean(rating)} onRetry={() => loadReviews()} onPageChange={setPage} onDelete={mode === "admin" ? deleteAdmin : undefined} deletingId={deletingId} /></div>{mode === "public" && formOpen && <CourseReviewFormModal key={`${editing}-${myReview?.updatedAt || "new"}`} open review={editing ? myReview : null} submitting={submitting} apiError={formError} onClose={() => setFormOpen(false)} onSubmit={submit} />}</div>;
}
