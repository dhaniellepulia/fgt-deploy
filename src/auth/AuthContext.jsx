// import { createContext, useContext, useState } from "react";
// import * as authApi from "../api/auth.mock";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   const login = async (credentials) => {
//     const res = await authApi.login(credentials);
//     setUser(res.user);

//     // persist mock session
//     localStorage.setItem("mockUser", JSON.stringify(res.user));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("mockUser");
//   };

//   // restore session on refresh
//   if (!user) {
//     const stored = localStorage.getItem("mockUser");
//     if (stored) setUser(JSON.parse(stored));
//   }

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/auth.mock";

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    localStorage.setItem("mockUser", JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mockUser");
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("mockUser", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("mockUser");

    if (stored) {
      setUser(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  // for onboarding step completion
  const completeOnboardingStep = (step) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        onboarding: {
          ...prev.onboarding,
          [step]: true,
        },
      };
      localStorage.setItem("mockUser", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        completeOnboardingStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
