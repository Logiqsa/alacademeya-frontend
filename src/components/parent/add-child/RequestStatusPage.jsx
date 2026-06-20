import React, { useEffect, useState } from 'react';
import { Check, Hourglass, XCircle, RotateCcw } from 'lucide-react';

// عدّل الدالة دي لو عندك endpoint حقيقي يرجع حالة آخر طلب طالب
// المفروض السيرفر يرجع حاجة زي: { status: 'pending' | 'approved' | 'rejected', studentName, reason }
const fetchLatestRequestStatus = async () => {
  // TODO: استبدل ده بنداء فعلي، مثلاً:
  // const res = await API.get('/parents/students/latest-request');
  // return res.data;
  return { status: 'pending', studentName: '', reason: '' };
};

const STATUS_CONFIG = {
  pending: {
    icon: Hourglass,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'الطلب قيد المراجعة',
    description: 'فريق الإدارة بيراجع طلبك الآن، هيتم إشعارك فور اتخاذ القرار.',
  },
  approved: {
    icon: Check,
    color: '#10B981',
    bg: '#D1FAE5',
    title: 'تم قبول الطلب',
    description: 'تم تفعيل حساب الطالب بنجاح، يمكنه الآن تسجيل الدخول.',
  },
  rejected: {
    icon: XCircle,
    color: '#EF4444',
    bg: '#FEE2E2',
    title: 'تم رفض الطلب',
    description: 'لم يتم قبول الطلب، يمكنك مراجعة السبب أدناه أو التواصل مع الدعم.',
  },
};

const RequestStatusPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLatestRequestStatus();
      setStatusData(data);
    } catch (err) {
      setError('تعذر تحميل حالة الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-16 text-center font-['IBM_Plex_Sans_Arabic']">
        <div className="w-8 h-8 border-3 border-[#123C91] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#575F69] text-[14px]">جاري تحميل حالة الطلب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-16 text-center font-['IBM_Plex_Sans_Arabic']">
        <p className="text-red-500 text-[14px] mb-4">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#123C91] text-white rounded-xl text-[14px] font-medium cursor-pointer"
        >
          <RotateCcw size={16} />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const config = STATUS_CONFIG[statusData?.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div dir="rtl" className="flex flex-col items-center justify-center py-4 text-center space-y-4 font-['IBM_Plex_Sans_Arabic']">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: config.bg }}
      >
        <Icon size={28} style={{ color: config.color }} />
      </div>

      <div>
        <h2 className="text-[20px] font-bold text-[#1F2937] mb-2">{config.title}</h2>
        <p className="text-[#1F2937BF] mt-2 text-[14px] max-w-md mx-auto">
          {config.description}
        </p>
      </div>

      {statusData?.status === 'rejected' && statusData?.reason && (
        <div className="w-full max-w-130 p-4 rounded-xl border border-red-200 bg-red-50 text-right">
          <p className="text-[13px] font-medium text-red-600 mb-1">سبب الرفض:</p>
          <p className="text-[14px] text-[#1F2937]">{statusData.reason}</p>
        </div>
      )}

      <div className="w-full max-w-130 p-8 rounded-2xl border border-[#E5E5E5] bg-[#1F29371A] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] space-y-4 text-right">
        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#10B981]">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[14px] text-[#1F2937]">تم استلام طلبك بنجاح</span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Hourglass
              size={20}
              className={statusData?.status === 'pending' ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}
            />
          </div>
          <span className="text-[14px] text-[#1F2937]">
            {statusData?.status === 'pending' ? 'جاري مراجعة الحساب من الإدارة' : 'تمت مراجعة الحساب من الإدارة'}
          </span>
        </div>

        <div className="flex items-center justify-start gap-3">
          <div className="w-6 h-6 flex items-center justify-center rounded-full" style={{ backgroundColor: statusData?.status !== 'pending' ? config.bg : 'transparent' }}>
            <Icon size={statusData?.status !== 'pending' ? 14 : 20} style={{ color: statusData?.status !== 'pending' ? config.color : '#9CA3AF' }} />
          </div>
          <span className="text-[14px] text-[#1F2937]">
            {statusData?.status === 'approved' && 'تم قبول الطلب وتفعيل الحساب'}
            {statusData?.status === 'rejected' && 'تم رفض الطلب'}
            {statusData?.status === 'pending' && 'سيتم إشعارك فور اتخاذ القرار'}
          </span>
        </div>
      </div>

      <button
        onClick={load}
        className="flex items-center gap-2 bg-white border border-[#E5E5E5] text-[#123C91] py-2.5 px-8 rounded-xl font-medium mt-4 cursor-pointer"
      >
        <RotateCcw size={16} />
        تحديث الحالة
      </button>
    </div>
  );
};

export default RequestStatusPage;