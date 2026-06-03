import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg"; 
import AuthLayout from "../../components/auth/AuthLayout";

const AccountTypePage = () => {
    const navigate = useNavigate();

    const handleSelectType = (type) => {
        navigate("/register", { state: { accountType: type } });
    };

    return (
        <AuthLayout>
            <div className="flex flex-col w-full max-w-150 mx-auto p-8" dir="rtl">
                {/* Header Section */}
                <div className="mb-8">
                    <img 
                        src={logo} 
                        alt="logo" 
                        className="w-44 h-8 mb-4" 
                    />
                    <h2 className="font-bold text-[24px] leading-8 text-[#1F2937]">مرحباً بك...</h2>
                    <p className="mt-4 font-medium text-[14px] leading-4 text-right bg-white text-[#1F2937]/80">
                        اختر نوع الحساب
                    </p>
                </div>

                {/* Account Type Options */}
                <div className="flex flex-col gap-4 w-full">
                    {[
                        { id: "student", title: "طالب جامعي / خريج", desc: "طور مهاراتك وتابع رحلتك التعليمية." },
                        { id: "parent", title: "ولي أمر", desc: "تابع تقدم الأبناء واطلع على إنجازاتهم." },
                        { id: "teacher", title: "معلم", desc: "أنشئ المحتوى التعليمي وتابع طلابك." }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelectType(item.id)}
                            className="w-full h-20 px-6 py-4 border border-[#1F2937]/20 bg-white rounded-lg text-right hover:border-[#123C91] transition-none duration-0 flex flex-col justify-center"
                        >
                            <h3 className="font-normal text-[16px] leading-6 text-[#1F2937] mb-0">
                                {item.title}
                            </h3>
                            <p className="font-normal text-[14px] leading-4 text-[#1F2937]/50">
                                {item.desc}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Footer Link */}
                <div className="w-full flex items-center justify-center pt-4 mt-2">
                    <span className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-[#1F2937] px-1">
                        لديك حساب بالفعل؟
                    </span>
                    <button
                        onClick={() => navigate("/login")}
                        className="font-['IBM_Plex_Sans_Arabic'] inline-block border-b-2 border-[#123C91] font-medium text-[14px] leading-4 text-[#123C91] px-1"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AccountTypePage;