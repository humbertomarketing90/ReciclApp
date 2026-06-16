import React from 'react';
import { 
  Leaf, 
  LayoutDashboard, 
  CalendarRange, 
  MapPin, 
  ShoppingBag, 
  Trophy, 
  User, 
  ShieldAlert, 
  Truck, 
  Users,
  Building,
  Settings,
  HelpCircle,
  Crown,
  LogOut
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  userProfile,
  setUserProfile,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  
  const { simulateRoleSwitch, logoutUser } = useAuth();

  const handleRoleChange = (role: UserRole) => {
    simulateRoleSwitch(role);
    // Redirect to fallback tab for new role
    if (role === 'collector') {
      setCurrentTab('collector-jobs');
    } else if (role === 'admin') {
      setCurrentTab('admin-overview');
    } else {
      setCurrentTab('dashboard');
    }
    setIsMobileOpen(false);
  };

  const navItems = [
    // Regular User Tabs
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['regular'] },
    { id: 'pickups', label: 'Solicitar Recojo', icon: CalendarRange, roles: ['regular'] },
    { id: 'maps', label: 'Centros de Acopio', icon: MapPin, roles: ['regular'] },
    { id: 'marketplace', label: 'Ecomarket', icon: ShoppingBag, roles: ['regular'] },
    { id: 'impact', label: 'Logros e Impacto', icon: Trophy, roles: ['regular'] },

    // Collector Tabs
    { id: 'collector-jobs', label: 'Rutas Asignadas', icon: Truck, roles: ['collector'] },
    { id: 'maps', label: 'Centros de Depósito', icon: MapPin, roles: ['collector'] },
    
    // Admin Tabs
    { id: 'admin-overview', label: 'Panel General', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'admin-reports', label: 'Puntos Críticos', icon: ShieldAlert, roles: ['admin'] },
    { id: 'admin-users', label: 'Usuarios y Socios', icon: Users, roles: ['admin'] },
    { id: 'admin-centers', label: 'Centros Asociados', icon: Building, roles: ['admin'] }
  ];

  const activeItems = navItems.filter(item => item.roles.includes(userProfile.role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-green text-white font-sans w-64 border-r border-brand-green-dark/20">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
          <Leaf className="w-6 h-6 text-brand-green fill-brand-green" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-0.5">
            Recicl<span className="text-emerald-200">App</span>
          </h1>
          <p className="text-white/60 text-xs font-mono">Guardián Eco v1.2</p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="p-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={userProfile.avatar} 
              alt={userProfile.name} 
              className="w-12 h-12 rounded-full border-2 border-white/65 object-cover" 
            />
            {userProfile.isPremium && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-0.5 rounded-full" title="Usuario Premium">
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-slate-950" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm font-semibold truncate text-white">{userProfile.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                userProfile.role === 'admin' 
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' 
                  : userProfile.role === 'collector'
                    ? 'bg-blue-300/20 text-blue-200 border border-blue-400/30'
                    : 'bg-white/20 text-white border border-white/30'
              }`}>
                {userProfile.role === 'regular' ? (userProfile.isPremium ? 'Premium ⭐' : 'Regular') : userProfile.role}
              </span>
            </div>
          </div>
        </div>

        {userProfile.role === 'regular' && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Nivel {userProfile.level}</span>
              <span className="font-mono text-emerald-200">{userProfile.points} Puntos</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500" 
                style={{ width: `${userProfile.xp}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-white/50 text-[10px] font-bold tracking-wider uppercase mb-2">Menú Principal</p>
        {activeItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                setCurrentTab(item.id);
                setIsMobileOpen(false);
              }}
              style={
                item.id === 'collector-jobs'
                  ? { borderRadius: '14px' }
                  : item.id === 'maps'
                    ? { borderRadius: '15px' }
                    : undefined
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group text-left ${
                isActive 
                  ? 'bg-white/20 text-white font-semibold' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-px bg-white/10 my-4"></div>

        {/* Extra Navigation (Common for all roles) */}
        <p className="px-3 text-white/50 text-[10px] font-bold tracking-wider uppercase mb-2">Soporte</p>
        <button
          onClick={() => {
            setCurrentTab('profile');
            setIsMobileOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group text-left ${
            currentTab === 'profile' 
              ? 'bg-white/20 text-white font-semibold' 
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          <User className="w-5 h-5 text-white/60 group-hover:text-white" />
          <span>Mi Cuenta / Configs</span>
        </button>

        <button
          onClick={() => {
            logoutUser();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group text-left text-red-200 hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut className="w-5 h-5 text-red-300 group-hover:text-red-150" />
          <span>Cerrar Sesión</span>
        </button>
      </nav>

      {/* App Simulation Role Selector Panel (Extremely useful for demo/reviews) */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <p className="text-[10px] uppercase font-bold tracking-wider text-white/60 mb-2 font-mono flex items-center gap-1">
          <Settings className="w-3.5 h-3.5" /> Cambiar Rol Simulado (Demo)
        </p>
        <div className="grid grid-cols-3 gap-1">
          {(['regular', 'collector', 'admin'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`py-1.5 px-1 rounded text-[10px] font-mono font-medium border uppercase transition-all ${
                userProfile.role === role
                  ? 'bg-white text-brand-green border-white font-bold shadow-sm'
                  : 'bg-brand-green border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {role === 'regular' ? 'Usuario' : role === 'collector' ? 'Recolector' : 'Admin'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen md:block flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 h-full animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
