import { createContext, useCallback, useState, useEffect } from "react";
import { getMyInstructorProfile, getMyProfile, login as loginApi } from "../services/APIService";
import { getDatabaseUserFromAccountState } from "../utils/accountState";
import { AUTH_EXPIRED_EVENT } from "../services/apiError";
import { canHaveInstructorProfile } from "../utils/roles";

// eslint-disable-next-line react-refresh/only-export-components
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

const withoutStoredAccountState = (storedUser) => {
  if (!storedUser || typeof storedUser !== "object") return storedUser;
  const ordinaryData = { ...storedUser };
  [
    "status",
    "registrationStatus",
    "registration_status",
    "profileStatus",
    "isActive",
    "profileCompleted",
    "isProfileComplete",
  ].forEach((field) => delete ordinaryData[field]);
  return ordinaryData;
};

const userDataForStorage = (source) => {
  if (!source || typeof source !== "object") return null;
  const allowedFields = [
    "id",
    "_id",
    "userId",
    "profileId",
    "fullName",
    "name",
    "username",
    "email",
    "phone",
    "role",
    "country",
    "countryCode",
    "academicLevel",
    "studentType",
    "accountType",
    "instructorId",
    "instructorStatus",
    "instructorProfileSlug",
    "timezone",
  ];

  return Object.fromEntries(
    allowedFields
      .filter((field) => source[field] !== undefined && source[field] !== null)
      .map((field) => [field, source[field]]),
  );
};

const persistUser = (source) => {
  const storedUser = userDataForStorage(source);
  if (storedUser) localStorage.setItem("user", JSON.stringify(storedUser));
  else localStorage.removeItem("user");
};

const withInstructorCapability = (user) => {
  const capability = user?.capabilities;
  if (!capability?.hasInstructorProfile) return user;
  return {
    ...user,
    accountType: "instructor",
    instructorStatus: capability.instructorStatus,
    instructorProfileSlug: capability.instructorProfileSlug || "",
  };
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return restoreUser();
    } catch {
      return null;
    }
  });
  const [checkingAccountState, setCheckingAccountState] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setCheckingAccountState(false);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    let active = true;
    const ordinaryUser = withoutStoredAccountState(restoreUser());

    getMyProfile()
      .then(async (response) => {
        if (!active) return;
        const databaseUser = getDatabaseUserFromAccountState(response);
        let freshUser = withInstructorCapability({ ...ordinaryUser, ...databaseUser });
        if (
          canHaveInstructorProfile(freshUser) &&
          freshUser.capabilities?.hasInstructorProfile === undefined
        ) {
          try {
            const instructorResponse = await getMyInstructorProfile();
            const instructorPayload =
              instructorResponse.data?.data || instructorResponse.data;
            const instructor =
              instructorPayload?.instructor ||
              instructorPayload?.profile ||
              instructorPayload;
            freshUser = {
              ...freshUser,
              accountType: "instructor",
              instructorId: instructor?._id || instructor?.id,
              instructorStatus: instructor?.status,
              instructorProfileSlug: instructor?.profileSlug || "",
            };
          } catch {
            // A normal teacher/user account may not have a marketplace profile.
          }
        }
        if (!active) return;
        setUser(freshUser);
        persistUser(freshUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        // Never keep an old activation decision when the backend check fails.
        setUser(ordinaryUser);
        persistUser(ordinaryUser);
      })
      .finally(() => {
        if (active) setCheckingAccountState(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const establishSession = useCallback((token, sessionUser) => {
    const tokenRole = roleFromToken(token);
    const finalUser =
      sessionUser && typeof sessionUser === "object"
        ? { ...sessionUser, role: sessionUser.role || tokenRole }
        : sessionUser;

    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    persistUser(finalUser);
    setUser(finalUser || null);

    return finalUser;
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const responseUser = res.data.data;
    const token = res.data.token;
    let finalUser = establishSession(token, responseUser);

    if (canHaveInstructorProfile(finalUser)) {
      try {
        const instructorResponse = await getMyInstructorProfile();
        const instructorPayload =
          instructorResponse.data?.data || instructorResponse.data;
        const instructor =
          instructorPayload?.instructor ||
          instructorPayload?.profile ||
          instructorPayload;
        finalUser = {
          ...finalUser,
          accountType: "instructor",
          instructorId: instructor?._id || instructor?.id,
          instructorStatus: instructor?.status,
          instructorProfileSlug: instructor?.profileSlug || "",
        };
        persistUser(finalUser);
        setUser(finalUser);
      } catch {
        // A normal teacher/user account may not have a marketplace profile.
      }
    }

    return { user: finalUser, token };
  };

  const updateUser = useCallback((updatedUser) => {
    setUser((currentUser) => {
      const nextUser =
        typeof updatedUser === "function"
          ? updatedUser(currentUser)
          : updatedUser;
      persistUser(nextUser);
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUser, establishSession, checkingAccountState }}>
      {children}
    </AuthContext.Provider>
  );
};
