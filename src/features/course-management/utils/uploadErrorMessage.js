export const uploadErrorMessage = (error) => {
  const message = error?.response?.data?.message || error?.message || 'تعذر إكمال الرفع';
  if (/protected file content or type is not allowed/i.test(message)) {
    return 'الخادم رفض نوع الملف أو محتواه. تأكد أن الملف سليم وبصيغة مدعومة، ثم اختره من جديد وأعد المحاولة.';
  }
  return message;
};
