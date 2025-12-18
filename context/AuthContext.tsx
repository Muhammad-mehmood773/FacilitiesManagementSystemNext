import { createContext, useState, type ReactNode, useEffect } from 'react';
import { getCookieValue, serializeCookie } from '../utils/cookies';

export type AuthContextType = {
  loginId: string | null;
  setLoginId: (id: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loginId, setLoginIdState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoginIdState(getCookieValue(document.cookie, 'loginId'));
    }
  }, []);

  const setLoginId = (id: string) => {
    setLoginIdState(id);
    if (typeof window !== 'undefined') {
      document.cookie = serializeCookie('loginId', id, { maxAge: 60 * 60 * 24 * 7, path: '/' });
    }
  };

  const logout = () => {
    setLoginIdState(null);
    if (typeof window !== 'undefined') {
      document.cookie = serializeCookie('loginId', '', { maxAge: 0, path: '/' });
    }
  };

  return (
    <AuthContext.Provider value={{ loginId, setLoginId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
