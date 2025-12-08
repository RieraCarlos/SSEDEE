import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import users from './usuario-dev.json';

// Define la estructura de un usuario
export interface User {
  nombre_jugador: string;
  numero_camisa: string;
  link_imagen: string;
  posicion_de_juego: string;
  email: string;
  role: string;
}

// Define la estructura del contexto de autenticación
interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

// Crea el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación que envuelve la aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    const userFound = users.find((u) => u.email === email);
    if (userFound) setUser(userFound);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
