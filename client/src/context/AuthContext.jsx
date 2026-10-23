import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setRole(res.data.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (identifier, password) => {
    try {
      const res = await authService.studentLogin({ identifier, password });
      if (res.success) {
        setUser(res.data.user);
        setRole('student');
        toast.success(`Welcome back, ${res.data.user.full_name || 'Student'}!`);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.userMessage || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const registerStudent = async (studentData) => {
    try {
      const res = await authService.studentRegister(studentData);
      if (res.success) {
        setUser(res.data.user);
        setRole('student');
        toast.success('Registration successful! Welcome to Campus Placement Portal.');
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.userMessage || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await authService.adminLogin({ email, password });
      if (res.success) {
        setUser(res.data.user);
        setRole('admin');
        toast.success(`Welcome, Placement Officer!`);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.userMessage || 'Admin login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout network errors
    } finally {
      setUser(null);
      setRole(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    isStudent: role === 'student',
    isAdmin: role === 'admin',
    loginStudent,
    registerStudent,
    loginAdmin,
    logout,
    checkAuth,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
