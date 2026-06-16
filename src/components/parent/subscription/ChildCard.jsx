import React from 'react';

const ChildCard = ({ name, plan, status, date, color, isExpiring }) => {
    const borderColor = isExpiring ? 'border-l-[#D32F2F]' : 'border-l-[#12C6B0]';
    const statusBg = isExpiring ? 'bg-[#D32F2F26] text-[#D32F2F]' : 'bg-[#ECFDF5] text-[#00A63E]';

    return (
        <div
            className={`p-4 border border-[#E5E5E5] border-l-4 ${borderColor} rounded-2xl bg-white shadow-sm flex flex-col justify-between`}
            dir="rtl"
            style={{
                width: '368px',
                height: '270px',
                borderWidth: '1px',
                borderLeftWidth: '4px'
            }}
        >

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#123C91] text-white flex items-center justify-center font-bold text-sm">
                        {name.charAt(0)}
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="mb-2"
                            style={{
                                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                                fontWeight: 400,
                                fontSize: '16px',
                                lineHeight: '16px',
                                letterSpacing: '0px',
                                textAlign: 'right',
                                verticalAlign: 'middle',
                                color: '#151C27'
                            }}
                        >
                            {name}
                        </h3>
                        <p
                            style={{
                                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                                fontWeight: 400,
                                fontSize: '12px',
                                lineHeight: '16px',
                                letterSpacing: '0px',
                                textAlign: 'right',
                                verticalAlign: 'middle',
                                color: '#434751'

                            }}
                        >
                            الصف الثاني الثانوي
                        </p>
                    </div>
                </div>
                <span
                    className={`inline-flex items-center justify-center rounded-full text-xs font-medium w-21 h-6 px-4 py-3 ${statusBg}`}
                >
                    {status}
                </span>
            </div>


            <div className="w-84.5 h-20 bg-[#EAF4FF] mb-4 p-4 rounded-lg flex flex-col justify-center gap-2">


                <div className="flex justify-between items-center">
                    <p className="text-[#434751] text-[16px] leading-6 font-normal font-sans">
                        الباقة الحالية:
                    </p>
                    <p className="text-[#123C91] text-[16px] leading-6 font-normal font-sans">
                        {plan}
                    </p>
                </div>


                <div className="flex justify-between items-center">
                    <p className="text-[#575F69] text-[16px] leading-6 font-normal font-sans">
                        التجديد القادم:
                    </p>
                    <p className={`text-[12px] leading-4 font-bold font-sans ${isExpiring ? 'text-[#E11D48]' : 'text-[#151C27]'}`}>
                        {date}
                    </p>
                </div>

            </div>

            {/* معلومات إضافية وأزرار */}
            <div className=" items-center justify-between">
                <div className="flex items-center mb-2 gap-2 w-[320px] h-5 text-[#000000] font-sans text-[14px] font-normal leading-5">
                    <span className="text-[#00A63E]">✓</span>
                    <span>24 ساعة شهرياً</span>
                </div>
                <button className="w-[320px] h-12 mb-2 border border-[#E5E5E5] rounded-lg px-6 flex items-center justify-center gap-2 text-[#123C91] bg-white font-['Tajawal'] font-medium text-[16px] leading-5.5 ">
                    تجديد الآن
                </button>
            </div>
        </div>
    );
};

export default ChildCard;