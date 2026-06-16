import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  MessageSquare, 
  PlusCircle, 
  Send, 
  CheckCircle, 
  Info,
  Gift,
  Coins,
  ArrowLeft,
  Search,
  ChevronRight
} from 'lucide-react';
import { Product, ChatSession, UserProfile } from '../types';
import { useToast } from '../context/ToastContext';

interface MarketplaceProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

// Simulated active chat messages database representing products
const PRODUCT_SELLER_FIRST_MESSAGES: Record<string, string> = {
  "1": "¡Hola! Sí, el Compost Orgánico de Lombriz está 100% maduro, tamizado y listo para aplicar a macetas o jardín. ¿Cuántas bolsas andabas buscando?",
  "2": "Hola estimado, el pack de bolsas de lona de yute incluye 3 tamaños de costura reforzada. Son completamente ecológicas y lavables.",
  "3": "¡Hola! El termo de bambú térmico cuenta con ampolla interna de acero inoxidable (grado alimenticio). Mantiene frío por 12 horas. Sí tengo stock.",
  "4": "Hola, el jabón es elaborado a base de saponificación en frío de aceite de coco y lavanda orgánica. No contiene parabenos ni sulfatos."
};

const PRODUCT_SELLER_REPLIES: Record<string, string[]> = {
  "1": [
    "Hago entregas sin costo los sábados cerca del Parque Central, o bien coordinamos recojo gratis.",
    "El compost ha sido enriquecido con cáscaras de huevo trituradas, aporta abundante calcio.",
    "Excelente, dale clic al botón 'Adquirir con Eco-Puntos' para procesar el canje oficial y nos vemos allí."
  ],
  "2": [
    "Soportan hasta 12 kg de peso perfectamente. Tienen asas anchas acolchadas antidesgarros.",
    "Sí claro, puedo personalizar los logotipos a mano si llevas más de 5 unidades.",
    "Acepto el canje directo. Canjéala completando los puntos y coordinamos dirección."
  ],
  "3": [
    "Tiene una capacidad exacta de 600 ml y tapón hermético antiderrame de silicona.",
    "Viene en una hermosa caja de cartón kraft reciclado ideal para regalar.",
    "¡Perfecto! Nos contactamos de inmediato para agendar el envío."
  ],
  "4": [
    "Sí, las barras pesan aproximadamente 110 gramos cada una.",
    "Ayudan muchísimo a pieles sensibles o con dermatitis gracias a la avena coloidal.",
    "Gracias por tu compra eco-amigable."
  ]
};

export default function Marketplace({
  userProfile,
  setUserProfile,
  products,
  setProducts
}: MarketplaceProps) {
  const { addToast } = useToast();
  
  // Tab states: 'browse' (Listing of items), 'sell' (Sell form), 'chat' (Active buyer messages workspace), 'admin-ecomarket'
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'chat' | 'admin-ecomarket'>('browse');

  // Admin control states for Ecomarket:
  const [adminNewName, setAdminNewName] = useState('');
  const [adminNewCategory, setAdminNewCategory] = useState('reusable');
  const [adminNewPrice, setAdminNewPrice] = useState(25);
  const [adminNewStock, setAdminNewStock] = useState(10);
  const [adminNewImage, setAdminNewImage] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250');
  const [adminNewDescription, setAdminNewDescription] = useState('');
  const [adminNewActive, setAdminNewActive] = useState(true);

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminEditName, setAdminEditName] = useState('');
  const [adminEditCategory, setAdminEditCategory] = useState('reusable');
  const [adminEditPrice, setAdminEditPrice] = useState(25);
  const [adminEditStock, setAdminEditStock] = useState(10);
  const [adminEditImage, setAdminEditImage] = useState('');
  const [adminEditDescription, setAdminEditDescription] = useState('');
  const [adminEditActive, setAdminEditActive] = useState(true);

  const handleAdminCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewName || !adminNewDescription) return;

    const newPr: Product = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: adminNewName,
      description: adminNewDescription,
      price: Number(adminNewPrice),
      priceInTokens: true,
      image: adminNewImage || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250",
      imageUrl: adminNewImage || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250",
      category: adminNewCategory,
      stock: Number(adminNewStock),
      isActive: adminNewActive,
      sellerName: "ReciclApp Depot",
      sellerId: "admin",
      isSold: Number(adminNewStock) <= 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts(prev => [newPr, ...prev]);
    addToast(`¡Eco-producto "${newPr.name}" creado correctamente! 🛍️`, "success");
    
    // reset
    setAdminNewName('');
    setAdminNewDescription('');
    setAdminNewPrice(25);
    setAdminNewStock(10);
    setAdminNewActive(true);
  };

  const handleAdjustStock = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const currentStock = p.stock !== undefined ? p.stock : 1;
        const newStock = Math.max(0, currentStock + amount);
        return {
          ...p,
          stock: newStock,
          isSold: newStock <= 0
        };
      }
      return p;
    }));
    addToast("Stock del producto modificado.", "info");
  };

  const handleToggleActive = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextActive = p.isActive === false ? true : false;
        return {
          ...p,
          isActive: nextActive
        };
      }
      return p;
    }));
    addToast("Visibilidad del producto actualizada.", "success");
  };

  const handleInitiateEditProduct = (p: Product) => {
    setEditingProduct(p);
    setAdminEditName(p.name);
    setAdminEditCategory(p.category);
    setAdminEditPrice(p.price);
    setAdminEditStock(p.stock !== undefined ? p.stock : 1);
    setAdminEditImage(p.image || p.imageUrl || '');
    setAdminEditDescription(p.description);
    setAdminEditActive(p.isActive !== false);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: adminEditName,
          category: adminEditCategory,
          price: Number(adminEditPrice),
          stock: Number(adminEditStock),
          image: adminEditImage,
          imageUrl: adminEditImage,
          description: adminEditDescription,
          isActive: adminEditActive,
          isSold: Number(adminEditStock) <= 0,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    addToast(`Eco-producto "${adminEditName}" editado con éxito.`, "success");
    setEditingProduct(null);
  };

  const handleAdminDeleteProduct = (id: string, name: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast(`Eco-producto "${name}" eliminado permanentemente.`, "success");
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectCategory, setSelectCategory] = useState<string>('all');
  
  // Custom listed item state
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState(15);
  const [itemPriceType, setItemPriceType] = useState<'points'|'usd'>('points');
  const [itemCategory, setItemCategory] = useState<'eco-home'|'reusable'|'organic'|'upcycled'>('reusable');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPhoto, setItemPhoto] = useState<string | null>(null);
  
  // Checkout popup simulation
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Active integrated chats list
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInputMessage, setChatInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chatSessions]);

  const handlePresetPhoto = (url: string) => {
    setItemPhoto(url);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemDescription) return;

    const newProd: Product = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: itemName,
      description: itemDescription,
      price: Number(itemPrice),
      priceInTokens: itemPriceType === 'points',
      image: itemPhoto || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250",
      imageUrl: itemPhoto || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250",
      category: itemCategory,
      sellerName: userProfile.name,
      sellerId: userProfile.id,
      isSold: false,
      stock: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts(prev => [newProd, ...prev]);
    setActiveTab('browse');
    addToast(`¡Eco-producto "${newProd.name}" publicado exitosamente! 🌱`, 'success');
    
    // Clear Listing form
    setItemName('');
    setItemDescription('');
    setItemPrice(15);
    setItemPhoto(null);
  };

  const handleOpenSellerChat = (product: Product) => {
    // Check if chat session already exists for this product
    const existing = chatSessions.find(s => s.productId === product.id);
    if (existing) {
      setActiveChatId(existing.id);
      setActiveTab('chat');
      return;
    }

    // Spawn new session
    const firstMsgSeller = PRODUCT_SELLER_FIRST_MESSAGES[product.id] || `¡Hola! Gracias por tu interés en ${product.name}. Cuéntame, ¿cómo puedo ayudarte?`;
    const newSession: ChatSession = {
      id: `CHAT-${product.id}-${Date.now().toString().slice(-4)}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image || product.imageUrl || '',
      buyerId: userProfile.id,
      buyerName: userProfile.name,
      sellerId: product.sellerId || 'seller-1',
      sellerName: product.sellerName || 'Vendedor ReciclApp',
      messages: [
        { id: '1', senderId: product.sellerId || 'seller-1', senderName: product.sellerName || 'Vendedor ReciclApp', text: firstMsgSeller, timestamp: '12:00' }
      ],
      lastMessageAt: new Date().toISOString()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    setActiveTab('chat');
  };

  const activeSessionDetail = chatSessions.find(s => s.id === activeChatId);

  const handleSendChatMessage = () => {
    if (!chatInputMessage.trim() || !activeChatId || !activeSessionDetail) return;
    
    const userText = chatInputMessage;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    setChatSessions(prev => prev.map(s => {
      if (s.id === activeChatId) {
        return {
          ...s,
          messages: [
            ...s.messages,
            { id: Date.now().toString(), senderId: userProfile.id, senderName: userProfile.name, text: userText, timestamp: nowStr }
          ]
        };
      }
      return s;
    }));

    setChatInputMessage('');

    // Trigger auto seller reply
    setTimeout(() => {
      const replies = PRODUCT_SELLER_REPLIES[activeSessionDetail.productId] || [
        "Acepto coordinar en un punto medio. ¿Te conviene esta tarde?",
        "Muchas gracias, avísame si cerramos el trato.",
        "Quedó totalmente claro."
      ];
      
      const seed = Math.floor(Math.random() * replies.length);
      const replyText = replies[seed];

      setChatSessions(prev => prev.map(s => {
        if (s.id === activeChatId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              { id: Date.now().toString() + "-rep", senderId: activeSessionDetail.sellerId, senderName: activeSessionDetail.sellerName, text: replyText, timestamp: nowStr }
            ]
          };
        }
        return s;
      }));
    }, 1200);
  };

  const handleCompletePurchase = () => {
    if (!checkoutProduct) return;

    if (checkoutProduct.priceInTokens) {
      if (userProfile.points < checkoutProduct.price) {
        addToast("Oops! Tienes puntos insuficientes en tu balance para completar este intercambio.", "error");
        return;
      }
      // Deduct Points
      setUserProfile(prev => ({
        ...prev,
        points: prev.points - checkoutProduct.price
      }));
    }

    setCheckoutSuccess(true);
    addToast(`¡Canje exitoso! Adquiriste "${checkoutProduct.name}" por ${checkoutProduct.price} Eco-puntos. 🛍️`, 'success');
    
    // Flag product as sold
    setProducts(prev => prev.map(p => {
      if (p.id === checkoutProduct.id) {
        return { ...p, isSold: true };
      }
      return p;
    }));

    // Auto open first chat with seller is structured
    setTimeout(() => {
      setCheckoutSuccess(false);
      const targetObj = checkoutProduct;
      setCheckoutProduct(null);
      handleOpenSellerChat(targetObj);
    }, 1800);
  };

  const filteredProducts = products.filter(p => {
    // Non-admin citizens only see active products
    if (userProfile.role !== 'admin' && p.isActive === false) {
      return false;
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectCategory === 'all' || p.category === selectCategory;
    
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Module Title Header & Navigation buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">Ecomarket Sostenible (Marketplace)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Intercambia o vende productos amigables con el medio ambiente utilizando tus Eco-Puntos.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'browse'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Explorar Eco-Productos
          </button>
          
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'sell'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> 
            Vender / Canjear
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Mis Chats</span>
            {chatSessions.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2"></span>
            )}
          </button>

          {userProfile.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin-ecomarket')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 ${
                activeTab === 'admin-ecomarket'
                  ? 'bg-amber-105 border-amber-300 font-extrabold text-amber-900'
                  : 'text-amber-700 hover:text-amber-900 shadow-xs'
              }`}
            >
              ★ Admin Tienda
            </button>
          )}
        </div>
      </div>

      {checkoutProduct && (
        /* Purchase redemption Modal checkout screen popup */
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl animate-scale-up">
            
            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-brand-green mx-auto animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="font-display font-extrabold text-slate-800 text-lg">¡Trueque Completado!</h4>
                <p className="text-xs text-slate-400">Puntos redimidos con éxito. Abriendo canal seguro con el vendedor...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide">Completar Intercambio</h3>
                  <button onClick={() => setCheckoutProduct(null)} className="text-slate-400 hover:text-slate-800">×</button>
                </div>

                <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={checkoutProduct.image} alt={checkoutProduct.name} className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-950 font-display">{checkoutProduct.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Vendedor: {checkoutProduct.sellerName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Precio de lista:</span>
                    <span className="font-bold text-slate-800">
                      {checkoutProduct.price} {checkoutProduct.priceInTokens ? 'Eco-Puntos' : 'USD'}
                    </span>
                  </div>
                  {checkoutProduct.priceInTokens && (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Tus Eco-puntos actuales:</span>
                        <span className="font-mono font-bold text-slate-700">{userProfile.points} PTS</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-brand-green">
                        <span>Saldo posterior:</span>
                        <span>{userProfile.points - checkoutProduct.price} PTS</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-[10.5px] leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Al confirmar, tus puntos serán bloqueados temporalmente hasta procesar la entrega física del artículo.</span>
                </div>

                <button
                  onClick={handleCompletePurchase}
                  disabled={checkoutProduct.priceInTokens && userProfile.points < checkoutProduct.price}
                  className="w-full py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Confirmar Intercambio
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' ? (
        /* Multi Seller-Buyer secure Chat Workspace layout */
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden h-[450px] animate-fade-in">
          
          {/* Active channels list sidebar */}
          <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50 md:col-span-1">
            <div className="p-4 bg-white border-b border-slate-200">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Conversaciones del Market</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 p-2">
              {chatSessions.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-[11px] text-slate-400">No hay chats activos. Pregunta al vendedor en algún artículo.</p>
                </div>
              ) : chatSessions.map(session => {
                const isSelected = activeChatId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveChatId(session.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between border ${
                      isSelected 
                        ? 'bg-emerald-50/50 border-brand-green-light shadow-xs text-slate-900' 
                        : 'border-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={session.productImage} alt={session.productName} className="w-10 h-10 rounded-lg object-cover border border-slate-250/50" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate max-w-[110px]">{session.productName}</h4>
                        <p className="text-[10px] text-slate-400 truncate">Vendedor: {session.sellerName}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active chat window viewport */}
          <div className="md:col-span-2 flex flex-col h-full">
            {activeSessionDetail ? (
              <>
                {/* Chat window Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={activeSessionDetail.productImage} alt={activeSessionDetail.productName} className="w-10 h-10 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{activeSessionDetail.productName}</h4>
                      <p className="text-[9.5px] text-slate-400">Vendedor: {activeSessionDetail.sellerName}</p>
                    </div>
                  </div>
                </div>

                {/* Text Messages scroll container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60 leading-relaxed">
                  {activeSessionDetail.messages.map((m, idx) => {
                    const isMe = m.senderId === userProfile.id;
                    return (
                      <div key={idx} className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`px-3 py-2 text-xs rounded-xl shadow-xs ${
                          isMe 
                            ? 'bg-brand-green text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono mt-1 px-1">{m.timestamp}</span>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef}></div>
                </div>

                {/* Input block form */}
                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={chatInputMessage}
                    onChange={(e) => setChatInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Escribe un mensaje al vendedor..."
                    className="flex-1 text-xs border border-slate-250/60 rounded-xl px-3 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={!chatInputMessage.trim()}
                    className="p-2.5 bg-brand-green text-white rounded-xl hover:bg-brand-green-dark disabled:opacity-40"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <h4 className="font-display font-bold">Sin Conversación Seleccionada</h4>
                <p className="text-xs max-w-xs leading-relaxed">Selecciona un chat en la barra lateral para revisar y acordar las entregas sostenibles con el vendedor.</p>
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'sell' ? (

        /* Listing product creation form module */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <form onSubmit={handleCreateProduct} className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            
            <h3 className="font-display font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <PlusCircle className="w-6 h-6 text-brand-green" strokeWidth={1.5} /> Publicar Artículo Sostenible
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-600 block">Nombre del Producto</label>
                <input
                  type="text"
                  placeholder="Ej: Compostador orgánico rotativo, Set de sorbetes de acero"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Estilo de Canje / Precio</label>
                <select
                  value={itemPriceType}
                  onChange={(e) => setItemPriceType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-3"
                >
                  <option value="points">Canjear por Eco-Puntos</option>
                  <option value="usd">Vender por Efectivo (Simulado USD)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Valor Máximo / Precio</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-3 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-600 block">Categoría del Catálogo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'reusable', label: 'Reutilizables' },
                    { id: 'organic', label: 'Orgánicos' },
                    { id: 'eco-home', label: 'Hogar Eco' },
                    { id: 'upcycled', label: 'Upcycled' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setItemCategory(cat.id as any)}
                      className={`p-2.5 rounded-lg border text-center font-semibold text-[10.5px] transition-all ${
                        itemCategory === cat.id
                          ? 'bg-brand-green text-white border-brand-green shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-600 block">Descripción del Producto</label>
                <textarea
                  placeholder="Describe las virtudes del producto, de qué material orgánico o reciclable esta hecho y el estado de entrega."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3"
                  rows={3}
                  required
                />
              </div>

              {/* Photo selector simulators */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-500 block uppercase text-[10px]">Elegir Imagen Ilustrativa (Simulada)</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250', label: 'Bolsas Yute' },
                    { url: 'https://images.unsplash.com/photo-1622393963462-8c1bc88d2238?auto=format&fit=crop&q=85&w=250', label: 'Termo Madera' },
                    { url: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&q=85&w=250', label: 'Compost' },
                  ].map((pres, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePresetPhoto(pres.url)}
                      className={`p-1.5 border rounded-lg hover:border-brand-green shrink-0 transition-all ${
                        itemPhoto === pres.url ? 'border-brand-green bg-emerald-50/10' : 'border-slate-200'
                      }`}
                    >
                      <img src={pres.url} alt={pres.label} className="w-12 h-12 object-cover rounded-md" />
                    </button>
                  ))}
                  {itemPhoto && (
                    <div className="flex items-center">
                      <span className="text-[10px] text-brand-green font-semibold">✓ Imagen Seleccionada</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-transform hover:scale-101"
            >
              Publicar en Ecomarket
            </button>
          </form>

          {/* Guidelines info card for marketplace */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4 text-xs text-slate-600 leading-relaxed self-start">
            <h4 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase">
              <Coins className="w-5 h-5 text-brand-green" /> Economía Circular
            </h4>
            <p>La publicación de insumos upcycled ayuda a incentivar que más personas reciclen. Al listar tus excedentes de abono orgánico o manualidades de upcycling ecológico:</p>
            
            <ul className="list-disc pl-5 space-y-2 text-[11px] text-slate-500">
              <li>El canje con **Eco-Puntos** es completamente seguro y gratuito.</li>
              <li>Aporta visibilidad a tu marca sostenible local.</li>
              <li>ReciclApp premia con **+10 Puntos de Publicación** tras generar tus primeras tres ventas del catálogo.</li>
            </ul>
          </div>
        </div>

      ) : activeTab === 'admin-ecomarket' && userProfile.role === 'admin' ? (
        <div className="space-y-8 animate-fade-in text-xs">
          
          {/* Add product card form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5 border-b pb-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" /> Registrar Nuevo Eco-Producto
            </h3>
            <form onSubmit={handleAdminCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="admin-create-product-form">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compostera Casera Urbana"
                  value={adminNewName}
                  onChange={(e) => setAdminNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Categoría</label>
                <select
                  value={adminNewCategory}
                  onChange={(e) => setAdminNewCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                >
                  <option value="reusable">Reutilizables (Zero Waste)</option>
                  <option value="organic">Orgánicos y Compost</option>
                  <option value="eco-home">Hogar Ecológico</option>
                  <option value="upcycled">Upcycling / Reuso Creativo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Costo en Eco-Puntos</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adminNewPrice}
                  onChange={(e) => setAdminNewPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">Stock Inicial Disponible</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={adminNewStock}
                  onChange={(e) => setAdminNewStock(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-500 block">URL de Imagen Ilustrativa</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={adminNewImage}
                  onChange={(e) => setAdminNewImage(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-bold text-slate-500 block">Descripción Detallada</label>
                <textarea
                  required
                  placeholder="Describe las propiedades ecológicas y detalles de entrega..."
                  value={adminNewDescription}
                  onChange={(e) => setAdminNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  rows={2}
                />
              </div>

              <div className="space-y-1 flex items-center gap-2 pt-2 col-span-3">
                <input
                  type="checkbox"
                  id="adminNewActive"
                  checked={adminNewActive}
                  onChange={(e) => setAdminNewActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                />
                <label htmlFor="adminNewActive" className="font-bold text-slate-650 cursor-pointer select-none">
                  Marcar como Producto Activo y Disponible Inmediatamente
                </label>
              </div>

              <div className="col-span-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold uppercase rounded-lg shadow-sm cursor-pointer"
                >
                  Publicar en Ecomarket
                </button>
              </div>
            </form>
          </div>

          {/* Manage items table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide">Inventario de Productos Sostenibles ({products.length})</h3>
            
            {products.length === 0 ? (
              <p className="text-slate-400 text-center py-10 bg-slate-50 border rounded-xl" id="no-registered-products-admin">No hay ningún producto registrado en la tienda. Agrega uno arriba para activarlo.</p>
            ) : (
              <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="grid grid-cols-12 gap-2 bg-slate-50 p-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="col-span-5">Producto / Detalles</div>
                  <div className="col-span-2 text-center">Canje</div>
                  <div className="col-span-2 text-center">Stock Control</div>
                  <div className="col-span-1 text-center">Estado</div>
                  <div className="col-span-2 text-right">Acción</div>
                </div>

                {products.map(p => (
                  <div key={p.id} className="grid grid-cols-12 gap-2 p-3.5 items-center hover:bg-slate-50/40">
                    
                    {/* Item Details */}
                    <div className="col-span-5 flex gap-3">
                      <img src={p.image || p.imageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=85&w=250"} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-slate-800">{p.name}</h4>
                        <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">Cat: {p.category} | {p.description}</p>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="col-span-2 text-center font-bold text-slate-700 font-mono">
                      {p.price} Eco-Pts
                    </div>

                    {/* Stock modifier buttons */}
                    <div className="col-span-2 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                        title="Disminuir Stock"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-6 text-center text-xs text-slate-800">
                        {p.stock !== undefined ? p.stock : (p.isSold ? 0 : 1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(p.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                        title="Aumentar Stock"
                      >
                        +
                      </button>
                    </div>

                    {/* Active/Inactive state toggle */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id)}
                        className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase cursor-pointer ${
                          p.isActive !== false 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                            : 'bg-rose-50 text-rose-700 border border-rose-250'
                        }`}
                        title="Alternar Visibilidad"
                      >
                        {p.isActive !== false ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>

                    {/* Action buttons (Edit / Delete definitivamente) */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleInitiateEditProduct(p)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded font-semibold text-[10px] cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdminDeleteProduct(p.id, p.name)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-650 rounded font-bold text-[10px] cursor-pointer"
                      >
                        Borrar
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Catalog Browse List screen layout */
        <div className="space-y-6 animate-fade-in">
          
          {/* Subheader Filters bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-100 p-4 rounded-2xl">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar abonos, bombillas reusables, termos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
              />
            </div>
            
            <select
              value={selectCategory}
              onChange={(e) => setSelectCategory(e.target.value)}
              className="text-xs p-2.5 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              <option value="reusable">Reutilizables (Zero Waste)</option>
              <option value="organic">Orgánicos y Compost</option>
              <option value="eco-home">Hogar Ecológico</option>
              <option value="upcycled">Upcycling / Reuso Creativo</option>
            </select>
          </div>

          {/* Grid items lists */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-8 space-y-4 max-w-md mx-auto" id="empty-marketplace-state">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 p-1">
                <h4 className="font-display font-extrabold text-slate-805 text-sm uppercase tracking-wider">No hay productos disponibles por el momento</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  El ecomarket se encuentra actualmente vacío. Vuelve a revisar más tarde o crea nuevos productos sostenibles si posees un rol administrativo.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col justify-between group relative ${
                    product.isSold 
                      ? 'border-slate-100 opacity-60' 
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-md'
                  }`}
                >
                  {/* Photo space */}
                  <div className="relative h-44 overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={product.image || product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    {product.isSold && (
                      <span className="absolute inset-0 bg-black/40 flex items-center justify-center font-display font-extrabold text-white text-xs uppercase tracking-widest">
                        Agotado
                      </span>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-[9px] text-white rounded-md font-bold uppercase">
                      {product.category}
                    </span>
                    {product.stock !== undefined && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-650/90 text-[9px] text-white rounded-md font-bold">
                        Stock: {product.stock} un.
                      </span>
                    )}
                  </div>
 
                  {/* Info and action panel */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex gap-1 items-center">
                        <h4 className="font-display font-extrabold text-slate-805 text-sm line-clamp-1 group-hover:text-brand-green flex-1">
                          {product.name}
                        </h4>
                        {product.isActive === false && (
                          <span className="text-[9px] uppercase font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 rounded shrink-0">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed h-[34px]">
                        {product.description}
                      </p>
                    </div>
 
                    {/* Pricing line details */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wide">Valor de Canje</span>
                        <span className="font-display font-extrabold text-brand-green text-sm flex items-center gap-1">
                          {product.priceInTokens ? (
                            <>
                              <Coins className="w-3.5 h-3.5 text-brand-green-light" />
                              {product.price} <span className="text-[10px]">Eco-Pts</span>
                            </>
                          ) : (
                            `$ ${product.price} USD`
                          )}
                        </span>
                      </div>
 
                      <div className="flex gap-1">
                        {!product.isSold && product.sellerId !== userProfile.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenSellerChat(product)}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Preguntar al vendedor"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCheckoutProduct(product)}
                              className="px-3.5 py-1.5 bg-brand-green text-white font-bold text-[10.5px] uppercase rounded-lg hover:bg-brand-green-dark transition-all scale-100 hover:scale-103 cursor-pointer"
                            >
                              Canjear
                            </button>
                          </>
                        )}
                        
                        {!product.isSold && product.sellerId === userProfile.id && (
                          <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-150 rounded px-2.5 py-1.5 self-center font-semibold text-center">
                            Tu artículo
                          </span>
                        )}
                      </div>
                    </div>
 
                  </div>
 
                </div>
              ))}
            </div>
          )}
 
        </div>
      )}

      {/* Product editing modal overlay for administrator */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-800 animate-fade-in" id="edit-product-modal">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-display font-bold text-sm uppercase tracking-wide flex items-center gap-1.5 text-slate-800">
                <PlusCircle className="text-emerald-600 w-5 h-5" /> Editar Eco-Producto Sostenible
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={adminEditName}
                    onChange={(e) => setAdminEditName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Categoría del Catálogo</label>
                  <select
                    value={adminEditCategory}
                    onChange={(e) => setAdminEditCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  >
                    <option value="reusable">Reutilizables (Zero Waste)</option>
                    <option value="organic">Orgánicos y Compost</option>
                    <option value="eco-home">Hogar Ecológico</option>
                    <option value="upcycled">Upcycling / Reuso Creativo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Valor en Eco-Puntos</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={adminEditPrice}
                    onChange={(e) => setAdminEditPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Stock Disponible</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={adminEditStock}
                    onChange={(e) => setAdminEditStock(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-600 block">URL de la Imagen Ilustrativa</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={adminEditImage}
                    onChange={(e) => setAdminEditImage(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-600 block">Descripción Detallada</label>
                  <textarea
                    required
                    rows={2}
                    value={adminEditDescription}
                    onChange={(e) => setAdminEditDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3"
                  />
                </div>

                <div className="space-y-1 flex items-center gap-2 pt-2 col-span-2">
                  <input
                    type="checkbox"
                    id="adminEditActive"
                    checked={adminEditActive}
                    onChange={(e) => setAdminEditActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                  />
                  <label htmlFor="adminEditActive" className="font-bold text-slate-650 cursor-pointer select-none">
                    Producto Activo (Visible para canjes del público)
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg transition-colors shadow-sm cursor-pointer font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
 
     </div>
  );
}
