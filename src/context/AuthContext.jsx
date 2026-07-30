import { createContext, useState, useEffect } from "react";
import { login as loginApi } from "../services/APIService";

export const AuthContext = createContext();

const roleFromToken = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const claims = JSON.parse(atob(normalized));
    return claims.role || claims.user?.role || null;
  } catch {
    return null;
  }
};

const restoreUser = () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;
  const parsedUser = JSON.parse(savedUser);
  const role =
    parsedUser.role || roleFromToken(localStorage.getItem("token"));
  return role ? { ...parsedUser, role } : parsedUser;
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return restoreUser();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = restoreUser();
        setUser(parsedUser);
        localStorage.setItem("user", JSON.stringify(parsedUser));
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

    const responseUser = res.data.data;
    const token = res.data.token;
    const tokenRole = roleFromToken(token);
    const finalUser =
      responseUser && typeof responseUser === "object"
        ? {
            ...responseUser,
            role: responseUser.role || tokenRole,
          }
        : responseUser;

    console.log("البيانات التي سيتم حفظها:", finalUser);

    setUser(finalUser);
    localStorage.setItem("user", JSON.stringify(finalUser));

    if (token) {
      localStorage.setItem("token", token);
    }

    return { user: finalUser, token };
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
