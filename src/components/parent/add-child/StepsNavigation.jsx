// src/components/parent/add-child/StepsNavigation.jsx

const StepsNavigation = ({ currentStep }) => {
  const steps = [
    { id: 4, name: "الإشتراك والدفع" },
    { id: 3, name: "بيانات دخول الطالب" },
    { id: 2, name: "المعلومات الأكاديمية" },
    { id: 1, name: "المعلومات الشخصية" }
  ];

  return (
    <div className="flex flex-row-reverse justify-between items-center bg-white border border-[#1F293726] rounded-2xl p-4 md:px-8 shadow-[0px_0px_4px_0px_#0000000A]">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 justify-center relative">
            {/* الدائرة والرقم/الاسم */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 
                ${isActive ? 'bg-[#123C91] text-white border-[#123C91]' : 
                  isCompleted ? 'bg-[#123C91] text-white border-[#123C91]' : 'bg-[#F3F4F6] text-[#6B7280] border-transparent'}`}>
                {isCompleted ? '✓' : step.id}
              </div>
              <span className={`text-xs md:text-sm font-medium ${isActive ? 'text-[#123C91]' : 'text-[#6B7280]'}`}>
                {step.name}
              </span>
            </div>

            {/* الخط الواصل بين الخطوات */}
            {index < steps.length - 1 && (
              <div className={`h-[2px] flex-1 mx-2 md:mx-4 ${isCompleted ? 'bg-[#123C91]' : 'bg-[#E5E7EB]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepsNavigation;