import React from 'react';

const StepsNavigation = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, name: 'المعلومات الشخصية' },
    { id: 2, name: 'المعلومات الأكاديمية' },
    { id: 3, name: 'بيانات دخول الطالب' },
    { id: 4, name: 'المراجعة والإنشاء' },
  ];

  return (
    <div
      dir="rtl"
      className="w-full bg-white border border-[#E5E5E5] rounded-2xl px-8 pt-3 pb-2 mt-8 flex items-center justify-between
      shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_0px_3px_0px_rgba(0,0,0,0.1)]"
    >
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-[#123C91CC] border-2 border-[#123C91] text-white'
                    : isCompleted
                      ? 'bg-[#1E4FAE] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`
                  font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-6 text-right px-2 py-1 rounded-md
                  ${isActive ? 'text-[#1F2937]' : 'text-[#6B7280]'}
                `}
              >
                {step.name}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div className="h-1 w-23 mx-2 rounded-full bg-[#E5E5E5]" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepsNavigation;