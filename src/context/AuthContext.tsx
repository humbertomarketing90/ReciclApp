import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ExtendedUserRecord } from '../types';
import { useToast } from './ToastContext';
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from '../utils/storage';

interface AuthContextType {
  user: UserProfile | null;
  currentUserRecord: ExtendedUserRecord | null;
  authLoading: boolean;
  authError: string | null;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  activeScreen: 'welcome' | 'login' | 'register' | 'forgot-password' | 'complete-profile';
  setActiveScreen: (screen: 'welcome' | 'login' | 'register' | 'forgot-password' | 'complete-profile') => void;
  registerUser: (data: Partial<ExtendedUserRecord> & { passwordConfirm?: string }) => Promise<boolean>;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  completeUserProfile: (data: {
    profileImageUrl: string;
    mainAddress: string;
    city: string;
    district: string;
    recyclingPreferences: {
      plastic: boolean;
      paper: boolean;
      glass: boolean;
      metal: boolean;
      organic: boolean;
      electronic: boolean;
    };
    notificationPrefs: {
      pickups: boolean;
      reports: boolean;
      rewards: boolean;
      marketplace: boolean;
    };
    locationGranted: boolean;
    notificationsGranted: boolean;
  }) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'apple') => Promise<void>;
  simulateRoleSwitch: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  virtualUsersDb: ExtendedUserRecord[];
  setVirtualUsersDb: React.Dispatch<React.SetStateAction<ExtendedUserRecord[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Initial Virtual Users DB for simulation and testing
const INITIAL_DEMO_USERS: ExtendedUserRecord[] = [
  {
    uid: "USR-0091",
    fullName: "Humberto Mendoza",
    email: "humbertomarketing90@gmail.com",
    phone: "+51987654321",
    role: "regular",
    city: "Lima",
    district: "Surco",
    profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    points: 0,
    ecoLevel: 1,
    xp: 0,
    status: "active",
    createdAt: new Date('2026-06-15T12:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-15T12:00:00Z').toISOString(),
    lastLoginAt: new Date().toISOString(),
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    isProfileComplete: true,
    isPremium: false,
    premiumStartDate: null,
    premiumEndDate: null,
    premiumStatus: "inactive",
    password: "User12345!",
    recyclingPreferences: { plastic: true, paper: true, glass: true, metal: true, organic: false, electronic: false },
    notificationPreferences: { pickups: true, reports: true, rewards: true, marketplace: true },
    mainAddress: { label: "Casa", address: "Av. Las Lomas 320", city: "Lima", district: "Surco", latitude: -12.112, longitude: -77.029 }
  },
  {
    uid: "COLL-02",
    fullName: "Juan Pérez",
    email: "collector@email.com",
    phone: "+51999999999",
    role: "collector",
    city: "Lima",
    district: "Miraflores",
    profileImageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
    points: 0,
    ecoLevel: 1,
    xp: 0,
    status: "active",
    createdAt: new Date('2026-06-15T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    isProfileComplete: true,
    isPremium: false,
    premiumStartDate: null,
    premiumEndDate: null,
    premiumStatus: "inactive",
    password: "Collector12345!"
  },
  {
    uid: "ADM-03",
    fullName: "Ana Sofía Mendoza",
    email: "admin@email.com",
    phone: "+51900000000",
    role: "admin",
    city: "Lima",
    district: "San Borja",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    points: 0,
    ecoLevel: 1,
    xp: 0,
    status: "active",
    createdAt: new Date('2026-06-15T08:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    isProfileComplete: true,
    isPremium: false,
    premiumStartDate: null,
    premiumEndDate: null,
    premiumStatus: "inactive",
    password: "Admin12345!"
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  
  // Virtual user collections stored in localStorage for full persistence
  const [virtualUsersDb, setVirtualUsersDb] = useState<ExtendedUserRecord[]>(() => {
    return loadFromStorage<ExtendedUserRecord[]>(STORAGE_KEYS.VIRTUAL_USERS_DB, INITIAL_DEMO_USERS);
  });

  const [currentUserRecord, setCurrentUserRecord] = useState<ExtendedUserRecord | null>(() => {
    return loadFromStorage<ExtendedUserRecord | null>(STORAGE_KEYS.CURRENT_USER_RECORD, null);
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<'welcome' | 'login' | 'register' | 'forgot-password' | 'complete-profile'>('welcome');

  useEffect(() => {
    saveToStorage<ExtendedUserRecord[]>(STORAGE_KEYS.VIRTUAL_USERS_DB, virtualUsersDb);
  }, [virtualUsersDb]);

  useEffect(() => {
    if (currentUserRecord) {
      saveToStorage<ExtendedUserRecord>(STORAGE_KEYS.CURRENT_USER_RECORD, currentUserRecord);
    } else {
      removeFromStorage(STORAGE_KEYS.CURRENT_USER_RECORD);
    }
  }, [currentUserRecord]);

  function calculatePremiumDaysRemaining(endDateStr: string | null): number {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Derived user value formatted to match standard app UserProfile model
  const user: UserProfile | null = (() => {
    if (!currentUserRecord) return null;
    
    // Check dynamic expiration
    let isPrem = currentUserRecord.isPremium;
    let startDate = currentUserRecord.premiumStartDate || null;
    let endDate = currentUserRecord.premiumEndDate || null;
    let status = currentUserRecord.premiumStatus || "inactive";
    let daysRemaining = 0;

    if (isPrem) {
      if (endDate) {
        daysRemaining = calculatePremiumDaysRemaining(endDate);
        if (daysRemaining <= 0) {
          isPrem = false;
          status = "expired";
          daysRemaining = 0;
          
          // Auto-update db / record in place
          setTimeout(() => {
            setCurrentUserRecord(prev => prev ? { ...prev, isPremium: false, premiumStatus: "expired" } : null);
            setVirtualUsersDb(prev => prev.map(u => u.uid === currentUserRecord.uid ? { ...u, isPremium: false, premiumStatus: "expired" } : u));
          }, 0);
        } else {
          status = "active";
        }
      } else {
        // Fallback for user who had isPremium = true but no dates
        status = "active";
        daysRemaining = 30;
      }
    } else {
      if (status === "active") {
        status = "inactive";
      }
    }

    return {
      id: currentUserRecord.uid,
      name: currentUserRecord.fullName.split(' ')[0],
      email: currentUserRecord.email,
      avatar: currentUserRecord.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUserRecord.fullName)}`,
      points: currentUserRecord.points,
      level: currentUserRecord.ecoLevel,
      xp: currentUserRecord.xp,
      isPremium: isPrem,
      role: currentUserRecord.role,
      joinedDate: new Date(currentUserRecord.createdAt).toLocaleDateString(),
      premiumStartDate: startDate,
      premiumEndDate: endDate,
      premiumDaysRemaining: daysRemaining,
      premiumStatus: status
    };
  })();

  const isLoggedIn = currentUserRecord !== null && currentUserRecord.status === 'active';
  const isProfileComplete = currentUserRecord ? currentUserRecord.isProfileComplete : false;

  const registerUser = async (data: Partial<ExtendedUserRecord> & { password?: string }) => {
    setAuthLoading(true);
    setAuthError(null);
    
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate networking
    
    // Check if user already exists
    const exists = virtualUsersDb.some(u => u.email.toLowerCase() === data.email?.toLowerCase());
    if (exists) {
      setAuthError('El correo electrónico ya se encuentra registrado.');
      setAuthLoading(false);
      addToast('Este correo ya está registrado en la base de datos.', 'error');
      return false;
    }

    const newUid = `USR-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newRecord: ExtendedUserRecord = {
      uid: newUid,
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'regular',
      city: data.city || '',
      district: data.district || '',
      profileImageUrl: data.profileImageUrl || '',
      points: 40, // Bonus initial eco-points requested!
      ecoLevel: 1,
      xp: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      acceptedTerms: data.acceptedTerms || false,
      acceptedPrivacyPolicy: data.acceptedPrivacyPolicy || false,
      isProfileComplete: false, // Redirect to profile setup first!
      isPremium: false,
      premiumStartDate: null,
      premiumEndDate: null,
      premiumStatus: 'inactive',
      password: data.password || 'Secure123!'
    };

    setVirtualUsersDb(prev => [...prev, newRecord]);
    setCurrentUserRecord(newRecord);
    setAuthLoading(false);
    
    addToast('¡Cuenta creada correctamente virtualmente! Bono de +40 Eco-puntos otorgado. 🌱', 'success');
    setActiveScreen('complete-profile');
    return true;
  };

  const loginUser = async (email: string, password?: string) => {
    setAuthLoading(true);
    setAuthError(null);

    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate checking Firebase Auth
    
    const matched = virtualUsersDb.find(
      u => u.email.toLowerCase() === email.toLowerCase() && (!password || u.password === password)
    );

    if (!matched) {
      setAuthError('Correo o contraseña incorrectos. Inténtalo nuevamente.');
      setAuthLoading(false);
      addToast('Credenciales incorrectas.', 'error');
      return false;
    }

    const updatedRecord: ExtendedUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString()
    };

    setVirtualUsersDb(prev => prev.map(u => u.uid === matched.uid ? updatedRecord : u));
    setCurrentUserRecord(updatedRecord);
    setAuthLoading(false);
    
    addToast(`¡Bienvenido de vuelta, ${matched.fullName.split(' ')[0]}!`, 'success');
    return true;
  };

  const logoutUser = async () => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setCurrentUserRecord(null);
    setAuthLoading(false);
    setActiveScreen('welcome');
    addToast('Sesión de ReciclApp finalizada con éxito.', 'info');
  };

  const resetPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const exists = virtualUsersDb.some(u => u.email.toLowerCase() === email.toLowerCase());
    setAuthLoading(false);
    
    if (exists) {
      addToast('Te hemos enviado un enlace para restablecer tu contraseña. 📧', 'success', 5000);
      return true;
    } else {
      setAuthError('No encontramos una cuenta asociada a este correo.');
      addToast('No existe ninguna cuenta vinculada a este correo.', 'error');
      return false;
    }
  };

  const completeUserProfile = async (data: any) => {
    if (!currentUserRecord) return false;
    
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updatedRecord: ExtendedUserRecord = {
      ...currentUserRecord,
      profileImageUrl: data.profileImageUrl || currentUserRecord.profileImageUrl,
      city: data.city || currentUserRecord.city,
      district: data.district || currentUserRecord.district,
      isProfileComplete: true,
      updatedAt: new Date().toISOString(),
      mainAddress: {
        label: "Casa Principal",
        address: data.mainAddress,
        city: data.city,
        district: data.district,
        latitude: -12.112 + (Math.random() - 0.5) * 0.02,
        longitude: -77.029 + (Math.random() - 0.5) * 0.02
      },
      recyclingPreferences: data.recyclingPreferences,
      notificationPreferences: data.notificationPrefs
    };

    setVirtualUsersDb(prev => prev.map(u => u.uid === currentUserRecord.uid ? updatedRecord : u));
    setCurrentUserRecord(updatedRecord);
    setAuthLoading(false);
    addToast('¡Perfil ambiental completado con éxito! Iniciando tu viaje.', 'success');
    return true;
  };

  const loginWithSocial = async (provider: 'google' | 'apple') => {
    setAuthLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Choose one of the role records based on provider or random for clean demo
    const index = provider === 'google' ? 0 : 2; // Google log in Humberto, Apple log in Ana (Admin)
    const matched = virtualUsersDb[index];
    
    const updatedRecord: ExtendedUserRecord = {
      ...matched,
      lastLoginAt: new Date().toISOString()
    };
    
    setVirtualUsersDb(prev => prev.map(u => u.uid === matched.uid ? updatedRecord : u));
    setCurrentUserRecord(updatedRecord);
    setAuthLoading(false);
    addToast(`Iniciaste sesión con ${provider === 'google' ? 'Google' : 'Apple'} correctamente.`, 'success');
  };

  // Easily toggle user roles during runtime to let users inspect views
  const simulateRoleSwitch = (role: UserRole) => {
    let matched: ExtendedUserRecord | undefined = virtualUsersDb.find(u => u.role === role);
    if (!matched) {
      const record: ExtendedUserRecord = {
        uid: role === 'admin' ? "ADM-VIRTUAL" : role === 'collector' ? "COLL-VIRTUAL" : "USR-VIRTUAL",
        fullName: role === 'admin' ? "Administrador Demo" : role === 'collector' ? "Recolector Demo" : "Usuario Demo",
        email: `${role}@reciclapp.com`,
        phone: "+51900000000",
        role: role,
        city: "Lima",
        district: "Surco",
        profileImageUrl: "",
        points: role === 'regular' ? 100 : 800,
        ecoLevel: 2,
        xp: 40,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        isProfileComplete: true,
        isPremium: role === 'admin',
        premiumStartDate: role === 'admin' ? new Date().toISOString() : null,
        premiumEndDate: role === 'admin' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        premiumStatus: role === 'admin' ? 'active' : 'inactive'
      };
      setVirtualUsersDb(prev => [...prev, record]);
      matched = record;
    }
    
    setCurrentUserRecord(matched);
    addToast(`Rol de simulación cambiado a: ${role === 'admin' ? 'Administrador' : role === 'collector' ? 'Recolector' : 'Usuario Normal'} 🔄`, 'info');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUserRecord) return false;
    
    const updatedRecord: ExtendedUserRecord = {
      ...currentUserRecord,
      fullName: updates.name !== undefined ? updates.name : currentUserRecord.fullName,
      profileImageUrl: updates.avatar !== undefined ? updates.avatar : currentUserRecord.profileImageUrl,
      points: updates.points !== undefined ? updates.points : currentUserRecord.points,
      ecoLevel: updates.level !== undefined ? updates.level : currentUserRecord.ecoLevel,
      xp: updates.xp !== undefined ? updates.xp : currentUserRecord.xp,
      isPremium: updates.isPremium !== undefined ? updates.isPremium : currentUserRecord.isPremium,
      role: updates.role !== undefined ? updates.role : currentUserRecord.role,
      premiumStartDate: updates.premiumStartDate !== undefined ? updates.premiumStartDate : currentUserRecord.premiumStartDate,
      premiumEndDate: updates.premiumEndDate !== undefined ? updates.premiumEndDate : currentUserRecord.premiumEndDate,
      premiumStatus: updates.premiumStatus !== undefined ? (updates.premiumStatus as any) : currentUserRecord.premiumStatus,
      updatedAt: new Date().toISOString()
    };
    
    setVirtualUsersDb(prev => prev.map(u => u.uid === currentUserRecord.uid ? updatedRecord : u));
    setCurrentUserRecord(updatedRecord);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentUserRecord,
      authLoading,
      authError,
      isLoggedIn,
      isProfileComplete,
      activeScreen,
      setActiveScreen,
      registerUser,
      loginUser,
      logoutUser,
      resetPassword,
      completeUserProfile,
      loginWithSocial,
      simulateRoleSwitch,
      updateUserProfile,
      virtualUsersDb,
      setVirtualUsersDb
    }}>
      {children}
    </AuthContext.Provider>
  );
}
