import { createContext, useState, type ReactNode, useEffect } from 'react';

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
      setLoginIdState(localStorage.getItem('loginId'));
    }
  }, []);

  const setLoginId = (id: string) => {
    setLoginIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginId', id);
    }
  };

  const logout = () => {
    setLoginIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loginId');
    }
  };

  return (
    <AuthContext.Provider value={{ loginId, setLoginId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
