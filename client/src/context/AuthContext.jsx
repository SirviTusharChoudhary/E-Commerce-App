import { useContext, useState, createContext, useEffect } from "react";
import { axiosInstance } from "../axiosCalls/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function authentication() {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/customer/me");
        setUser(response.data.customerData || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    authentication();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);