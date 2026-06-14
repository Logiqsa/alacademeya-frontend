import { createContext, useState } from "react";
import { login as loginApi } from "../services/authService";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (credentials) => {
        const res = await loginApi(credentials);
        setUser(res.data);
    };

    return (
        <AuthContext.Provider value={{ user, login }}>
            {children}
        </AuthContext.Provider>
    );
};