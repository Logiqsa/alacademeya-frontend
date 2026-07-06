import { Trash2, Edit3, Users, Calendar } from "lucide-react";
const StatusBadge = ({ status }) => {
  const styles = {
    "نشطة": "bg-[#00A63E26] bg-opacity-[0.15] text-[#00A63E]",
    "معلقة": "bg-[#D32F2F26] bg-opacity-[0.15] text-[#D32F2F]",
    "قيد التسجيل": "bg-[#F59E0B26] bg-opacity-[0.15] text-[#F59E0B]",
  };

  return (
    <span className={`text-[12px] font-medium px-4 py-1 rounded-[999px] ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const GroupCard = ({ group, onViewLessons, onViewStudents, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 flex flex-col gap-3 w-full ">

  
    <div className="flex items-center justify-between">
      <StatusBadge status={group.status} />
      <div className="flex gap-2.5 text-[#575F69]">
        {/* <button onClick={() => onDelete(group.id)} className="hover:text-red-500"><Trash2 size={18} /></button>
        <button onClick={() => onEdit(group.id)} className="hover:text-blue-600"><Edit3 size={18} /></button> */}
      </div>
    </div>

    
    <div>
      <h3 className="text-[#1F2937] text-[16px] font-medium leading-6 mb-2">{group.name}</h3>
      <p className="text-[#575F69] text-[14px] font-normal leading-4">{group.grade} • {group.subject}</p>
    </div>

    <div className="border border-[#E5E5E5]"></div>
    {/* Stats: Enrollment */}
    <div className="flex items-center gap-2 text-[#575F69] text-[14px] font-normal">
      <Users size={16}  className="text-[#123C91]"/>
      <span>{group.enrolled} / {group.max} طالباً</span>
    </div>

    {/* Stats: Next Lesson */}
    <div className="flex items-center gap-2 text-[#575F69] text-[14px] font-normal">
      <Calendar size={16}  className="text-[#123C91]"/>
      <span>{group.nextLesson}</span>
    </div>

    {/* Footer: Action Buttons */}
    <div className="flex gap-3 mt-2">
      <button
        onClick={() => onViewLessons(group.id)}
        className="flex-1 bg-[#123C91] text-white [&_svg]:text-white rounded-xl py-2.5 text-[14px] font-medium hover:bg-blue-900 transition"
      >
        الحصص
      </button>
      <button
        onClick={() => onViewStudents(group.id)}
        className="flex-1 border border-[#E5E5E5] text-[#1F2937] rounded-xl py-2.5 text-[14px] font-medium hover:bg-gray-50 transition"
      >
        الطلاب
      </button>
    </div>
  </div>
);

export default GroupCard;