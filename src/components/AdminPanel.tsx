import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Building,
  Activity,
  Plus,
  Compass,
  ArrowRight,
  Search,
  Mail,
  Phone,
  UserX,
  UserCheck,
  Crown
} from 'lucide-react';
import { TrashReport, RecyclingCenter, UserProfile, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface AdminPanelProps {
  userProfile: UserProfile;
  trashReports: TrashReport[];
  setTrashReports: React.Dispatch<React.SetStateAction<TrashReport[]>>;
  recyclingCenters: RecyclingCenter[];
  setRecyclingCenters: React.Dispatch<React.SetStateAction<RecyclingCenter[]>>;
  addPoints: (points: number) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function AdminPanel({
  userProfile,
  trashReports,
  setTrashReports,
  recyclingCenters,
  setRecyclingCenters,
  addPoints,
  currentTab,
  setCurrentTab
}: AdminPanelProps) {
  
  // Tab within this panel: 'overview' (municipality metrics) | 'reports' (managing critical trash piles) | 'users' (managing citizens/recyclers) | 'centers' (recycling centers)
  const [adminTab, setAdminTab] = useState<'overview' | 'reports' | 'users' | 'centers'>('overview');
  
  const { virtualUsersDb, setVirtualUsersDb } = useAuth();
  const { addToast } = useToast();

  // Active users subtab state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'regular' | 'collector' | 'admin'>('all');
  
  // Create user form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'regular' | 'collector' | 'admin'>('regular');
  const [newUserCity, setNewUserCity] = useState('Lima');
  const [newUserDistrict, setNewUserDistrict] = useState('Miraflores');

  useEffect(() => {
    if (currentTab === 'admin-overview') {
      setAdminTab('overview');
    } else if (currentTab === 'admin-reports') {
      setAdminTab('reports');
    } else if (currentTab === 'admin-users') {
      setAdminTab('users');
    } else if (currentTab === 'admin-centers') {
      setAdminTab('centers');
    }
  }, [currentTab]);

  const handleSetAdminTab = (tab: 'overview' | 'reports' | 'users' | 'centers') => {
    setAdminTab(tab);
    if (tab === 'overview') {
      setCurrentTab('admin-overview');
    } else if (tab === 'reports') {
      setCurrentTab('admin-reports');
    } else if (tab === 'users') {
      setCurrentTab('admin-users');
    } else if (tab === 'centers') {
      setCurrentTab('admin-centers');
    }
  };

  // User list actions
  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;

    const emailExists = virtualUsersDb.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase());
    if (emailExists) {
      addToast(`El correo electrónico ${newUserEmail} ya se encuentra registrado.`, 'error');
      return;
    }

    const newUserRecord = {
      uid: `USR-${Date.now().toString().slice(-4)}`,
      fullName: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      city: newUserCity || 'Lima',
      district: newUserDistrict || 'Miraflores',
      profileImageUrl: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1570295999919-56ceb5ecca61', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150`,
      points: 100,
      ecoLevel: 1,
      xp: 0,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
      isProfileComplete: true,
      isPremium: false,
      premiumStartDate: null,
      premiumEndDate: null,
      premiumStatus: 'inactive' as const,
    };

    setVirtualUsersDb(prev => [...prev, newUserRecord]);
    addToast(`Usuario "${newUserName}" registrado como ${newUserRole === 'admin' ? 'Administrador' : newUserRole === 'collector' ? 'Recolector' : 'Socio Regular'} con éxito!`, 'success');
    
    // Reset User form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserRole('regular');
    setNewUserCity('Lima');
    setNewUserDistrict('Miraflores');
    setShowUserForm(false);
  };

  const toggleUserStatus = (uid: string) => {
    setVirtualUsersDb(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextStatus = u.status === 'blocked' ? 'active' : 'blocked';
        addToast(`Estado de ${u.fullName} cambiado a "${nextStatus.toUpperCase()}".`, 'success');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const changeUserRole = (uid: string, role: UserRole) => {
    setVirtualUsersDb(prev => prev.map(u => {
      if (u.uid === uid) {
        addToast(`Rol de ${u.fullName} actualizado a "${role.toUpperCase()}".`, 'success');
        return { ...u, role };
      }
      return u;
    }));
  };

  const addPointsToUser = (uid: string, amount: number) => {
    setVirtualUsersDb(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextPoints = u.points + amount;
        addToast(`Se otorgaron +${amount} Eco-puntos a ${u.fullName}.`, 'reward');
        return { ...u, points: nextPoints };
      }
      return u;
    }));
  };

  // Centers creation simulation
  const [centerName, setCenterName] = useState('');
  const [centerAddress, setCenterAddress] = useState('');
  const [centerCategory, setCenterCategory] = useState('Plásticos, Metal');
  const [centerMultiplier, setCenterMultiplier] = useState(1.2);
  const [showCenterForm, setShowCenterForm] = useState(false);

  // Trash report deletion confirmation state
  const [reportToDelete, setReportToDelete] = useState<TrashReport | null>(null);

  const handleDeleteReport = (id: string) => {
    setTrashReports(prev => prev.filter(r => r.id !== id));
    addToast("El Punto Crítico de basura fue eliminado definitivamente del mapa y de los registros.", "success");
    setReportToDelete(null);
  };

  const resolveReport = (id: string) => {
    setTrashReports(prev => prev.map(rep => {
      if (rep.id === id) {
        return {
          ...rep,
          status: 'resolved' as const
        };
      }
      return rep;
    }));
  };

  const dispatchCleanupCrew = (id: string) => {
    setTrashReports(prev => prev.map(rep => {
      if (rep.id === id) {
        return {
          ...rep,
          status: 'investigating' as const
        };
      }
      return rep;
    }));
  };

  const handleAddNewCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName || !centerAddress) return;

    const newCenter: RecyclingCenter = {
      id: `AC-${Date.now().toString().slice(-3)}`,
      name: centerName,
      address: centerAddress,
      lat: -12.115 + (Math.random() * 0.01),
      lng: -77.030 + (Math.random() * 0.01),
      categories: centerCategory.split(',').map(c => c.trim()),
      hours: 'Lun a Sáb 08:00 - 18:00',
      phone: '+51 984 225 114',
      pointsMultiplier: Number(centerMultiplier)
    };

    setRecyclingCenters(prev => [...prev, newCenter]);
    addToast(`Punto de acopio "${newCenter.name}" registrado con éxito.`, "success");
    
    // Reset form
    setCenterName('');
    setCenterAddress('');
    setCenterCategory('Plásticos, Metal');
    setCenterMultiplier(1.2);
    setShowCenterForm(false);
  };

  const handleDeleteCenter = (id: string, name: string) => {
    setRecyclingCenters(prev => prev.filter(c => c.id !== id));
    addToast(`Asociación "${name}" eliminada correctamente del mapa.`, "success");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div className="bg-slate-900 border-b border-slate-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-slate-950/25">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 text-white rounded-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Panel de Administración ReciclApp</h2>
            <p className="text-xs text-slate-400 mt-0.5">Control global de reciclaje, reportes forestales ciudadanos y asociaciones de acopio.</p>
          </div>
        </div>

        {/* Inner admin subtabs toggles */}
        <div className="flex bg-slate-950 p-1 rounded-xl relative flex-wrap sm:flex-nowrap gap-1">
          <button
            onClick={() => handleSetAdminTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              adminTab === 'overview' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Métricas
          </button>
          <button
            onClick={() => handleSetAdminTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all relative cursor-pointer ${
              adminTab === 'reports' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Puntos Críticos</span>
            {trashReports.filter(r => r.status !== 'resolved').length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => handleSetAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              adminTab === 'users' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Usuarios y Socios
          </button>
          <button
            onClick={() => handleSetAdminTab('centers')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              adminTab === 'centers' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Centros
          </button>
        </div>
      </div>

      {adminTab === 'overview' ? (
        /* Metrics summary dashboard layout */
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border p-5 rounded-2xl shadow-xs text-xs">
              <span className="text-slate-400 font-bold block uppercase">Usuarios Registrados</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-bold font-display text-slate-850">1,248</span>
                <span className="text-emerald-600 font-bold font-mono">+12% este mes</span>
              </div>
            </div>
            
            <div className="bg-white border p-5 rounded-2xl shadow-xs text-xs">
              <span className="text-slate-400 font-bold block uppercase">Residuos Procesados</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-bold font-display text-slate-850">12.4 Ton</span>
                <span className="text-emerald-600 font-bold font-mono">Meta: 15 Ton</span>
              </div>
            </div>

            <div className="bg-white border p-5 rounded-2xl shadow-xs text-xs">
              <span className="text-slate-400 font-bold block uppercase">Puntos Críticos Activos</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-bold font-display text-red-650">
                  {trashReports.filter(r => r.status !== 'resolved').length}
                </span>
                <span className="text-slate-400 font-semibold font-sans">Reportes comunitarios</span>
              </div>
            </div>

            <div className="bg-white border p-5 rounded-2xl shadow-xs text-xs">
              <span className="text-slate-400 font-bold block uppercase">Centros Autorizados</span>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-2xl font-bold font-display text-slate-850">
                  {recyclingCenters.length}
                </span>
                <span className="text-brand-green font-bold">4 Nuevos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Activity chart mockup and community feeds */}
            <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5 uppercase">
                <Activity className="w-5 h-5 text-brand-green" /> Volumen de Reciclaje Semanal (kg)
              </h3>
              
              {/* Graphic Mock canvas/SVG representation of stats */}
              <div className="h-48 rounded-xl bg-slate-50 border p-4 flex items-end justify-between relative">
                <div className="absolute top-4 left-4 text-[10px] text-slate-400 font-mono space-y-0.5">
                  <p>• Plásticos: 420 kg</p>
                  <p>• Cartón: 840 kg</p>
                  <p>• Vidrio: 980 kg</p>
                </div>

                <div className="w-12 text-center space-y-2">
                  <div className="bg-brand-green/30 hover:bg-brand-green/50 h-28 rounded-lg mb-1 transition-all"></div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Lun</span>
                </div>
                <div className="w-12 text-center space-y-2">
                  <div className="bg-brand-green/45 hover:bg-brand-green/55 h-20 rounded-lg mb-1 transition-all"></div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Mar</span>
                </div>
                <div className="w-12 text-center space-y-2">
                  <div className="bg-brand-green/60 hover:bg-brand-green/70 h-36 rounded-lg mb-1 transition-all"></div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Mié</span>
                </div>
                <div className="w-12 text-center space-y-2">
                  <div className="bg-brand-green/75 hover:bg-brand-green/85 h-32 rounded-lg mb-1 transition-all"></div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">Jue</span>
                </div>
                <div className="w-12 text-center space-y-2">
                  <div className="bg-brand-green hover:bg-brand-green-dark h-40 rounded-lg mb-1 transition-all shadow-md shadow-emerald-550/20"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Vie</span>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Quick help desk tip for admins */}
            <div className="bg-white border rounded-2xl p-6 shadow-xs text-xs text-slate-600 leading-relaxed self-start space-y-3">
              <h4 className="font-bold text-slate-800 font-display">Tareas Administrativas Prioritarias:</h4>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span>Verificar reportes ciudadanos con severidad **Alta** para coordinar desvíos con camiones de basura.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-brand-green font-bold">✓</span>
                  <span>Promover certificaciones de canje con multiplicadores de puntos altos a comercios adheridos.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      ) : adminTab === 'reports' ? (
        
        /* Citizen critical reports list admin tracker */
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2">
            <h3 className="font-display font-semibold text-slate-800 text-sm tracking-wide uppercase">Reportes Pendientes de Acción Ciudadana</h3>
          </div>

          {trashReports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10 bg-slate-50 border rounded-xl">No hay reportes forestales de basura vigentes.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trashReports.map(rep => (
                <div key={rep.id} className="bg-white border rounded-2xl p-5 hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-slate-400">{rep.id}</span>
                      <div className="flex gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          rep.severity === 'high' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-orange-100 text-orange-850 border border-orange-200'
                        }`}>
                          Gravedad {rep.severity}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'investigating'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-650'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <img src={rep.photoUrl} alt="Dump visual verification" className="w-16 h-16 rounded-xl object-cover border" />
                      <div>
                        <h4 className="font-display font-extrabold text-slate-850 text-xs">{rep.title}</h4>
                        <p className="text-slate-500 text-[11px] leading-snug mt-1">{rep.description}</p>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5" /> GPS: {rep.latitude}, {rep.longitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex gap-2">
                    {rep.status === 'open' && (
                      <button
                        onClick={() => dispatchCleanupCrew(rep.id)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] uppercase rounded-lg cursor-pointer"
                      >
                        Enviar Cuadrilla
                      </button>
                    )}
                    
                    {rep.status !== 'resolved' ? (
                      <button
                        onClick={() => resolveReport(rep.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] uppercase rounded-lg cursor-pointer"
                      >
                        Marcar Resuelto
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold py-1.5 flex items-center gap-1 mx-auto">
                        <CheckCircle className="w-4 h-4" /> Caso Cerrado
                      </span>
                    )}

                    <button
                      onClick={() => setReportToDelete(rep)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold text-[10.5px] uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      title="Eliminar Reporte Definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Borrar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : adminTab === 'users' ? (
        
        /* Users and registered partners management module */
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Quick Users stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Registros Totales</span>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{virtualUsersDb.length}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500 opacity-60" />
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Eco Guardianes</span>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                  {virtualUsersDb.filter(u => u.role === 'regular').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Recolectores Activos</span>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                  {virtualUsersDb.filter(u => u.role === 'collector').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-amber-500 opacity-60" />
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Administradores</span>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                  {virtualUsersDb.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-rose-500 opacity-60" />
            </div>
          </div>

          {/* Search, Filter, and Add controls bar */}
          <div className="bg-white p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre o correo..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="border p-2 rounded-xl bg-slate-50 text-slate-705 focus:bg-white font-bold"
              >
                <option value="all">Todos los Roles</option>
                <option value="regular">Eco Guardianes</option>
                <option value="collector">Recolectores (Asociados)</option>
                <option value="admin">Administradores</option>
              </select>
            </div>

            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold uppercase rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-stretch md:self-auto"
            >
              <Plus className="w-4 h-4" /> Registrar Socio/Usuario
            </button>
          </div>

          {/* Form to Register Virtual User */}
          {showUserForm && (
            <form onSubmit={handleAddNewUser} className="bg-white border p-6 rounded-2xl shadow-xs space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-105 pb-2">
                <h4 className="font-bold text-slate-800 font-display text-xs uppercase tracking-wider">Registrar Nuevo Socio Directamente</h4>
                <button 
                  type="button" 
                  onClick={() => setShowUserForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold font-mono"
                >
                  [esconder formulario]
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej. Martín Fierro"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="martinfierro@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Teléfono Móvil</label>
                  <input
                    type="tel"
                    placeholder="+51999888777"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Rol del Colaborador</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full border p-2 rounded-lg font-bold"
                  >
                    <option value="regular">Socio / Ciudadano (Eco-Guardián)</option>
                    <option value="collector">Recolector Independiente / Vehículo</option>
                    <option value="admin">Administrador (Muni/Asociación)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Departamento / Ciudad</label>
                  <input
                    type="text"
                    value={newUserCity}
                    onChange={(e) => setNewUserCity(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Distrito</label>
                  <input
                    type="text"
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border rounded-lg text-slate-500 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-dark"
                >
                  Registrar e Incorporar
                </button>
              </div>
            </form>
          )}

          {/* List of filtered virtual users */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-slate-800 text-sm tracking-wide uppercase">
              Lista Integrada de Usuarios de ReciclApp ({
                virtualUsersDb.filter(u => {
                  const matchesSearch = u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
                  const matchesRole = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
                  return matchesSearch && matchesRole;
                }).length
              })
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {virtualUsersDb
                .filter(u => {
                  const matchesSearch = u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
                  const matchesRole = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
                  return matchesSearch && matchesRole;
                })
                .map(userItem => (
                  <div key={userItem.uid} className="bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Avatar & Profile Information */}
                      <div className="flex gap-3">
                        <img 
                          src={userItem.profileImageUrl} 
                          alt={userItem.fullName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 placeholder-indigo-100 shrink-0" 
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-display font-bold text-slate-800 text-sm">{userItem.fullName}</h4>
                            {userItem.isPremium && (
                              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Premium
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-0.5 text-slate-500 text-[10.5px]">
                            <p className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" /> {userItem.email}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" /> {userItem.phone}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Ubicación: <span className="font-semibold text-slate-600">{userItem.district}, {userItem.city}</span> | Id: <span className="font-mono font-bold text-slate-600">{userItem.uid}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Level */}
                      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          userItem.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                            : 'bg-rose-100 text-rose-800 border-rose-250'
                        }`}>
                          {userItem.status === 'active' ? 'Activo' : 'Bloqueado'}
                        </span>

                        <span className="text-[10px] text-slate-405 font-medium mt-1">
                          Nivel <span className="font-extrabold text-slate-800">{userItem.ecoLevel || 1}</span>
                        </span>

                        <span className="font-mono text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                          {userItem.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Membership Info & Admin Management */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Crown className={`w-3.5 h-3.5 ${userItem.isPremium ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          <span className="font-bold text-slate-700">Membresía Premium</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          userItem.isPremium ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {userItem.isPremium ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 gap-2">
                        <div>
                          <p>
                            Inicio: <span className="font-medium text-slate-700">{userItem.premiumStartDate ? new Date(userItem.premiumStartDate).toLocaleDateString() : 'N/A'}</span>
                          </p>
                          <p>
                            Vence: <span className="font-medium text-slate-700">{userItem.premiumEndDate ? new Date(userItem.premiumEndDate).toLocaleDateString() : 'N/A'}</span>
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {userItem.isPremium ? (
                            <button
                              type="button"
                              onClick={() => {
                                setVirtualUsersDb(prev => prev.map(u => {
                                  if (u.uid === userItem.uid) {
                                    addToast(`Membresía Premium cancelada para ${u.fullName}.`, 'info');
                                    return {
                                      ...u,
                                      isPremium: false,
                                      premiumStatus: 'inactive',
                                      premiumStartDate: null,
                                      premiumEndDate: null
                                    };
                                  }
                                  return u;
                                }));
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                            >
                              Revocar Premium
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setVirtualUsersDb(prev => prev.map(u => {
                                  if (u.uid === userItem.uid) {
                                    addToast(`Premium otorgado por 30 días a ${u.fullName}.`, 'success');
                                    return {
                                      ...u,
                                      isPremium: true,
                                      premiumStatus: 'active',
                                      premiumStartDate: new Date().toISOString(),
                                      premiumEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                                    };
                                  }
                                  return u;
                                }));
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded text-[9.5px] font-bold cursor-pointer transition-colors"
                            >
                              Otorgar Premium
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Admin Actions Row */}
                    <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      
                      {/* Left: Change Role selectors */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cambiar Rol:</span>
                        <div className="flex bg-slate-105 p-0.5 rounded-lg border gap-0.5">
                          <button
                            type="button"
                            onClick={() => changeUserRole(userItem.uid, 'regular')}
                            className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                              userItem.role === 'regular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            👤 Socio
                          </button>
                          <button
                            type="button"
                            onClick={() => changeUserRole(userItem.uid, 'collector')}
                            className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                              userItem.role === 'collector' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            🚚 Recolector
                          </button>
                          <button
                            type="button"
                            onClick={() => changeUserRole(userItem.uid, 'admin')}
                            className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                              userItem.role === 'admin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            🔑 Admin
                          </button>
                        </div>
                      </div>

                      {/* Right: Actions bar */}
                      <div className="flex items-center gap-2">
                        {/* Award Points */}
                        <div className="flex items-center border rounded-lg overflow-hidden bg-slate-50">
                          <span className="px-1.5 text-[9px] text-slate-400 font-extrabold uppercase">Otorgar:</span>
                          <button
                            type="button"
                            onClick={() => addPointsToUser(userItem.uid, 50)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[9px] px-2 py-1 transition-all border-l cursor-pointer"
                          >
                            +50 pts
                          </button>
                          <button
                            type="button"
                            onClick={() => addPointsToUser(userItem.uid, 200)}
                            className="bg-emerald-650 hover:bg-emerald-700 text-white font-mono font-bold text-[9px] px-2 py-1 transition-all border-l cursor-pointer"
                          >
                            +200 pts
                          </button>
                        </div>

                        {/* Ban / Activate Trigger */}
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(userItem.uid)}
                          className={`p-1.5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            userItem.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-650'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-650'
                          }`}
                          title={userItem.status === 'active' ? 'Bloquear usuario temporalmente' : 'Activar Cuenta de Socio'}
                        >
                          {userItem.status === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

      ) : (

        /* Partner Recycling center register modules */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm tracking-wide uppercase">Catálogo de Puntos Conectados ({recyclingCenters.length})</h3>
            
            <div className="bg-white border rounded-2xl divide-y divide-slate-100">
              {recyclingCenters.map(center => (
                <div key={center.id} className="p-4 flex justify-between items-center text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-50 text-brand-green rounded-xl mt-0.5">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-slate-800">{center.name}</h4>
                      <p className="text-slate-400 text-[10.5px] mt-0.5">{center.address}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {center.categories.map((c, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold font-sans">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md font-mono">
                      +{center.pointsMultiplier}x pts
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCenter(center.id, center.name)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all group/btn cursor-pointer"
                      title="Eliminar punto de acopio"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowCenterForm(!showCenterForm)}
              className="w-full py-3 bg-brand-green text-white font-bold text-xs uppercase rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Punto
            </button>

            {showCenterForm && (
              <form onSubmit={handleAddNewCenter} className="bg-white border p-5 rounded-2xl shadow-xs text-xs space-y-4 animate-fade-in">
                <h4 className="font-bold text-slate-850 font-display">Registrar Asociación</h4>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nombre del centro</label>
                  <input
                    type="text"
                    placeholder="Ej. Asociación Recicla Piura"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Dirección Física</label>
                  <input
                    type="text"
                    placeholder="Calle, Distrito, Referencia"
                    value={centerAddress}
                    onChange={(e) => setCenterAddress(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Insumos tolerados (comas)</label>
                  <input
                    type="text"
                    placeholder="Plásticos, Vidrio, Metales"
                    value={centerCategory}
                    onChange={(e) => setCenterCategory(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Multiplicador de Recompensas</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={centerMultiplier}
                    onChange={(e) => setCenterMultiplier(Number(e.target.value))}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-brand-green text-white font-bold rounded-lg text-[11px] uppercase tracking-wider"
                >
                  Agregar a base de datos de mapas
                </button>
              </form>
            )}
          </div>

        </div>

      )}

      {/* Confirmation modal for deleting critical report */}
      {reportToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-xs" id="delete-confirmation-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-100 animate-scale-up">
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-slate-800 text-sm tracking-wide uppercase">¿Eliminar Reporte Definitivamente?</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Estás a punto de borrar permanentemente el reporte <strong>{reportToDelete.id} ({reportToDelete.title})</strong>. Esta acción no se puede deshacer y el marcador desaparecerá del mapa de inmediato.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReport(reportToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Sí, Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
