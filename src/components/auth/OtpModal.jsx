// src/components/auth/OtpModal.jsx
export default function OtpModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl w-96 text-center">
        <h3 className="text-lg font-bold mb-4">كود التحقق</h3>
        <div className="flex gap-2 justify-center mb-6">
          {[1,2,3,4,5,6].map(i => (
            <input key={i} maxLength="1" className="w-10 h-12 border rounded text-center" />
          ))}
        </div>
        <button onClick={onClose} className="w-full bg-blue-900 text-white p-3 rounded-lg">تأكيد</button>
      </div>
    </div>
  );
}