/**
 * Admin Mode Context
 * 관리자 모드 전환 상태 관리
 */
import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    // localStorage에서 초기값 로드
    const saved = localStorage.getItem('adminMode');
    return saved === 'true';
  });

  const toggleAdminMode = () => {
    setIsAdminMode(prev => {
      const newValue = !prev;
      localStorage.setItem('adminMode', String(newValue));
      return newValue;
    });
  };

  return (
    <AdminModeContext.Provider value={{ isAdminMode, toggleAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
}
