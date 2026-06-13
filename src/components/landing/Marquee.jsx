export default function Ticker() {
  const subjects = [
    "الرياضيات", "الفيزياء", "الكيمياء", "الأحياء", 
    "اللغة الإنجليزية", "اللغة الفرنسية", "اللغة الألمانية", 
    "الحاسب الآلي", "البرمجة للمبتدئين",
  ];

  return (
    // قمت بإضافة -mt-10 للشاشات الصغيرة والمتوسطة
    // وإعادته للصفر في الشاشات الكبيرة lg:mt-0
    <section className="w-full pt-4 pb-8 bg-white -mt-10 lg:mt-0 relative z-20">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-gray-500 text-sm mb-4">
          موثوق به من آلاف الطلاب والمعلمين
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 text-center">
          {subjects.map((subject, index) => (
            <span key={index} className="text-gray-600 text-sm font-medium">
              {subject}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}