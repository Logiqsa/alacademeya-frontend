import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import logo from "../../assets/icons/logo.svg";

const RegisterForm = ({ type }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="w-full max-w-175 mx-auto p-6" dir="rtl">
            <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
            <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">مرحباً بك...</h2>

            <form className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">الاسم الكامل</label>
                    <input type="text" placeholder="ادخل اسمك الكامل" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                </div>

                {type !== 'teacher' && (
                    <div>
                        <label className="block text-[14px] font-medium leading-4 mb-2 text-right bg-white">اختر نوع الحساب</label>
                        <div className="relative">
                            <select defaultValue={type} className="w-full h-12 p-3 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] appearance-none">
                                <option value="student">طالب جامعي / خريج</option>
                                <option value="parent">ولي أمر</option>
                            </select>
                            <ChevronDown className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">اسم المستخدم</label>
                    <input type="text" placeholder="ادخل اسم المستخدم" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">البريد الإلكتروني</label>
                        <input type="email" placeholder="example@email.com" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">رقم الهاتف</label>
                        <div className="flex w-full h-12 rounded-lg overflow-hidden border border-[#1F293733] bg-[#F9FAFA] focus-within:border-[#123C91]">
                            <div className="w-16 shrink-0 flex items-center justify-center bg-[#D1D5DB] text-white font-medium text-sm border-l border-[#1F293733]">
                                +20
                            </div>
                            <input type="tel" placeholder="رقم الهاتف" className="flex-1 h-full px-4 bg-transparent outline-none text-right placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">كلمة المرور</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="********" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="********" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="w-full h-14 px-6 rounded-lg bg-[#123C91] text-white flex items-center justify-center transition-colors font-medium text-[16px] mt-8" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    التالي
                </button>

                <div className="w-full flex items-center justify-center pt-4">
                    <span className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-[#1F2937] px-1">ليس لديك حساب؟</span>
                    <a href="#" className="font-['IBM_Plex_Sans_Arabic'] inline-block border-b-2 border-[#123C91] font-medium text-[14px] leading-4 text-primary px-1">إنشاء حساب</a>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;