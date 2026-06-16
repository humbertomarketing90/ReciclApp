export type UserRole = 'regular' | 'collector' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  level: number;
  xp: number;
  isPremium: boolean;
  role: UserRole;
  joinedDate: string;
  premiumStartDate: string | null;
  premiumEndDate: string | null;
  premiumDaysRemaining: number;
  premiumStatus: "active" | "expired" | "inactive";
}

export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  userCoordinates: { lat: number; lng: number };
  category: string; // 'Plásticos' | 'Papel/Cartón' | 'Vidrio' | 'Metal' | 'Orgánico' | 'E-Waste'
  weightEstimate: number; // in kg
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  photoUrl?: string;
  isPremium?: boolean;
  status: 'recibido' | 'en_revision' | 'asignado' | 'en_camino' | 'recolectado' | 'llevado_a_centro_de_acopio' | 'cerrado' | 'cancelado';
  collectorId?: string;
  collectorName?: string;
  pointsAwarded: number;
  createdAt: string;
}

export interface TrashReport {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  photoUrl?: string;
  createdAt: string;
}

export interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  hours: string;
  phone: string;
  pointsMultiplier: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  ecoPointsPrice?: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Backward compatibility fields:
  priceInTokens?: boolean;
  image?: string;
  sellerName?: string;
  sellerId?: string;
  isSold?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  messages: ChatMessage[];
  lastMessageAt: string;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  pointsReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  icon: string;
}

export interface EcoAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

// Extended database schema for simulating users collection
export interface ExtendedUserRecord {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  district: string;
  profileImageUrl: string;
  points: number;
  ecoLevel: number;
  xp: number;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  isProfileComplete: boolean;
  isPremium: boolean;
  premiumStartDate: string | null;
  premiumEndDate: string | null;
  premiumStatus: "active" | "expired" | "inactive";
  password?: string;
  notificationPreferences?: {
    pickups: boolean;
    reports: boolean;
    rewards: boolean;
    marketplace: boolean;
  };
  recyclingPreferences?: {
    plastic: boolean;
    paper: boolean;
    glass: boolean;
    metal: boolean;
    organic: boolean;
    electronic: boolean;
  };
  mainAddress?: {
    label: string;
    address: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
  };
}
