import {
  Users,
  Clock3,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const cards = [
  {
    title: "عدد الأبناء",
    value: "--",
    icon: Users,
  },
  {
    title: "ساعات الدراسة",
    value: "--",
    icon: Clock3,
  },
  {
    title: "الدروس هذا الشهر",
    value: "--",
    icon: BookOpen,
  },
  {
    title: "نسبة الحضور",
    value: "--",
    icon: TrendingUp,
  },
];

const StatsCards = () => {
  return (
    // <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    //   {cards.map((card, index) => {
    //     const Icon = card.icon;

    //     return (
    //       <div
    //         key={index}
    //         className="bg-white border rounded-xl p-4"
    //       >
    //         <div className="flex justify-between items-center">
    //           <h3 className="text-2xl font-bold">
    //             {card.value}
    //           </h3>

    //           <div className="bg-blue-50 p-2 rounded-lg">
    //             <Icon
    //               size={18}
    //               className="text-blue-700"
    //             />
    //           </div>
    //         </div>

    //         <p className="text-gray-500 text-sm mt-3">
    //           {card.title}
    //         </p>
    //       </div>
    //     );
    //   })}
    // </div>

    <></>
  );
};

export default StatsCards;