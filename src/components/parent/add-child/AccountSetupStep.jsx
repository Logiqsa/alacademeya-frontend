import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AccountSetupStep = ({ onNext, onBack, data, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass =
    'w-full h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] ' +
    'font-["IBM_Plex_Sans_Arabic"] text-[14px] focus:outline-none focus:ring-2 ' +
    'focus:ring-[#123C91] placeholder:text-[#8C9198]';

  return (
    <div dir="rtl" className="w-full p-2 space-y-4">
      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] text-[#1F2937] text-right mb-2">
          بيانات دخول الطالب
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[16px]">
          سيتم استخدام هذه البيانات لتسجيل دخول الطالب إلى المنصة.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            اسم المستخدم
          </label>
          <input
            className={inputClass}
            placeholder="ادخل اسم المستخدم"
            value={data.username || ''}
            onChange={(e) => onChange('username', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={inputClass}
              placeholder="********"
              value={data.password || ''}
              onChange={(e) => onChange('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#123C91]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] text-right text-[#1F2937] p-2">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={inputClass}
              placeholder="********"
              value={data.passwordConfirm || ''}
              onChange={(e) => onChange('passwordConfirm', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#123C91]"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#EAF4FF] border border-[#E5E5E5] p-4 rounded-xl text-center text-[#575F69] text-sm">
        سيستخدم الطالب هذه البيانات لتسجيل الدخول إلى المنصة.
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer"
        >
          التالي
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer"
        >
          السابق
        </button>
      </div>
    </div>
  );
};

export default AccountSetupStep;