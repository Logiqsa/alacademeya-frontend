import { Search } from "lucide-react";
import AppSelect from "../../ui/AppSelect";

const ROLE_OPTIONS = ["جميع المستخدمين", "طالب دورات", "محاضر دورات", "معلم", "طالب أكاديمي", "ولي أمر", "مشرف", "مشرف عام"];
const UsersFilters = ({
  search,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  filterGrade,
  gradeOptions = [],
  onFilterGradeChange,
  filterStage,
  stageOptions = [],
  onFilterStageChange,
  filterSubject,
  subjectOptions = [],
  onFilterSubjectChange,
  filterCurriculum,
  curriculumOptions = [],
  onFilterCurriculumChange,
  hideRoleFilter = false,
  statusOptions = [],
}) => {
  const isAcademicRole = ["طالب أكاديمي", "معلم"].includes(filterRole);
  const isStudentRole = filterRole === "طالب أكاديمي";

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-1" dir="rtl">
      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="بحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      {!hideRoleFilter && <div className="relative w-full sm:w-55 lg:w-60" style={{ height: "48px" }}>
        <AppSelect
          value={filterRole}
          onChange={(e) => onFilterRoleChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </AppSelect>
      </div>}

      <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
        <AppSelect
          value={filterStatus}
          onChange={(e) => onFilterStatusChange?.(e.target.value)}
          className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
        >
          {["جميع الحالات", ...statusOptions].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </AppSelect>
      </div>

      {isAcademicRole && (
        <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
          <AppSelect
            value={filterCurriculum}
            onChange={(e) => onFilterCurriculumChange?.(e.target.value)}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]"
          >
            <option value="جميع المناهج">جميع المناهج</option>
            {curriculumOptions.map((curriculum) => (
              <option key={curriculum} value={curriculum}>{curriculum}</option>
            ))}
          </AppSelect>
        </div>
      )}

      {isStudentRole && (
        <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
          <AppSelect
            value={filterStage}
            onChange={(e) => onFilterStageChange?.(e.target.value)}
            disabled={filterCurriculum === "جميع المناهج"}
            disabledMessage="اختر المنهج أولًا"
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] disabled:cursor-not-allowed disabled:bg-[#F2F4F7]"
          >
            <option value="جميع المراحل">جميع المراحل</option>
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </AppSelect>
        </div>
      )}

      {isAcademicRole && (
        <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
          <AppSelect
            value={filterGrade}
            onChange={(e) => onFilterGradeChange?.(e.target.value)}
            disabled={isStudentRole ? filterStage === "جميع المراحل" : filterCurriculum === "جميع المناهج"}
            disabledMessage={isStudentRole ? "اختر المرحلة أولًا" : "اختر المنهج أولًا"}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] disabled:cursor-not-allowed disabled:bg-[#F2F4F7]"
          >
            <option value="جميع الصفوف">جميع الصفوف</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </AppSelect>
        </div>
      )}

      {isAcademicRole && (
          <div className="relative w-full sm:w-47.5 lg:w-55" style={{ height: "48px" }}>
            <AppSelect
              value={filterSubject}
              onChange={(e) => onFilterSubjectChange?.(e.target.value)}
              disabled={filterGrade === "جميع الصفوف"}
              disabledMessage="اختر الصف أولًا"
              className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] disabled:cursor-not-allowed disabled:bg-[#F2F4F7]"
            >
              <option value="جميع المواد">جميع المواد</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </AppSelect>
          </div>
      )}
    </div>
  );
};

export default UsersFilters;
