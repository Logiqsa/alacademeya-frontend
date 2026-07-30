import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  User,
  X,
  Info,
  FileText,
  ExternalLink,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { createPortal } from "react-dom";
import { getArabicCountryName } from "../../../utils/countryName";
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const USER_TYPE_OPTIONS = [
  "جميع المستخدمين",
  "معلم",
  "طالب",
  "ولي أمر",
  "مشرف",
  "مشرف عام",
];

const formatMonthlyHours = (minutes = 0) => {
  const hours = minutes / 60;
  return `${hours.toFixed(1).replace(".0", "")} ساعة`;
};

const localizedName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "";
};

const listNames = (value) => {
  if (!Array.isArray(value)) return localizedName(value) || "--";
  const names = value
    .map((item) => localizedName(item?.name ?? item))
    .filter(Boolean);
  return [...new Set(names)].join("، ") || "--";
};

const fileUrl = (value) => {
  const raw =
    (typeof value === "string"
      ? value
      : value?.url || value?.secureUrl || value?.path) || "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://api.alacademeya.com/api/${raw.replace(/^\/+/, "").replace(/^api\//, "")}`;
};

const whatsappUrl = (phone) => {
  const number = String(phone || "")
    .trim()
    .replace(/[^\d]/g, "")
    .replace(/^00/, "");

  return number ? `https://wa.me/${number}` : "";
};

const teacherData = (profile) => {
  const profileUser =
    profile?.user && typeof profile.user === "object" ? profile.user : {};
  const merged = { ...profileUser, ...profile };
  const cv =
    merged.cv ??
    merged.cvUrl ??
    merged.resume ??
    merged.resumeUrl ??
    merged.documents?.cv;

  return {
    ...merged,
    username: merged.username || profileUser.username,
    phone: merged.phone || profileUser.phone,
    countryName: getArabicCountryName(merged.country),
    curriculaLabel: listNames(merged.curriculums ?? merged.curriculum),
    gradesLabel: listNames(merged.grades ?? merged.grade),
    subjectsLabel: listNames(merged.subjects ?? merged.subject),
    certificatesLabel: listNames(merged.certificates),
    cvUrl: fileUrl(cv),
  };
};

const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-[#8C9198]",
  };

  return (
    <span
      className={`inline-flex min-w-18 items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? map.gray
        }`}
    >
      {label}
    </span>
  );
};

const statusBadge = (status) => {
  if (status === "نشط") return <Badge label={status} type="green" />;
  if (status === "معلق") return <Badge label={status} type="orange" />;
  if (status === "موقوف") return <Badge label={status} type="red" />;
  return <Badge label={status} type="gray" />;
};

const roleBadge = (role) => {
  if (role === "معلم") return <Badge label={role} type="green" />;
  if (role === "طالب") return <Badge label={role} type="blue" />;
  if (role === "ولي أمر") return <Badge label={role} type="orange" />;
  return <Badge label={role} type="gray" />;
};

const Avatar = ({ name, avatarUrl, size = 8 }) => (
  <div
    className={`w-${size} h-${size} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0`}
  >
    {avatarUrl ? (
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    ) : (
      <User size={size === 8 ? 15 : 22} className="text-gray-400" />
    )}
  </div>
);

const UserCell = ({ name, avatarUrl }) => (
  <div className="flex items-center gap-2.5">
    <Avatar name={name} avatarUrl={avatarUrl} size={8} />
    <span className="text-sm font-medium text-[#1A1A1A] font-['Tajawal']">
      {name}
    </span>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex min-h-16 flex-col justify-center gap-1 rounded-xl bg-[#F9FAFA] px-4 py-3">
    <span className="text-[12px] text-[#8C9198]">{label}</span>
    <span className="break-words text-[14px] font-medium text-[#1F2937] font-['Tajawal']">
      {value ?? "--"}
    </span>
  </div>
);

export const UserDetailsModal = ({
  open,
  onClose,
  user,
  reportLoading,
  reportError,
}) => {
  if (!open || !user) return null;

  const isTeacher = user.role === "معلم";
  const isParent = user.role === "ولي أمر";
  const isStudent = user.role === "طالب";
  const userWhatsappUrl = whatsappUrl(user.phone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ${isTeacher ? "max-w-4xl sm:p-7" : "max-w-sm"
          }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">
            تفاصيل المستخدم
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-5">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size={16} />

          <p className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">
            {user.name}
          </p>

          <p className="text-[13px] text-[#8C9198]" dir="ltr">
            {user.email}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {statusBadge(user.status)}
            {roleBadge(user.role)}
          </div>
        </div>
        <a
          href={userWhatsappUrl || undefined}
          target={userWhatsappUrl ? "_blank" : undefined}
          rel={userWhatsappUrl ? "noopener noreferrer" : undefined}
          aria-disabled={!userWhatsappUrl}
          onClick={(event) => {
            if (!userWhatsappUrl) event.preventDefault();
          }}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${userWhatsappUrl
            ? "bg-[#25D366] text-white hover:bg-[#20bd5a]"
            : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
        >
          <MessageCircle size={18} />
          تواصل عبر واتساب
        </a>
        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow label="تاريخ الانضمام" value={user.joinDate} />
          <DetailRow label="رقم الهاتف" value={user.phone} />
          <DetailRow label="اسم المستخدم" value={user.username} />
        </div>

        {isStudent && (
          <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="المرحلة" value={user.stage} />
            <DetailRow label="الباقة" value={user.package} />
          </div>
        )}

        {isStudent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="الصف" value={user.grade || "—"} />
          </div>
        )}

        {isTeacher && (
          <>
            <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="سنوات الخبرة"
                value={user.experienceYears ?? user.experience}
              />
              <DetailRow
                label="المواد"
                value={user.subjectsLabel ?? user.subject}
              />
              <DetailRow
                label="المناهج"
                value={user.curriculaLabel ?? user.curriculum}
              />
              <DetailRow
                label="الصفوف"
                value={user.gradesLabel ?? user.grade}
              />
              <DetailRow label="الدولة" value={user.countryName} />
              <DetailRow label="لغة التدريس" value={user.language} />
              <DetailRow label="التقييم" value={user.rating} />
              <DetailRow
                label="حالة ملف المعلم"
                value={user.teacherStatus ?? user.status}
              />
            </div>

            <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="الساعات الشهرية"
                value={
                  reportLoading
                    ? "جاري التحميل..."
                    : (user.monthlyTeachingHours ?? "--")
                }
              />

              <DetailRow
                label="الجلسات المكتملة"
                value={
                  reportLoading
                    ? "..."
                    : (user.monthlyCompletedSessions ?? "--")
                }
              />
            </div>

            <a
              href={user.cvUrl || undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!user.cvUrl}
              onClick={(event) => {
                if (!user.cvUrl) event.preventDefault();
              }}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold !text-white transition-colors sm:w-auto [&_svg]:!text-white ${user.cvUrl
                  ? "bg-[#123C91] hover:bg-[#0f327a]"
                  : "cursor-not-allowed bg-gray-100"
                }`}
            >
              <FileText size={17} />
              {user.cvUrl ? "عرض السيرة الذاتية" : "السيرة الذاتية غير متاحة"}
              {user.cvUrl && <ExternalLink size={15} />}
            </a>

            {reportError && (
              <p className="mt-2 text-[12px] text-red-500 text-center">
                {reportError}
              </p>
            )}
          </>
        )}

        {isParent && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DetailRow label="اسم الابن" value={user.childName ?? "علي محمد"} />

            <DetailRow label="عدد الأبناء" value={user.childrenCount ?? "1"} />
          </div>
        )}
      </div>
    </div>
  );
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmClass,
  iconColor,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center"
        dir="rtl"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconColor}`}
        >
          <Info size={22} />
        </div>

        <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-2">
          {title}
        </h3>

        <p className="text-[13px] text-[#6B7280] mb-6 font-['IBM_Plex_Sans_Arabic']">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-[14px] transition-opacity hover:opacity-90 ${confirmClass}`}
          >
            {confirmLabel}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E5E5E5] rounded-xl text-[#374151] font-medium text-[14px] hover:border-gray-400"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionsMenu = ({ user, onView, onApprove, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const isSuspended = user.status === "موقوف";
  const isPending = user.status === "معلق";

  const items = [
    {
      key: "view",
      label: "عرض",
      Icon: Eye,
      onClick: () => onView?.(user),
    },
  ];

  if (isPending) {
    items.push({
      key: "approve",
      label: "قبول الطلب",
      Icon: CheckCircle2,
      onClick: () => onApprove?.(user),
      tone: "text-[#123C91]",
    });
  } else if (isSuspended) {
    items.push({
      key: "activate",
      label: "تفعيل",
      Icon: CheckCircle2,
      onClick: () => onToggleStatus?.(user),
      tone: "text-green-600",
    });
  } else {
    items.push({
      key: "suspend",
      label: "إيقاف",
      Icon: Ban,
      onClick: () => onToggleStatus?.(user),
      tone: "text-orange-500",
    });
  }

  items.push({
    key: "delete",
    label: "حذف",
    Icon: Trash2,
    onClick: () => onDelete?.(user),
    tone: "text-red-600",
  });

  const handleToggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) return;

    const menuWidth = 144;
    const menuHeight = items.length * 42 + 8;
    const screenPadding = 8;
    const gap = 4;

    const availableBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove =
      availableBelow < menuHeight && rect.top > menuHeight;

    const top = shouldOpenAbove
      ? Math.max(screenPadding, rect.top - menuHeight - gap)
      : Math.min(
        rect.bottom + gap,
        window.innerHeight - menuHeight - screenPadding,
      );

    const left = Math.min(
      Math.max(screenPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - screenPadding,
    );

    setPosition({ top, left });
    setOpen(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedWrapper = wrapperRef.current?.contains(event.target);

      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedWrapper && !clickedMenu) {
        setOpen(false);
      }
    };

    const closeMenu = () => setOpen(false);

    document.addEventListener("mousedown", handleOutsideClick);

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        className="p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors"
        aria-label="إجراءات المستخدم"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className="fixed z-[100] w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {items.map((item) => {
              const Icon = item.Icon;

              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick();
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-right hover:bg-gray-50 ${item.tone ?? "text-[#575F69]"
                      }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
};

const MobileCard = ({ u, onView, onApprove, onToggleStatus, onDelete }) => (
  <div
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
    dir="rtl"
  >
    <div className="flex items-center justify-between mb-3">
      <UserCell name={u.name} avatarUrl={u.avatarUrl} />

      <ActionsMenu
        user={u}
        onView={onView}
        onApprove={onApprove}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    </div>

    <div className="flex items-center gap-2 mb-3">
      {roleBadge(u.role)}
      {statusBadge(u.status)}
    </div>

    <div className="divide-y divide-gray-50">
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">البريد الإلكتروني</span>

        <span
          className="text-[13px] text-[#575F69] truncate max-w-[55%]"
          dir="ltr"
        >
          {u.email}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-[#8C9198]">تاريخ الانضمام</span>

        <span className="text-[13px] text-[#575F69]">{u.joinDate}</span>
      </div>
    </div>
  </div>
);

const UsersTable = ({
  users = [],
  onApprove,
  onToggleStatus,
  onDelete,
  sort,
  onSort,
  typeFilter = "جميع المستخدمين",
  onTypeFilter,
}) => {
  const [detailsUser, setDetailsUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [approveUser, setApproveUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const handleView = async (user) => {
    setDetailsUser(user);
    setReportError("");

    if (user.role !== "معلم") {
      return;
    }

    setReportLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("برجاء تسجيل الدخول مرة أخرى");
      }

      // الحصول على Teacher Profile باستخدام User ID
      const teacherResponse = await fetch(
        `https://api.alacademeya.com/api/teachers?user=${user.id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const teacherResult = await teacherResponse.json();

      if (!teacherResponse.ok || !teacherResult.success) {
        throw new Error(teacherResult.message || "تعذر تحميل بيانات المعلم");
      }

      const teacherProfile = Array.isArray(teacherResult.data)
        ? teacherResult.data[0]
        : teacherResult.data;

      if (!teacherProfile) {
        throw new Error("ملف المعلم غير موجود");
      }

      const teacherId = teacherProfile.id ?? teacherProfile._id;

      if (!teacherId) {
        throw new Error("معرف المعلم غير موجود");
      }

      const fullTeacherData = teacherData(teacherProfile);
      setDetailsUser((currentUser) =>
        currentUser?.id === user.id
          ? {
            ...currentUser,
            ...fullTeacherData,
            id: currentUser.id,
            name:
              fullTeacherData.fullName ||
              fullTeacherData.name ||
              currentUser.name,
            role: currentUser.role,
            status: currentUser.status,
            teacherStatus: fullTeacherData.status,
            teacherId,
          }
          : currentUser,
      );

      const month = getCurrentMonth();

      // الحصول على التقرير الشهري
      const reportResponse = await fetch(
        `https://api.alacademeya.com/api/teachers/${teacherId}/monthly-report?month=${month}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const reportResult = await reportResponse.json();

      if (!reportResponse.ok || !reportResult.success) {
        throw new Error(reportResult.message || "تعذر تحميل التقرير الشهري");
      }

      const totalMinutes =
        reportResult.data?.summary?.totalTeachingMinutes ?? 0;

      const completedSessions =
        reportResult.data?.summary?.completedSessions ?? 0;

      setDetailsUser((currentUser) => {
        if (!currentUser || currentUser.id !== user.id) {
          return currentUser;
        }

        return {
          ...currentUser,
          teacherId,
          monthlyTeachingHours: formatMonthlyHours(totalMinutes),
          monthlyCompletedSessions: completedSessions,
          monthlyReportMonth: reportResult.data.month,
        };
      });
    } catch (error) {
      setReportError(error.message || "حدث خطأ أثناء تحميل التقرير الشهري");
    } finally {
      setReportLoading(false);
    }
  };

  const handleApprove = (user) => setApproveUser(user);
  const handleDelete = (user) => setDeleteUser(user);

  const handleToggleStatus = (user) => {
    if (user.status === "موقوف" || user.status === "معلق") {
      setActivateUser(user);
    } else {
      setSuspendUser(user);
    }
  };

  if (users.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]"
      >
        لا يوجد مستخدمون متاحون
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className="w-full">
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full table-fixed text-right"
              style={{ minWidth: "900px" }}
            >
              <colgroup>
                <col className="w-[21%]" />
                <col className="w-[12%]" />
                <col className="w-[25%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-[#F9FAFA] border-b border-gray-100">
                <tr>
                  {[
                    { label: "المستخدم", sortKey: "name" },
                    { label: "النوع", isTypeFilter: true },
                    { label: "البريد الإلكتروني" },
                    { label: "الحالة", sortKey: "status" },
                    { label: "تاريخ الانضمام", sortKey: "joinDate" },
                    { label: "الإجراءات" },
                  ].map(({ label, sortKey, isTypeFilter }) => {
                    const isActive = sortKey && sort?.key === sortKey;
                    const SortIcon = !isActive
                      ? ArrowUpDown
                      : sort.direction === "asc"
                        ? ArrowUp
                        : ArrowDown;

                    return (
                      <th
                        key={label}
                        className="whitespace-nowrap px-5 py-3.5 text-[13px] font-medium text-[#575F69]"
                        aria-sort={
                          isActive
                            ? sort.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                      >
                        {isTypeFilter ? (
                          <label className="relative inline-flex items-center">
                            <select
                              value={typeFilter}
                              onChange={(event) =>
                                onTypeFilter?.(event.target.value)
                              }
                              aria-label="اختيار نوع المستخدم"
                              className={`h-9 cursor-pointer appearance-none rounded-lg border bg-white py-1 pr-3 pl-8 text-sm font-medium outline-none transition-colors hover:border-[#123C91] ${
                                typeFilter !== "جميع المستخدمين"
                                  ? "border-[#123C91] bg-[#EAF4FF] text-[#123C91]"
                                  : "border-gray-200 text-[#575F69]"
                              }`}
                            >
                              {USER_TYPE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute left-2.5 text-[#123C91]"
                            />
                          </label>
                        ) : sortKey ? (
                          <button
                            type="button"
                            onClick={() => onSort?.(sortKey)}
                            className={`flex items-center gap-1.5 font-medium transition-colors hover:text-[#123C91] ${
                              isActive ? "text-[#123C91]" : ""
                            }`}
                          >
                            {label}
                            <SortIcon size={15} />
                          </button>
                        ) : (
                          label
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <UserCell name={user.name} avatarUrl={user.avatarUrl} />
                    </td>

                    <td className="px-5 py-3.5">{roleBadge(user.role)}</td>

                    <td
                      className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap"
                      dir="ltr"
                    >
                      {user.email}
                    </td>

                    <td className="px-5 py-3.5">{statusBadge(user.status)}</td>

                    <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                      {user.joinDate}
                    </td>

                    <td className="px-5 py-3.5">
                      <ActionsMenu
                        user={user}
                        onView={handleView}
                        onApprove={handleApprove}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {users.map((user) => (
            <MobileCard
              key={user.id}
              u={user}
              onView={handleView}
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <UserDetailsModal
        open={Boolean(detailsUser)}
        onClose={() => {
          setDetailsUser(null);
          setReportError("");
        }}
        user={detailsUser}
        reportLoading={reportLoading}
        reportError={reportError}
      />

      <ConfirmDialog
        open={Boolean(approveUser)}
        onClose={() => setApproveUser(null)}
        onConfirm={() => {
          onApprove?.(approveUser);
          setApproveUser(null);
        }}
        title="الموافقة على الطلب"
        message="هل تريد الموافقة على طلب تسجيل هذا المستخدم وتفعيل حسابه؟"
        confirmLabel="موافقة"
        confirmClass="bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      <ConfirmDialog
        open={Boolean(activateUser)}
        onClose={() => setActivateUser(null)}
        onConfirm={() => {
          onToggleStatus?.(activateUser);
          setActivateUser(null);
        }}
        title="تفعيل الحساب"
        message="هل تريد تفعيل حساب هذا المستخدم؟"
        confirmLabel="تفعيل"
        confirmClass="bg-[#123C91] text-white [&_svg]:text-white hover:bg-[#0f3280]"
        iconColor="bg-blue-100 text-blue-500"
      />

      <ConfirmDialog
        open={Boolean(suspendUser)}
        onClose={() => setSuspendUser(null)}
        onConfirm={() => {
          onToggleStatus?.(suspendUser);
          setSuspendUser(null);
        }}
        title="إيقاف المستخدم"
        message="هل تريد إيقاف حساب هذا المستخدم؟"
        confirmLabel="إيقاف"
        confirmClass="bg-orange-500 hover:bg-orange-600"
        iconColor="bg-orange-100 text-orange-500"
      />

      <ConfirmDialog
        open={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => {
          onDelete?.(deleteUser.id);
          setDeleteUser(null);
        }}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع."
        confirmLabel="حذف"
        confirmClass="bg-red-500 hover:bg-red-600"
        iconColor="bg-red-100 text-red-500"
      />
    </>
  );
};

export default UsersTable;
