import { createContext, useEffect, useState } from "react";
import { login as loginRequest } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("novatech_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  async function login(email, password) {
    const authenticatedUser = await loginRequest(email, password);

    localStorage.setItem(
      "novatech_user",
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);

    return authenticatedUser;
  }

  function logout() {
    localStorage.removeItem("novatech_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}