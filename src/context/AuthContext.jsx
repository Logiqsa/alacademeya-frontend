import { createContext, useState, useEffect } from "react";
import { login as loginApi } from "../services/authService";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("خطأ في قراءة بيانات المستخدم:", error);
                localStorage.removeItem("user");
                setUser(null);
            }
        }
    }, []);

    const login = async (credentials) => {
        const res = await loginApi(credentials);
        console.log("الرد من الـ API:", res.data);

        const finalUser = res.data.data;
        const token = res.data.token;

        console.log("البيانات التي سيتم حفظها:", finalUser);

        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(finalUser));

        if (token) {
            localStorage.setItem("token", token);
        }

        // نرجّع الداتا عشان LoginForm يقدر يحدد الـ role ويوجّه صحيح
        return { user: finalUser, token };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};