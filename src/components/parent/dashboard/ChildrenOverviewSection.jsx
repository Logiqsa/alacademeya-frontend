const children = [
  { name: "محمد أحمد", grade: "ثالث ثانوي", score: "85%", letter: "م", color: "bg-[#123C91]", gradeLetter: "A" },
  { name: "سلمى أحمد", grade: "ثاني ثانوي", score: "95%", letter: "س", color: "bg-[#123C91]", gradeLetter: "A+" }
];

const ChildrenOverviewSection = () => {
  return (
    <div className="bg-white border border-[#1F293726] rounded-2xl p-6 flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="text-right">
          <h3
            className="font-['Tajawal'] font-medium text-[20px] mb-2 text-[#1F2937]"
            style={{ lineHeight: '16px', letterSpacing: '0px' }}
          >
            نظرة عامة على الأبناء
          </h3>
          <p
            className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[16px] mt-1"
            style={{ color: '#8C9198', lineHeight: '24px', letterSpacing: '0px' }}
          >
            الأداء والتقدم الدراسي
          </p>
        </div>
        <span
          className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[14px] cursor-pointer"
          style={{ color: '#1F2937', lineHeight: '100%', letterSpacing: '0%' }}
        >
          عرض الكل
        </span>
      </div>

      <div className="space-y-4">
        {children.map((child, index) => (
          <div
            key={index}
            className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 flex flex-col gap-1"

          >

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">

                <div
                  className={`${child.color} text-white w-12 h-12 pb-2 flex items-center justify-center rounded-full font-['IBM_Plex_Sans_Arabic'] font-normal text-[18px] leading-6 tracking-[0%] text-center`}
                >
                  {child.letter}
                </div>

                <div>
                  <h4
                    className="font-['Tajawal'] font-medium text-[20px] leading-6 tracking-normal text-[#1F2937] text-right mb-2"
                  >
                    {child.name}
                  </h4>
                  <p
                    className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-5 tracking-normal text-[#575F69] text-right"
                  >
                    {child.grade}
                  </p>
                </div>

              </div>

              <div
                className="bg-[#12C6B0] text-white w-10 h-10 rounded-lg p-2.5 flex items-center justify-center font-bold"
              >
                {child.gradeLetter}
              </div>
            </div>

       
            <div className="flex justify-between items-center mb-2">
              <span
                className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-5 tracking-normal text-[#1F2937BF] text-right"
              >
                نسبة الحضور
              </span>
              <span
                className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[14px] leading-6 tracking-normal text-[#1F2937] text-right"
              >
                {child.score}
              </span>
            </div>
            <div className="w-full bg-[#123C9133] h-2 rounded-full mb-4">
              <div className="bg-[#123C91] h-2 rounded-full" style={{ width: child.score }}></div>
            </div>


            <div className="flex gap-2.5 justify-end">
              {index === 0 ? (
                <>
                  {["فيزياء", "لغة عربية", "رياضيات"].map((subject) => (
                    <span
                      key={subject}
                      className="flex items-center justify-center bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl font-['IBM_Plex_Sans_Arabic'] font-medium text-[12px] text-[#1F2937] h-6 px-2"
                    >
                      {subject}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  {["لغة فرنسية", "جغرافيا"].map((subject) => (
                    <span
                      key={subject}
                      className="flex items-center justify-center bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl font-['IBM_Plex_Sans_Arabic'] font-medium text-[12px] text-[#1F2937] h-6 px-2"
                    >
                      {subject}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenOverviewSection;