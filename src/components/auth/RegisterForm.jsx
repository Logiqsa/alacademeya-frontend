import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import { Link } from "react-router-dom";

const RegisterForm = ({ type }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    const [emailValue, setEmailValue] = useState("");
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        let interval;
        if (showOtpModal && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    const handleNext = (e) => {
        e.preventDefault();
        setTimer(60);
        setShowOtpModal(true);
    };

    return (
        <div className="relative w-full max-w-175 mx-auto p-6" dir="rtl">
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        className="bg-white p-10 md:p-10  flex-col items-center justify-center shadow-[0px_20px_60px_0px_#1F29371F] overflow-y-auto"
                        style={{
                            width: '100%',
                            maxWidth: '720px', 
                            height: 'auto',   
                            minHeight: '456px',
                            borderRadius: '24px',
                            opacity: '1',
                            gap: '20px'     
                        }}
                    >
                        <p className="font-normal text-[18px] md:text-[20px] leading-8 text-center text-[#1F2937] p-2">
                            لإكمال عملية التسجيل، نرجو إدخال رمز التفعيل المرسل إلى البريد الإلكتروني:
                        </p>

                        <p className="font-medium text-[20px] md:text-[22px] leading-8 text-center text-[#123C91] p-2 mb-2">
                            {emailValue}
                        </p>

                        <div className="flex justify-center gap-2 mb-4">
                            {[...Array(6)].map((_, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    className="w-11.25 h-11.25 md:w-14 md:h-14 rounded-lg border border-[#1F293733] bg-[#F9FAFA] text-center text-xl outline-none focus:border-[#123C91] transition-colors"
                                />
                            ))}
                        </div>

                        <p className="font-normal text-[14px] md:text-[16px] leading-6 text-center text-[#1F293780] p-2">
                            إذا لم يصلك رمز التحقق بعد، نرجو منك الانتظار حتى انتهاء المهلة المتبقية:
                        </p>

                        <div className="mb-2">
                            {timer > 0 ? (
                                <p className="font-['Tajawal'] font-bold text-[20px] md:text-[24px] text-center text-[#123C91] p-2">
                                    {timer} ثانية
                                </p>
                            ) : (
                                <button
                                    onClick={() => { setTimer(60); }}
                                    className="font-['Tajawal'] font-bold text-[20px] md:text-[24px] text-center text-[#123C91] p-2 underline cursor-pointer w-full"
                                >
                                    إعادة إرسال الكود
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="w-full md:w-77 h-14 px-6 rounded-lg border border-[#1F293733] bg-white text-[#123C91] font-medium text-[16px] flex items-center justify-center"
                            >
                                إلغاء
                            </button>
                            <button
                                className="w-full md:w-77 h-14 px-4 rounded-lg bg-[#123C91] text-white font-medium text-[16px] flex items-center justify-center"
                            >
                                تحقق
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
            <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">مرحباً بك...</h2>

            <form className="space-y-3" onSubmit={handleNext}>
                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">الاسم الكامل</label>
                    <input type="text" placeholder="ادخل اسمك الكامل" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:text-[#1F293780]" required />
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
                    <input type="text" placeholder="ادخل اسم المستخدم" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:text-[#1F293780]" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">البريد الإلكتروني</label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:text-[#1F293780]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">رقم الهاتف</label>
                        <div className="flex w-full h-12 rounded-lg overflow-hidden border border-[#1F293733] bg-[#F9FAFA] focus-within:border-[#123C91]">
                            <div className="w-16 shrink-0 flex items-center justify-center bg-[#D1D5DB] text-white font-medium text-sm border-l border-[#1F293733]">
                                +20
                            </div>
                            <input type="tel" placeholder="رقم الهاتف" className="flex-1 h-full px-4 bg-transparent outline-none text-right placeholder:text-[#1F293780]" required />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">كلمة المرور</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="********" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:text-[#1F293780]" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} placeholder="********" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:text-[#1F293780]" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="w-full h-14 px-6 rounded-lg bg-[#123C91] text-white flex items-center justify-center transition-colors font-medium text-[16px] mt-8" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    التالي
                </button>

                <div className="w-full flex items-center justify-center pt-4">
                    <span className="font-normal text-[14px] leading-4 text-[#1F2937] px-1">لديك حساب؟</span>
                    <Link to="/login" className="inline-block border-b-2 border-[#123C91] font-medium text-[14px] leading-4 text-primary px-1">تسجيل دخول</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;