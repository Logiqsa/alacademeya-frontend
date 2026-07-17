import { Link, useLocation, useParams } from "react-router-dom";

// ⚠️ عدّلي المسميات دي حسب اللي عايزاه يتعرض للمستخدم
// المفتاح = segment زي ما هو مكتوب في الـ path
const SEGMENT_LABELS = {
  "parent-dashboard": "الرئيسية",
  "teacher-dashboard": "الرئيسية",
  "student-dashboard": "الرئيسية",
  "admin-dashboard": "الرئيسية",

  parent: "ولي الأمر",
  teacher: "المعلم",
  student: "الطالب",
  admin: "الإدارة",

  "add-child": "إضافة طفل",
  schedule: "الجدول",
  children: "الأبناء",
  notifications: "الإشعارات",
  subscription: "الاشتراك",
  subscriptions: "الاشتراكات",
  messages: "الرسائل",
  settings: "الإعدادات",

  groups: "المجموعات",
  lessons: "الحصص",
  students: "الطلاب",
  new: "إنشاء جديد",
  tasks: "المهام",
  assignments: "الواجبات",
  earnings: "الأرباح",
  attendance: "الحضور",

  users: "المستخدمين",
  supervisors: "المشرفين",
  records: "التسجيلات",
  requests: "الطلبات",
  activate: "تفعيل",
  curriculum: "المنهج",
  create: "إنشاء",
  add: "إضافة",

  classrooms: "الفصول",
  sessions: "الجلسات",
  files: "الملفات",
};

// segments دي بتاعت الـ id الديناميكي (زي :groupId) عايزين نعرض قيمتها الحقيقية
// أو كلمة عامة بدل الـ id لو مفيش اسم متاح
const DYNAMIC_LABELS = {
  groupId: "تفاصيل المجموعة",
  lessonId: "تفاصيل الحصة",
  studentId: "تفاصيل الطالب",
  assignmentId: "تفاصيل الواجب",
  classroomId: "الفصل",
  sessionId: "الجلسة",
  id: "التفاصيل",
  productId: "تفاصيل العنصر",
};

// أي segment عايزة تتجاهله تماما من العرض (زي أرقام أو IDs من غير مسمى واضح)
const HIDDEN_SEGMENTS = new Set([]);

export default function Breadcrumbs({ homeTo = "/" }) {
  const location = useLocation();
  const params = useParams();

  // نبني set من قيم الـ params عشان نقدر نميز أي segment هو فعليا قيمة id ديناميكي
  const paramValues = new Set(Object.values(params).filter(Boolean));
  const paramKeysByValue = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [value, key])
  );

  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null; // في الصفحة الرئيسية مفيش داعي لبريدكرمب

  let accumulatedPath = "";
  const crumbs = segments
    .map((segment) => {
      accumulatedPath += `/${segment}`;
      if (HIDDEN_SEGMENTS.has(segment)) return null;

      let label;
      if (paramValues.has(segment)) {
        const paramKey = paramKeysByValue[segment];
        label = DYNAMIC_LABELS[paramKey] || segment;
      } else {
        label = SEGMENT_LABELS[segment] || segment;
      }

      return { path: accumulatedPath, label };
    })
    .filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" dir="rtl" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link to={homeTo} className="hover:text-[#123C91] transition-colors">
            الرئيسية
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              <span className="text-gray-400">/</span>
              {isLast ? (
                <span className="font-medium text-[#123C91]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-[#123C91] transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}