import React, { useState, useEffect } from 'react';
import { Menu, Leaf, Crown, HelpCircle } from 'lucide-react';
import { useToast } from './context/ToastContext';
import { 
  UserProfile, 
  PickupRequest, 
  TrashReport, 
  RecyclingCenter, 
  Product, 
  EcoChallenge, 
  EcoAchievement 
} from './types';

// Importing Custom Modular Views
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PickupRequestView from './components/PickupRequest';
import MapCenters from './components/MapCenters';
import Marketplace from './components/Marketplace';
import EcoImpact from './components/EcoImpact';
import CollectorPanel from './components/CollectorPanel';
import AdminPanel from './components/AdminPanel';
import PremiumSettings from './components/PremiumSettings';
import GuidedLearnTour from './components/GuidedLearnTour';
import { useAuth } from './context/AuthContext';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './utils/storage';
import WelcomeScreen from './auth/WelcomeScreen';
import LoginScreen from './auth/LoginScreen';
import RegisterScreen from './auth/RegisterScreen';
import ForgotPasswordScreen from './auth/ForgotPasswordScreen';
import CompleteProfileScreen from './auth/CompleteProfileScreen';

// Default mock initial dataset
const INITIAL_PROFILE: UserProfile = {
  id: "USR-0091",
  name: "Humberto", // Custom matching user metadata humbertomarketing90
  email: "humbertomarketing90@gmail.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
  points: 0,
  level: 1,
  xp: 0,
  isPremium: false,
  role: 'regular',
  joinedDate: "15/06/2026",
  premiumStartDate: null,
  premiumEndDate: null,
  premiumDaysRemaining: 0,
  premiumStatus: "inactive"
};

const INITIAL_CHALLENGES: EcoChallenge[] = [
  { id: "1", title: "Asistencia EcoAsesor", description: "Clasifica 2 tipos de residuos usando el EcoAsesor IA", pointsReward: 30, targetCount: 2, currentCount: 0, isCompleted: false, icon: "⚡" },
  { id: "2", title: "Primer Despacho", description: "Agenda y completa tu primer recojo a domicilio", pointsReward: 50, targetCount: 1, currentCount: 0, isCompleted: false, icon: "🚚" },
  { id: "3", title: "Foco de Limpieza", description: "Registra un punto de basura crítica urbana", pointsReward: 25, targetCount: 1, currentCount: 0, isCompleted: false, icon: "⚠️" }
];

const INITIAL_ACHIEVEMENTS: EcoAchievement[] = [
  { id: "1", title: "Primer Brote", description: "Otorgada por unirte a la red ReciclApp de impacto.", icon: "🌱" },
  { id: "2", title: "Econanocientífico", description: "Acumula tus primeros 200 Eco-puntos de reciclaje.", icon: "🔬" },
  { id: "3", title: "Guardián de la Tierra", description: "Establece tu racha sumando más de 400 Eco-puntos.", icon: "🌍" }
];

const INITIAL_CENTERS: RecyclingCenter[] = [];

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_REPORTS: TrashReport[] = [];

export default function App() {
  
  // State initialization backing with localStorage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return loadFromStorage<UserProfile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  });

  const [challenges, setChallenges] = useState<EcoChallenge[]>(() => {
    return loadFromStorage<EcoChallenge[]>(STORAGE_KEYS.CHALLENGES, INITIAL_CHALLENGES);
  });

  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    const parsed = loadFromStorage<any[]>(STORAGE_KEYS.PICKUPS, []);
    return parsed.map(req => {
      let status = req.status as string;
      if (status === 'completed') status = 'cerrado';
      else if (status === 'in_transit') status = 'en_camino';
      else if (status === 'assigned') status = 'asignado';
      return { ...req, status: status as any };
    });
  });

  const [trashReports, setTrashReports] = useState<TrashReport[]>(() => {
    return loadFromStorage<TrashReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  });

  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>(() => {
    return loadFromStorage<RecyclingCenter[]>(STORAGE_KEYS.CENTERS, INITIAL_CENTERS);
  });

  const [products, setProducts] = useState<Product[]>(() => {
    return loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  });

  const achievements = INITIAL_ACHIEVEMENTS;

  const [appLoading, setAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Fill progress bar smoothly up to 100% across the 3 seconds duration
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 28);

    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync state mutations to localStorage
  useEffect(() => {
    saveToStorage<UserProfile>(STORAGE_KEYS.PROFILE, userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveToStorage<EcoChallenge[]>(STORAGE_KEYS.CHALLENGES, challenges);
  }, [challenges]);

  useEffect(() => {
    saveToStorage<PickupRequest[]>(STORAGE_KEYS.PICKUPS, pickupRequests);
  }, [pickupRequests]);

  useEffect(() => {
    saveToStorage<TrashReport[]>(STORAGE_KEYS.REPORTS, trashReports);
  }, [trashReports]);

  useEffect(() => {
    saveToStorage<RecyclingCenter[]>(STORAGE_KEYS.CENTERS, recyclingCenters);
  }, [recyclingCenters]);

  useEffect(() => {
    saveToStorage<Product[]>(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  // Points accumulator & level logic system
  const { addToast } = useToast();
  const { user: authUser, isLoggedIn, isProfileComplete, activeScreen } = useAuth();
  const { updateUserProfile } = useAuth();

  // Synchronize authenticated user state to current legacy profile driver
  const lastRoleRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (authUser) {
      setUserProfile(authUser);
      
      // Select appropriate default tab ONLY when swapping roles or first login
      if (lastRoleRef.current !== authUser.role) {
        lastRoleRef.current = authUser.role;
        if (authUser.role === 'collector') {
          setCurrentTab('collector-jobs');
        } else if (authUser.role === 'admin') {
          setCurrentTab('admin-overview');
        } else {
          setCurrentTab('dashboard');
        }
      }
    }
  }, [authUser]);

  const addPoints = (points: number) => {
    setUserProfile(prev => {
      // 1.5x Premium multiplier if user is premium
      const actualPointsGained = prev.isPremium ? Math.round(points * 1.5) : points;
      const newPoints = prev.points + actualPointsGained;
      
      // Calculate XP progression
      let nextXp = prev.xp + actualPointsGained;
      let nextLevel = prev.level;
      let leveledUp = false;
      
      while (nextXp >= 100) {
        nextXp -= 100;
        nextLevel += 1;
        leveledUp = true;
      }

      // Sync to virtual Auth database
      updateUserProfile({
        points: newPoints,
        level: nextLevel,
        xp: nextXp
      });

      setTimeout(() => {
        addToast(
          `¡Has ganado +${actualPointsGained} Eco-puntos! ${prev.isPremium ? '⭐ (Multiplicador Premium 1.5x)' : ''}`, 
          'reward'
        );
        if (leveledUp) {
          addToast(`¡Subiste de Nivel! Ahora eres Nivel ${nextLevel} 🎉`, 'success', 5000);
        }
      }, 50);

      return {
        ...prev,
        points: newPoints,
        level: nextLevel,
        xp: nextXp
      };
    });
  };

  const getActiveTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'pickups': return 'Solicitar Recojo';
      case 'maps': return 'Centros de Acopio';
      case 'marketplace': return 'Ecomarket';
      case 'impact': return 'Logros e Impacto';
      case 'profile': return 'Configuraciones';
      case 'collector-jobs': return 'Consola de Recolector';
      case 'admin-overview': return 'Panel de Gestión';
      case 'admin-reports': return 'Reportes Ciudadanos';
      case 'admin-users': return 'Usuarios y Socios';
      case 'admin-centers': return 'Centros Asociados';
      default: return 'ReciclApp';
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center relative overflow-hidden font-sans">
        {/* Organic background ambient blur circles */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-205 rounded-full mix-blend-multiply filter blur-3xl opacity-35 pointer-events-none"></div>

        <div className="flex flex-col items-center max-w-sm px-6 text-center z-10 space-y-6">
          {/* Rotating Leaf Container with springy shadow/aura pulse */}
          <div className="w-20 h-20 rounded-3xl bg-brand-green flex items-center justify-center shadow-lg shadow-emerald-700/20 relative">
            {/* Spinning/pulsing aura ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/30 animate-pulse"></div>
            
            {/* Rotating Leaf Icon with dynamic animation */}
            <Leaf className="w-10 h-10 text-white fill-white animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight animate-pulse">
              Bienvenido a <span className="text-brand-green">ReciclApp</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Recicla, gana puntos e impacta positivamente al planeta
            </p>
          </div>

          {/* Smooth custom-filling Progress bar */}
          <div className="w-48 space-y-2 pt-2">
            <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-green h-full rounded-full transition-all duration-75 ease-out" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              <span>Cargando...</span>
              <span>{loadingProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (activeScreen === 'welcome') return <WelcomeScreen />;
    if (activeScreen === 'login') return <LoginScreen />;
    if (activeScreen === 'register') return <RegisterScreen />;
    if (activeScreen === 'forgot-password') return <ForgotPasswordScreen />;
    return <WelcomeScreen />;
  }

  if (!isProfileComplete) {
    return <CompleteProfileScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Drawer Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content grid area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top bar for mobile and developer controls */}
        <header className="no-print h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 relative z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 px-2 hover:bg-slate-50 md:hidden border rounded text-slate-600 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-extrabold text-slate-800 text-sm tracking-wide uppercase">
              {getActiveTabTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {userProfile.role === 'regular' && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 p-2 py-1 rounded-xl">
                <Leaf className="w-4 h-4 text-brand-green fill-brand-green" />
                <span className="text-xs font-mono font-black text-emerald-950">{userProfile.points} Puntos</span>
              </div>
            )}
            {userProfile.isPremium && (
              <span className="p-2 bg-amber-50 text-amber-500 rounded-xl border border-amber-100" title="Usuario Premium">
                <Crown className="w-4 h-4 fill-amber-500" />
              </span>
            )}
          </div>
        </header>

        {/* Dynamic tab contents frame scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {currentTab === 'dashboard' && userProfile.role === 'regular' && (
            <Dashboard
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setCurrentTab={setCurrentTab}
              challenges={challenges}
              setChallenges={setChallenges}
              addPoints={addPoints}
            />
          )}

          {currentTab === 'pickups' && userProfile.role === 'regular' && (
            <PickupRequestView
              userProfile={userProfile}
              pickupRequests={pickupRequests}
              setPickupRequests={setPickupRequests}
              addPoints={addPoints}
            />
          )}

          {(currentTab === 'maps' || (currentTab === 'collector-jobs' && userProfile.role === 'collector')) && (
            <MapCenters
              userProfile={userProfile}
              trashReports={trashReports}
              setTrashReports={setTrashReports}
              recyclingCenters={recyclingCenters}
              addPoints={addPoints}
            />
          )}

          {currentTab === 'marketplace' && (
            <Marketplace
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              products={products}
              setProducts={setProducts}
            />
          )}

          {currentTab === 'impact' && userProfile.role === 'regular' && (
            <EcoImpact
              userProfile={userProfile}
              achievements={achievements}
            />
          )}

          {currentTab === 'profile' && (
            <PremiumSettings
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}

          {/* Collector view */}
          {userProfile.role === 'collector' && currentTab === 'collector-jobs' && (
            <CollectorPanel
              pickupRequests={pickupRequests}
              setPickupRequests={setPickupRequests}
              addPoints={addPoints}
            />
          )}

          {/* Admin views */}
          {userProfile.role === 'admin' && ['admin-overview', 'admin-reports', 'admin-users', 'admin-centers'].includes(currentTab) && (
            <AdminPanel
              userProfile={userProfile}
              trashReports={trashReports}
              setTrashReports={setTrashReports}
              recyclingCenters={recyclingCenters}
              setRecyclingCenters={setRecyclingCenters}
              addPoints={addPoints}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          )}

        </main>

        {/* Guided step-by-step onboarding learn tour */}
        <GuidedLearnTour
          userProfile={userProfile}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

      </div>
    </div>
  );
}
