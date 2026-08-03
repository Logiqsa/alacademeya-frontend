import {
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Settings,
  Trash2,
} from "lucide-react";

const getLocalizedText = (value, lang = "ar") => {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value[lang] || value.ar || value.en || "";
  }

  return String(value);
};

const NotificationCard = ({
  title,
  description,
  time,
  type,
  isRead,
  onToggleRead,
  onOpen,
  onDelete,
  personName,
  onPersonClick,
  compact = false,
}) => {
  const isAcademic = type === "academic";

  const Icon = isAcademic ? GraduationCap : Settings;

  const safeTitle = getLocalizedText(title, "ar");
  const safeDescription = getLocalizedText(description, "ar");
  const personIndex = personName
    ? safeDescription.indexOf(personName)
    : -1;

  return (
    <div
      dir="rtl"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) onOpen();
      }}
      role={onOpen ? "link" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      className={`
        border
        border-[#E5E5E5]
        rounded-xl
        p-4
        transition-all
        ${onOpen ? "cursor-pointer hover:border-[#123C91] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30" : ""}
        ${
          isRead
            ? "bg-white"
            : "bg-[#EAF4FF]"
        }
      `}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className={`
            w-10
            h-10
            rounded-lg
            flex
            items-center
            justify-center
            shrink-0
            ${
              isAcademic
                ? "bg-[#E1F5EE] text-[#0F6E56]"
                : "bg-[#E6F1FB] text-[#185FA5]"
            }
          `}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="break-words text-[15px] font-semibold leading-6 text-[#1F2937] sm:text-[16px]">
            {safeTitle}
          </h3>

          <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#575F69] sm:text-[14px]">
            {personIndex >= 0 ? (
              <>
                {safeDescription.slice(0, personIndex)}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPersonClick();
                  }}
                  className="font-semibold text-[#123C91] underline decoration-[#123C91]/40 underline-offset-2 hover:decoration-[#123C91]"
                  title="عرض تفاصيل المستخدم"
                >
                  {personName}
                </button>
                {safeDescription.slice(personIndex + personName.length)}
              </>
            ) : (
              safeDescription
            )}
          </p>
          {personName && personIndex < 0 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPersonClick();
              }}
              className="mt-2 text-sm font-semibold text-[#123C91] underline decoration-[#123C91]/40 underline-offset-2 hover:decoration-[#123C91]"
              title="عرض تفاصيل المستخدم"
            >
              {personName}
            </button>
          )}

          <span className="block mt-2 text-[12px] text-[#1F2937BF]">
            {time}
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleRead();
          }}
          aria-label={compact ? "وضع علامة كمقروءة" : undefined}
          title={compact ? "وضع علامة كمقروءة" : undefined}
          className={compact
            ? "flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg text-[#8C9198] transition-colors hover:bg-blue-50 hover:text-[#123C91] sm:self-center"
            : "flex items-center justify-center sm:justify-start gap-1 text-[13px] sm:text-[14px] text-[#1F2937] hover:text-[#123C91] transition-colors self-start sm:self-center"
          }
        >
          {compact ? (
            <Check size={17} />
          ) : isRead ? (
            <EyeOff size={15} />
          ) : (
            <Eye size={15} />
          )}

          {!compact && <span>
            {isRead
              ? "وضع علامة كغير مقروءة"
              : "وضع علامة كمقروءة"}
          </span>}
        </button>
        {!compact && <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="حذف الإشعار"
          title="حذف الإشعار"
          className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg text-[#8C9198] transition-colors hover:bg-red-50 hover:text-red-600 sm:self-center"
        >
          <Trash2 size={17} />
        </button>}
      </div>
    </div>
  );
};

export default NotificationCard;
