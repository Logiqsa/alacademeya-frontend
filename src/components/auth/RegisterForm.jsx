import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 1. استيراد useNavigate
import logo from "../../assets/icons/logo.svg";

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // 2. تعريف التنقل

    const handleLogoClick = () => {
        console.log("Navigating to Landing...");
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center" dir="rtl">
            {/* Header Section */}
            <div className="w-full max-w-[600px] flex flex-col items-start mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <img
                        src={logo}
                        alt="logo"
                        onClick={handleLogoClick}
                        className="cursor-pointer"
                        style={{ width: '176px', height: '32px' }}
                    />
                </div>
                <h2
                    className="font-bold px-2 py-1 rounded"
                    style={{
                        fontFamily: 'Tajawal, sans-serif',
                        fontSize: '24px',
                        lineHeight: '32px',
                        textAlign: 'right',
                        color: '#1F2937'
                    }}
                >
                    مرحباً بك...
                </h2>
            </div>

            {/* Form */}
            <form className="w-full max-w-[600px] space-y-6">
                {/* الحقول (كما هي...) */}
                <div className="w-full">
                    <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-4">
                        اسم المستخدم أو رقم الهاتف
                    </label>
                    <input
                        type="text"
                        placeholder="أدخل رقم الهاتف أو اسم المستخدم"
                        className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]"
                    />
                </div>

                <div className="w-full">
                    <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-2">
                        كلمة المرور
                    </label>
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] placeholder:font-['IBM_Plex_Sans_Arabic'] placeholder:font-normal placeholder:text-[14px] placeholder:leading-4 placeholder:text-[#1F293780]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="w-full flex items-center justify-center pt-4">
                    <span className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-right text-[#1F2937] px-1">
                        ليس لديك حساب؟
                    </span>
                    {/* 3. تعديل الرابط ليوجه لصفحة اختيار نوع الحساب */}
                    <button
                        type="button"
                        onClick={() => navigate("/select-account-type")}
                        className="font-['IBM_Plex_Sans_Arabic'] inline-block border-b-2 border-[#123C91] font-medium text-[14px] leading-4 text-right text-[#123C91] px-1 hover:opacity-80"
                    >
                        إنشاء حساب
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;