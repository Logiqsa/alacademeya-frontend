import React from 'react';

const statusStyle = (status) => {
    if (status === 'نشطة') return 'bg-[#00A63E26] text-[#00A63E] ';
    if (status === 'منتهية') return 'bg-[#D32F2F26] text-[#D32F2F] ';
    if (status === 'قيد المراجعة') return 'bg-[#F59E0B26] text-[#F59E0B] ';
    return '';
};

const defaultData = [
    {
        name: 'محمد أحمد',
        plan: 'الباقة الأساسية',
        totalHours: '8 ساعات',
        consumed: '4 ساعات',
        remaining: '4 ساعات',
        duration: 'شهر',
        startDate: '01/06/2026',
        endDate: '01/07/2026',
        amount: 'EGP 700',
        status: 'نشطة',
    },
    {
        name: 'سلمى أحمد',
        plan: 'الباقة الأساسية',
        totalHours: '8 ساعات',
        consumed: '--',
        remaining: '--',
        duration: 'شهر',
        startDate: '--',
        endDate: '--',
        amount: 'EGP 700',
        status: 'قيد المراجعة',
    },
    {
        name: 'سلمى أحمد',
        plan: 'الباقة المتقدمة',
        totalHours: '24 ساعة',
        consumed: '24 ساعة',
        remaining: '0 ساعة',
        duration: 'شهر',
        startDate: '01/05/2026',
        endDate: '01/06/2026',
        amount: 'EGP 1,500',
        status: 'منتهية',
    },
];

const SubscriptionTable = ({ data = defaultData }) => (
    <div
        className="mt-4 bg-white border border-[#E5E5E5] rounded-lg overflow-hidden"
        style={{ boxShadow: "0px 0px 4px 0px #0000001F" }}
    >
        <table className="w-full border-collapse text-sm" dir="rtl">
            <thead>
                <tr className="h-12 bg-[#F9FAFA] border-b border-[#E5E5E5]">
                    {['الابن', 'الباقة', 'إجمالي الساعات', 'المستهلك', 'المتبقي', 'مدة الاشتراك', 'تاريخ البدء', 'تاريخ الانتهاء', 'المبلغ', 'الحالة'].map(h => (
                        <th
                            key={h}
                            className="px-4 py-3 text-right font-medium text-[#575F69] text-[14px] leading-4 whitespace-nowrap font-sans"
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>


            <tbody>
                {data.map((row, i) => (
                    <tr
                        key={i}
                        className="h-15 border-t border-[#E5E5E5] border-b hover:bg-[#F9FAFA] transition-colors"
                    >
                    
                        <td className="px-4 py-6 font-['Tajawal'] font-medium text-[15px] leading-5 text-[#1F2937] whitespace-nowrap">
                            {row.name}
                        </td>

                      
                        {[row.plan, row.totalHours, row.consumed].map((val, idx) => (
                            <td key={idx} className="px-4 py-6 font-sans font-normal text-[15px] leading-6 text-[#575F69] text-center whitespace-nowrap">
                                {val}
                            </td>
                        ))}

                       
                        <td className="px-4 py-6 text-center whitespace-nowrap">
                            {row.remaining === '--' ? (
                                <span className="text-[#575F69] font-sans text-[15px]">--</span>
                            ) : (
                                <span className="text-[#123C91] font-medium font-sans text-[15px] cursor-pointer hover:underline">{row.remaining}</span>
                            )}
                        </td>

                    
                        {[row.duration, row.startDate, row.endDate, row.amount].map((val, idx) => (
                            <td key={idx} className="px-4 py-6 font-sans font-normal text-[15px] leading-6 text-[#575F69] text-center whitespace-nowrap">
                                {val}
                            </td>
                        ))}

                        
                        <td className="px-4 py-6 whitespace-nowrap">
                            <span
                                className={`inline-flex items-center justify-center rounded-full text-xs font-medium ${statusStyle(row.status)}`}
                                style={{ width: '69px', height: '32px', padding: '4px 18px' }}
                            >
                                {row.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

    </div>
);

export default SubscriptionTable;