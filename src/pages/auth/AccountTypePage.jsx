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
            <div className="flex flex-col w-full max-w-175 mx-auto p-8" dir="rtl">
                {/* Header Section */}
                <div className="mb-8">
                    <img src={logo} alt="logo" className="style={{ width: '176px', height: '32px' }} mb-4" />
                    <h2 className="font-bold px-2 py-1 rounded"
                        style={{

                            fontSize: '24px',
                            lineHeight: '32px',
                            textAlign: 'right',
                            color: '#1F2937'
                        }}>مرحباً بك...</h2>

                    <p
                        className="  mt-4 font-medium text-[14px] leading-4 text-right bg-white tracking-normal"
                    >
                        اختر نوع الحساب
                    </p>
                </div>

                {/* Account Type Options */}
                <div className="flex flex-col gap-4 w-full max-w-150">
                    {/* زر طالب جامعي */}
                    <button
                        onClick={() => handleSelectType("student")}
                        className="w-full h-20 px-6 py-4 border border-[#1F293733] bg-white rounded-lg text-right hover:border-[#123C91] transition-none duration-0 flex flex-col justify-center"
                    >
                        <h3 className=" font-normal text-[16px] leading-6 text-[#1F2937] tracking-normal mb-2">
                            طالب جامعي / خريج
                        </h3>
                        <p className="font-normal text-[14px] leading-4 text-[#6B7280] tracking-normal">
                            طور مهاراتك وتابع رحلتك التعليمية.
                        </p>
                    </button>

                    <button
                        onClick={() => handleSelectType("parent")}
                        className="w-full h-20 px-6 py-4 border border-[#1F293733] bg-white rounded-lg text-right hover:border-[#123C91] transition-none duration-0 flex flex-col justify-center"
                    >
                        <h3 className=" font-normal text-[16px] leading-6 text-[#1F2937] tracking-normal mb-2">
                            ولي أمر
                        </h3>
                        <p className="font-normal text-[14px] leading-4 text-[#6B7280] tracking-normal">
                            تابع تقدم الأبناء واطلع على إنجازاتهم.
                        </p>
                    </button>

                    <button
                        onClick={() => handleSelectType("teacher")}
                        className="w-full h-20 px-6 py-4 border border-[#1F293733] bg-white rounded-lg text-right hover:border-[#123C91] transition-none duration-0 flex flex-col justify-center"
                    >
                        <h3 className=" font-normal text-[16px] leading-6 text-[#1F2937] tracking-normal mb-2">
                            معلم
                        </h3>
                        <p className="font-normal text-[14px] leading-4 text-[#6B7280] tracking-normal">
                            أنشئ المحتوى التعليمي وتابع طلابك.
                        </p>
                    </button>
                </div>

                <div className="w-full flex items-center justify-center pt-4 mt-2 ">
                    <span
                        className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-right text-[#1F2937] px-1"
                    >
                        ليس لديك حساب؟
                    </span>
                    <a
                        href="#"
                        className="font-['IBM_Plex_Sans_Arabic'] inline-block border-b-2 border-[#123C91] font-medium text-[14px] leading-4 text-right text-primary px-1"
                    >
                        إنشاء حساب
                    </a>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AccountTypePage;