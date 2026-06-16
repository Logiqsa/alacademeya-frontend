import React from 'react';

const CalendarStrip = () => {
    const days = [
        { dayName: 'السبت', dayNum: '21' },
        { dayName: 'الأحد', dayNum: '22' },
        { dayName: 'الاثنين', dayNum: '23' },
        { dayName: 'الثلاثاء', dayNum: '25' },
        { dayName: 'الأربعاء', dayNum: '25' },
        { dayName: 'الخميس', dayNum: '26' },
        { dayName: 'الجمعة', dayNum: '27' },
    ];

    return (
        <div className="grid grid-cols-7 gap-4 mb-10" dir="rtl">
            {days.map((item, i) => (
                <div
                    key={i}
                    className={`text-center cursor-pointer border transition-all flex flex-col justify-center items-center ${i === 1
                        ? 'bg-[#EAF4FF] border-[#123C91]'
                        : 'bg-white border-[#E5E5E5] hover:border-gray-200'
                        }`}
                    style={{
                        borderRadius: '8px',
                        padding: '16px'
                    }}
                >
                    <p className={`font-normal text-[14px] leading-4  mb-3 ${i === 1 ? 'text-[#123C91]' : 'text-[#1F2937]'}`}
                        style={{
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                            letterSpacing: '0%'
                        }}
                    >
                        {item.dayName}
                    </p>
                    <p className={`font-bold text-[16px] leading-4 text-center ${i === 1 ? 'text-[#123C91]' : 'text-[#1F2937]'}`}
                        style={{
                            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                            letterSpacing: '0%'
                        }}
                    >

                        {item.dayNum}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CalendarStrip;