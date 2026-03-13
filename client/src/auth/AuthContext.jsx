import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext();

const STORAGE_TOKEN = "authToken";
const STORAGE_USER = "authUser";

function mergeUserState(baseUser, incomingUser) {
  const base = baseUser || {};
  const incoming = incomingUser || {};

  const merged = {
    ...base,
    ...incoming,
    onboarding: {
      ...(base.onboarding || {}),
      ...(incoming.onboarding || {}),
    },
  };

  if (
    (!Array.isArray(incoming.motivations) || incoming.motivations.length === 0) &&
    Array.isArray(base.motivations) &&
    base.motivations.length > 0
  ) {
    merged.motivations = base.motivations;
  }

  if (
    (!incoming.preferences ||
      (typeof incoming.preferences === "object" &&
        Object.keys(incoming.preferences).length === 0)) &&
    base.preferences
  ) {
    merged.preferences = base.preferences;
  }

  if (
    (!incoming.gamerProfile ||
      (typeof incoming.gamerProfile === "object" &&
        Object.keys(incoming.gamerProfile).length === 0)) &&
    base.gamerProfile
  ) {
    merged.gamerProfile = base.gamerProfile;
  }

  return merged;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(STORAGE_TOKEN, nextToken);
      setToken(nextToken);
    }
    if (nextUser) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setToken(null);
    setUser(null);
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    persistSession(res.token, res.user);
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res?.pending) {
      clearSession();
      if (res.user) setUser(res.user);
      return res;
    }
    persistSession(res.token, res.user);
    return res;
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_USER, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_USER);
    const storedOnboarding = storedUser
      ? JSON.parse(storedUser)?.onboarding
      : null;

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    authApi
      .me(storedToken)
      .then((res) => {
        if (res?.user) {
          const merged = mergeUserState(
            { onboarding: storedOnboarding || {} },
            res.user,
          );
          localStorage.setItem(STORAGE_USER, JSON.stringify(merged));
          setUser(merged);
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_TOKEN && event.key !== STORAGE_USER) return;

      const nextToken = localStorage.getItem(STORAGE_TOKEN);
      const nextUserRaw = localStorage.getItem(STORAGE_USER);
      const currentUserRaw = user ? JSON.stringify(user) : null;

      if (!nextToken) {
        clearSession();
        return;
      }

      if (nextToken !== token) {
        setToken(nextToken);
      }

      if (nextUserRaw !== currentUserRaw) {
        try {
          setUser(nextUserRaw ? JSON.parse(nextUserRaw) : null);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token, user]);

  const completeOnboardingStep = async (step) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        onboarding: {
          ...(prev.onboarding || {}),
          [step]: true,
        },
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(updated));
      return updated;
    });

    if (!token) return;

    const payload = {};
    if (step === "profileCompleted") payload.onboardingProfileCompleted = true;
    if (step === "questionnaireCompleted") {
      payload.onboardingQuestionnaireCompleted = true;
    }
    if (step === "clientCompleted") payload.onboardingClientCompleted = true;

    if (Object.keys(payload).length === 0) return;

    try {
      const res = await authApi.updateOnboarding(token, payload);
      if (res?.user) {
        const stored = localStorage.getItem(STORAGE_USER);
        let storedUser = null;
        try {
          storedUser = stored ? JSON.parse(stored) : null;
        } catch {
          storedUser = null;
        }

        const merged = mergeUserState(storedUser || {}, res.user);
        merged.onboarding = {
          ...(merged.onboarding || {}),
          [step]: true,
        };
        localStorage.setItem(STORAGE_USER, JSON.stringify(merged));
        setUser(merged);
      }
    } catch (err) {
      // Keep local flag if server update fails
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
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
