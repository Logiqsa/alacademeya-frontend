import { createContext, useState, useEffect } from "react";
import { login as loginApi } from "../services/authService";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (credentials) => {
        const res = await loginApi(credentials);
        console.log("الرد من الـ API:", res.data); 

        const userData = res.data.data;

        const finalUser = userData || res.data;

        console.log("البيانات التي سيتم حفظها:", finalUser);

        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(finalUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};