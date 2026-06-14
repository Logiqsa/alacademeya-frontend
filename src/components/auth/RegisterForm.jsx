import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { register, verifyAccount } from "../../services/authService";

const RegisterForm = ({ type }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        passwordConfirm: "",
        role: type || "student"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const onlyNumbers = value.replace(/\D/g, "");
            setFormData({
                ...formData,
                [name]: onlyNumbers,
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error("يرجى إدخال الاسم الكامل");
            return false;
        }

        if (formData.fullName.trim().length < 3) {
            toast.error("الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل");
            return false;
        }

        if (!formData.username.trim()) {
            toast.error("يرجى إدخال اسم المستخدم");
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            toast.error("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط");
            return false;
        }

        if (!formData.email.trim()) {
            toast.error("يرجى إدخال البريد الإلكتروني");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            toast.error("يرجى إدخال بريد إلكتروني صحيح");
            return false;
        }

        if (!formData.phone.trim()) {
            toast.error("يرجى إدخال رقم الهاتف");
            return false;
        }

        const phoneRegex = /^1[0125][0-9]{8}$/;

        if (!phoneRegex.test(formData.phone)) {
            toast.error("يرجى إدخال رقم هاتف مصري صحيح");
            return false;
        }

        if (!formData.password) {
            toast.error("يرجى إدخال كلمة المرور");
            return false;
        }

        if (formData.password.length < 8) {
            toast.error("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل");
            return false;
        }

        if (!/(?=.*[a-z])/.test(formData.password)) {
            toast.error("كلمة المرور يجب أن تحتوي على حرف صغير");
            return false;
        }

        if (!/(?=.*[A-Z])/.test(formData.password)) {
            toast.error("كلمة المرور يجب أن تحتوي على حرف كبير");
            return false;
        }

        if (!/(?=.*\d)/.test(formData.password)) {
            toast.error("كلمة المرور يجب أن تحتوي على رقم");
            return false;
        }

        if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
            toast.error("كلمة المرور يجب أن تحتوي على رمز خاص");
            return false;
        }

        if (formData.password !== formData.passwordConfirm) {
            toast.error("كلمتا المرور غير متطابقتين");
            return false;
        }

        return true;
    };

    useEffect(() => {
        let interval;
        if (showOtpModal && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    const handleNext = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await register(formData);

            toast.success(
                "تم إنشاء الحساب بنجاح، تحقق من بريدك الإلكتروني لإدخال رمز التفعيل"
            );

            setShowOtpModal(true);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "حدثت مشكلة أثناء التسجيل";

            if (errorMessage === "USER_ALREADY_EXISTS") {
                toast.error(
                    "هذا البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل"
                );
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };



    const handleVerify = async () => {
        const otpCode = otp.join("").trim();

        if (otpCode.length !== 6) {
            toast.error("يرجى إدخال رمز التفعيل كاملاً");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email: formData.email.trim(),
                code: otpCode,
            };

            await verifyAccount(payload);

            toast.success("تم تفعيل الحساب بنجاح!");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (err) {
            const serverError =
                err.response?.data?.message || "الكود غير صحيح";

            toast.error(serverError);
        } finally {
            setLoading(false);
        }
    };
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        let newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    return (
        <div className="relative w-full max-w-175 mx-auto p-6" >
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        dir="ltr"
                        className="bg-white p-10 md:p-10 flex flex-col items-center justify-center shadow-[0px_20px_60px_0px_#1F29371F] overflow-y-auto"
                        style={{
                            width: '100%',
                            maxWidth: '720px',
                            height: 'auto',
                            minHeight: '30px',
                            borderRadius: '24px',
                            opacity: '1',
                            gap: '20px'
                        }}
                    >
                        <p className="font-normal text-[18px] md:text-[20px] leading-8 text-center text-[#1F2937] p-2">
                            لإكمال عملية التسجيل، نرجو إدخال رمز التفعيل المرسل إلى البريد الإلكتروني:
                        </p>
                        <p className="font-medium text-[20px] md:text-[22px] leading-8 text-center text-[#123C91] p-2 mb-2">
                            {formData.email}
                        </p>

                        <div className="flex justify-center gap-2 mb-4">
                            {otp.map((data, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength="1"
                                    value={data}
                                    onChange={(e) => handleOtpChange(e.target, i)}
                                    className="w-12 h-14 md:w-14 md:h-14 rounded-lg border border-[#1F293733] bg-[#F9FAFA] text-center text-xl outline-none focus:border-[#123C91] transition-colors"
                                />
                            ))}
                        </div>

                        <div className="mb-4">
                            {timer > 0 ? (
                                <p className="font-bold text-[20px] text-center text-[#123C91]">{timer} ثانية</p>
                            ) : (
                                <button onClick={() => setTimer(60)} className="text-[#123C91] underline w-full">إعادة إرسال الكود</button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                            <button onClick={() => setShowOtpModal(false)} className="w-full md:w-77 h-14 rounded-lg border border-[#1F293733] bg-white text-[#123C91]">إلغاء</button>
                            <button onClick={handleVerify} disabled={loading} className="w-full md:w-77 h-14 rounded-lg bg-[#123C91] text-white">{loading ? "جاري التحقق..." : "تحقق"}</button>
                        </div>
                    </div>
                </div>
            )}

            <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
            <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">مرحباً بك...</h2>

            <form className="space-y-3" onSubmit={handleNext}>
                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">الاسم الكامل</label>
                    <input name="fullName" placeholder="ادخل اسمك الكامل" onChange={handleChange} value={formData.fullName} type="text" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]" required />
                </div>

                {type !== 'teacher' && (
                    <div>
                        <label className="block text-[14px] font-medium leading-4 mb-2 text-right bg-white">اختر نوع الحساب</label>
                        <div className="relative">
                            <select name="role" onChange={handleChange} value={formData.role} className="w-full h-12 p-3 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] appearance-none">
                                <option value="student">طالب جامعي / خريج</option>
                                <option value="parent">ولي أمر</option>
                            </select>
                            <ChevronDown className="absolute left-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-[14px] font-medium mb-2 text-right">اسم المستخدم</label>
                    <input
                        name="username"
                        onChange={handleChange}
                        value={formData.username}
                        type="text"
                        maxLength={30}
                        placeholder="ادخل اسم المستخدم"
                        className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[14px] font-medium mb-2 text-right">البريد الإلكتروني</label>
                        <input name="email" onChange={handleChange} placeholder="ادخل البريد الإلكتروني" value={formData.email} type="email" className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]" required />
                    </div>
                    <div>
                        <label className="block text-[14px] font-medium mb-2 text-right">
                            رقم الهاتف
                        </label>

                        <div
                            dir="ltr"
                            className="flex w-full h-12 rounded-lg overflow-hidden border border-[#1F293733] bg-[#F9FAFA] focus-within:border-[#123C91]"
                        >
                            <div className="w-16 shrink-0 flex items-center justify-center bg-[#E5E7EB] text-[#9CA3AF] font-medium text-sm border-r border-[#1F293733]">
                                +20
                            </div>

                            <input
                                name="phone"
                                onChange={handleChange}
                                value={formData.phone}
                                type="tel"
                                maxLength={11}
                                inputMode="numeric"
                                placeholder="رقم الهاتف"
                                className="flex-1 h-full px-4 bg-transparent outline-none text-left placeholder:text-[#9CA3AF]"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">كلمة المرور</label>
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            onChange={handleChange}
                            value={formData.password}
                            minLength={8}
                            className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]"
                            required
                        />

                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-[#1F2937]">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input name="passwordConfirm" onChange={handleChange} placeholder="********" value={formData.passwordConfirm} type={showConfirmPassword ? "text" : "password"} className="w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91]" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 top-3 text-gray-400">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full h-14 px-6 rounded-lg bg-[#123C91] text-white flex items-center justify-center transition-colors font-medium text-[16px] mt-4" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {loading ? "جاري الإرسال..." : "التالي"}
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