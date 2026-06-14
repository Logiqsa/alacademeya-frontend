import React, { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(credentials);
            toast.success("تم تسجيل الدخول بنجاح!"); 
            navigate("/parent-dashboard");
        } catch (error) {
            const message = error.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً.";
            toast.error(message); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center" dir="rtl">
            <div className="w-full max-w-150 flex flex-col items-start mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <img src={logo} alt="logo" className="cursor-pointer" style={{ width: '176px', height: '32px' }} />
                </div>
                <h2 className="font-bold px-2 py-1 rounded" style={{ fontFamily: 'Tajawal, sans-serif', fontSize: '24px', lineHeight: '32px', textAlign: 'right', color: '#1F2937' }}>
                    مرحباً بك...
                </h2>
            </div>

            <form className="w-full max-w-150 space-y-6" onSubmit={handleSubmit}>
                <div className="w-full">
                    <label className="block text-[14px] font-medium leading-4 text-right bg-white mb-4">
                        البريد الإلكتروني
                    </label>
                    <input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]"
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
                            required
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]"
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

                <div className="flex items-center justify-between w-full text-base">
                    <label className="flex items-center gap-2" style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif', fontSize: '14px', color: '#1F2937' }}>
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                        تذكرني
                    </label>
                    <Link to="/forgot-password" className="font-medium inline-block border-b-2 border-[#123C91] text-primary" style={{ fontSize: '14px' }}>
                        نسيت كلمة المرور
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 px-6 rounded-lg bg-[#123C91] text-white flex items-center justify-center transition-colors font-medium text-[16px]"
                    style={{ fontFamily: 'Tajawal, sans-serif' }}
                >
                    تسجيل الدخول
                </button>

                <div className="w-full flex items-center justify-center pt-4">
                    <span className="font-normal text-[14px] text-[#1F2937] px-1">ليس لديك حساب؟</span>
                    <Link to="/select-account-type" className="inline-block border-b-2 border-[#123C91] font-medium text-[14px] text-primary px-1">
                        إنشاء حساب
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;