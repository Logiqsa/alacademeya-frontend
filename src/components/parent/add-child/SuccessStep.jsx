const SuccessStep = () => (
  <div className="text-center py-10">
    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
    <h2 className="text-2xl font-bold text-[#123C91]">تم إنشاء الحساب بنجاح</h2>
    <a href="/dashboard" className="mt-8 inline-block bg-[#123C91] text-white px-8 py-3 rounded-xl">العودة للرئيسية</a>
  </div>
);
export default SuccessStep;