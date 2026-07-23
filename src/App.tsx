import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, ChevronRight, X, Trash2, Utensils, Facebook, MapPin, Loader2, Gift, Star, Search, Flame, Sparkles, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSheetData, submitSheetData, SheetDish, SheetCategory, SHEET_ID } from './services/googleSheets';
import { DEFAULT_MENU_DATA, Category, Dish } from './data/menuData';

// ==========================================
// 📋 CONFIGURACIÓN DE LA PLANTILLA DEL MENÚ
// ==========================================
const RESTAURANTE_NAME = "FUSIÓN";
const RESTAURANTE_SUBTITLE = "Criollo - Andino";
const RESTAURANTE_SLOGAN = "Sabor Criollo & Andino • Menús del Día y Platos a la Carta";
const WHATSAPP_NUMBER = "51945576620";
const FACEBOOK_URL = "https://facebook.com";
const MAPS_URL = "https://maps.google.com";
const LOGO_PATH = "/logo.png";
const BANNER_PATH = "/banner.png";
const MARQUEE_TEXT = "🔥 MENÚ DEL DÍA CON SOPA O ENTRADA + REFRESCO • PEDIDOS A WHATSAPP: 945 576 620 • ";
// ==========================================

interface CartItem {
  nombre: string;
  precio: string;
  cantidad: number;
  nota?: string;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Dish Customization Modal (Choice of Entrada & Notes)
  const [selectedDishForModal, setSelectedDishForModal] = useState<Dish | null>(null);
  const [selectedEntrada, setSelectedEntrada] = useState<string>('Sopa de Choro');
  const [customNote, setCustomNote] = useState<string>('');

  // States for Birthday Form
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);
  const [isSubmittingBirthday, setIsSubmittingBirthday] = useState(false);
  const [birthdaySuccess, setBirthdaySuccess] = useState(false);
  const [birthdayData, setBirthdayData] = useState({
    nombre: '',
    telefono: '',
    fechaNacimiento: '',
    distrito: '',
    correo: ''
  });

  // States for Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewData, setReviewData] = useState({
    estrellasMozo: 0,
    estrellasComida: 0,
    comentario: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!SHEET_ID) {
          setCategories(DEFAULT_MENU_DATA);
          if (DEFAULT_MENU_DATA.length > 0) {
            setActiveCategory(DEFAULT_MENU_DATA[0].id);
          }
          return;
        }

        const [cats, dishes] = await Promise.all([
          fetchSheetData<SheetCategory>('Categorías'),
          fetchSheetData<SheetDish>('Platos')
        ]);

        if (cats.length === 0 && dishes.length === 0) {
          setCategories(DEFAULT_MENU_DATA);
          if (DEFAULT_MENU_DATA.length > 0) {
            setActiveCategory(DEFAULT_MENU_DATA[0].id);
          }
          return;
        }

        const formattedCategories: Category[] = cats.map(c => ({
          id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
          nombre: c.nombre,
          items: dishes
            .filter(d => d.categoría === c.nombre)
            .map(d => ({
              nombre: d['nombre del plato'],
              descripcion: d.descripción,
              precio: d.precio,
              imagen: d['URL de imagen'] || undefined
            }))
        }));

        setCategories(formattedCategories);
        if (formattedCategories.length > 0) {
          setActiveCategory(formattedCategories[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setCategories(DEFAULT_MENU_DATA);
        if (DEFAULT_MENU_DATA.length > 0) {
          setActiveCategory(DEFAULT_MENU_DATA[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.cantidad, 0), [cart]);

  // Filter dishes by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.nombre.toLowerCase().includes(q) ||
            (item.descripcion && item.descripcion.toLowerCase().includes(q))
        )
      }))
      .filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  const handleOpenDishModal = (dish: Dish) => {
    // If it's a main menu dish, let user pick their Entrada/Sopa
    if (dish.precio.startsWith('S/.')) {
      setSelectedDishForModal(dish);
      setSelectedEntrada('Sopa de Choro');
      setCustomNote('');
    } else {
      addToCart(dish);
    }
  };

  const handleConfirmAddModal = () => {
    if (!selectedDishForModal) return;
    const fullNote = `Entrada: ${selectedEntrada}${customNote ? ` | Nota: ${customNote}` : ''}`;
    addToCart(selectedDishForModal, fullNote);
    setSelectedDishForModal(null);
  };

  const addToCart = (dish: Dish, nota?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.nombre === dish.nombre && i.precio === dish.precio && i.nota === nota);
      if (existing) {
        return prev.map(i =>
          (i.nombre === dish.nombre && i.precio === dish.precio && i.nota === nota)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { nombre: dish.nombre, precio: dish.precio, cantidad: 1, nota }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const calculateDishesSubtotal = () => {
    return cart.reduce((acc, item) => {
      const cleanPrice = item.precio.replace(/^[^\d.]*/, '');
      const num = parseFloat(cleanPrice) || 0;
      return acc + num * item.cantidad;
    }, 0);
  };

  const calculateTaperTotal = () => {
    return cartCount * 1.00;
  };

  const calculateTotal = () => {
    return calculateDishesSubtotal() + calculateTaperTotal();
  };

  const sendToWhatsApp = () => {
    const taperTotal = calculateTaperTotal();
    const total = calculateTotal();
    let message = `*Hola ${RESTAURANTE_NAME} (${RESTAURANTE_SUBTITLE}), deseo realizar un pedido:*\n\n`;
    cart.forEach(item => {
      message += `• *${item.cantidad}x* ${item.nombre} - _${item.precio}_\n`;
      if (item.nota) {
        message += `   ↳ _${item.nota}_\n`;
      }
    });
    message += `\n📦 *Empaque / Táper para llevar (${cartCount}x S/. 1.00): S/. ${taperTotal.toFixed(2)}*`;
    message += `\n🥤 *Incluye Refresco de Manzana*\n`;
    message += `\n💰 *TOTAL A PAGAR: S/. ${total.toFixed(2)}*\n\n`;
    message += `¡Muchas gracias! Quedo atento a la confirmación.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBirthdaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBirthday(true);
    const success = await submitSheetData('Cumpleaños', {
      timestamp: new Date().toLocaleString('es-PE'),
      nombre: birthdayData.nombre,
      telefono: birthdayData.telefono,
      fechaNacimiento: birthdayData.fechaNacimiento,
      distrito: birthdayData.distrito,
      correo: birthdayData.correo || 'No indicado'
    });
    
    setIsSubmittingBirthday(false);
    if (success) {
      setBirthdaySuccess(true);
      setTimeout(() => {
        setShowBirthdayForm(false);
        setBirthdaySuccess(false);
        setBirthdayData({ nombre: '', telefono: '', fechaNacimiento: '', distrito: '', correo: '' });
      }, 3000);
    } else {
      alert("Hubo un error al enviar tus datos. Por favor, inténtalo de nuevo.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewData.estrellasMozo === 0 || reviewData.estrellasComida === 0) {
      alert("Por favor califica ambas opciones con estrellas.");
      return;
    }

    setIsSubmittingReview(true);
    const success = await submitSheetData('Reseñas', {
      timestamp: new Date().toLocaleString('es-PE'),
      estrellasMozo: reviewData.estrellasMozo,
      estrellasComida: reviewData.estrellasComida,
      comentario: reviewData.comentario || 'Sin comentarios'
    });
    
    setIsSubmittingReview(false);
    if (success) {
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
        setReviewData({ estrellasMozo: 0, estrellasComida: 0, comentario: '' });
      }, 3000);
    } else {
      alert("Hubo un error al enviar tu reseña. Por favor, inténtalo de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF6F0]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-slogan text-primary font-bold tracking-widest uppercase text-xs">Cargando la carta de Fusión Criollo - Andino...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 px-5 py-3 flex justify-between items-center border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3">
          {LOGO_PATH ? (
            <img src={LOGO_PATH} alt={RESTAURANTE_NAME} className="w-11 h-11 object-contain rounded-xl shadow-md border border-amber-200" />
          ) : (
            <div className="w-11 h-11 bg-primary text-white font-title font-bold text-xl rounded-xl flex items-center justify-center">F</div>
          )}
          <div className="flex flex-col items-start">
            <h1 className="font-title text-[24px] text-primary leading-none tracking-wide font-black flex items-center gap-1">
              {RESTAURANTE_NAME}
              <span className="text-[12px] bg-secondary/15 text-secondary font-sans font-extrabold px-2 py-0.5 rounded-full">Criollo - Andino</span>
            </h1>
            <span className="font-slogan text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">{RESTAURANTE_SLOGAN}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer"
            title="Pedir por WhatsApp"
          >
            <MessageCircle size={20} />
          </motion.a>
          <motion.div
            onClick={() => cartCount > 0 && setShowSummary(true)}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center relative cursor-pointer"
          >
            <ShoppingBag size={20} className="text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 bg-secondary text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </motion.div>
        </div>
      </header>

      {/* Marquee Header Banner */}
      <div className="w-full bg-gradient-to-r from-primary via-amber-700 to-secondary py-2 overflow-hidden flex items-center shadow-inner">
        <div className="animate-marquee flex gap-6 text-white font-slogan font-bold text-[11px] tracking-widest uppercase whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-2">
              <Flame size={14} className="text-amber-300 fill-amber-300 animate-pulse" />
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Birthday Promo Banner */}
      <div className="px-5 pt-3">
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          animate={{ 
            boxShadow: ["0px 0px 0px 0px rgba(217,119,6,0.6)", "0px 0px 16px 6px rgba(217,119,6,0)", "0px 0px 0px 0px rgba(217,119,6,0)"] 
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => setShowBirthdayForm(true)}
          className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-primary text-white py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wide border border-amber-400 relative overflow-hidden group text-center shadow-md"
        >
          <div className="absolute inset-0 shimmer opacity-30 mix-blend-overlay"></div>
          <Gift size={18} className="animate-bounce shrink-0 text-amber-200" />
          <span>¡Celébralo con Fusión! 🎂 <span className="text-amber-200 font-black underline">Registra tu cumple</span> y recibe un postre/bebida especial de regalo. 🎁</span>
        </motion.button>
      </div>

      {/* Restaurant Hero Image */}
      <div className="px-5 pt-3 pb-2">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md aspect-[2.2/1] bg-stone-900 flex flex-col items-center justify-center border border-amber-900/20 group">
          <img 
            src={BANNER_PATH} 
            alt="Fusión Criollo - Andino" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Menú Diario & A la Carta</span>
              <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">De S/. 13 a S/. 23</span>
            </div>
            <h2 className="text-white font-title text-xl font-bold leading-tight mt-1">Sabor Auténtico Criollo & Andino</h2>
            <p className="text-amber-200/90 text-[11px] font-medium">Incluye Sopa o Entrada + Refresco de Manzana 🍎</p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-5 py-2">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar plato (ej: ceviche, chaufa, lomo)..."
            className="w-full pl-10 pr-4 py-2 bg-stone-100/80 border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-gray-400 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Selector */}
      <div className="px-5 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-category font-semibold whitespace-nowrap transition-all duration-200 border
                ${activeCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-primary/40 hover:text-primary'
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 px-5 pt-2">
        {filteredCategories.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-8 scroll-mt-28">
            <div className="mb-3 pt-2 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Utensils className="text-primary wave-icon" size={20} />
                <h3 className="font-category font-bold text-primary text-[22px] leading-none tracking-wide category-underline">
                  {cat.nombre}
                </h3>
              </div>
              {cat.descripcion && (
                <p className="text-[11px] text-stone-500 font-medium mt-1">
                  ✨ {cat.descripcion}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {cat.items.map((dish, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl p-3.5 flex items-center justify-between shadow-sm border border-stone-100 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-dish font-bold text-stone-800 text-[14px] leading-snug">
                        {dish.nombre}
                      </h4>
                      {dish.badge && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                          {dish.badge}
                        </span>
                      )}
                    </div>
                    {dish.descripcion && (
                      <p className="text-[11px] text-stone-500 leading-relaxed mb-1.5">
                        {dish.descripcion}
                      </p>
                    )}
                    <span className="font-dish font-extrabold text-primary text-[15px] inline-block">
                      {dish.precio}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenDishModal(dish)}
                      className="bg-primary/10 hover:bg-primary hover:text-white text-primary px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors duration-200 border border-primary/20"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Agregar</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}

        {/* Customer Review Section */}
        <section className="mt-6 mb-4 border border-stone-200 bg-stone-50 rounded-3xl p-5 text-center shadow-sm">
          <h3 className="font-title text-primary text-[22px] leading-tight mb-1">¿Cómo estuvo tu experiencia?</h3>
          <p className="text-[11px] text-stone-500 mb-4 px-2">Nos ayuda mucho saber tu opinión sobre Fusión Criollo - Andino</p>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 mx-auto w-full uppercase tracking-wider"
          >
            <Star size={18} className="fill-amber-300 text-amber-300" />
            Dejar una Reseña
          </motion.button>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 pb-6 border-t border-stone-200 flex flex-col items-center justify-center text-center">
          <img src={LOGO_PATH} alt={RESTAURANTE_NAME} className="w-16 h-16 object-contain rounded-2xl shadow-md border border-amber-200 mb-3" />
          <p className="font-title text-2xl text-primary font-bold">{RESTAURANTE_NAME} {RESTAURANTE_SUBTITLE}</p>
          <p className="text-xs text-stone-500 font-medium max-w-xs mt-1 mb-4">{RESTAURANTE_SLOGAN}</p>
          <div className="flex items-center gap-3 text-xs text-stone-600 font-semibold mb-4">
            <span className="flex items-center gap-1"><Phone size={14} className="text-primary" /> 945 576 620</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> Delivery & Presencial</span>
          </div>
          <p className="text-[10px] text-stone-400 font-medium">© 2026 Todos los derechos reservados.</p>
        </footer>

        {/* Branding footer bar */}
        <div className="bg-stone-900 -mx-5 py-4 flex flex-col items-center justify-center text-stone-400">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1 opacity-60 text-white">Digital Menu Experience</p>
          <motion.a 
            href="https://tymasolutions.lat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-xs tracking-tight group cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white group-hover:text-[#00BFFF] transition-colors duration-200">Hecho por Tyma</span>
            <span className="text-[#00BFFF] group-hover:text-white transition-colors duration-200">Solutions</span>
          </motion.a>
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && !showSummary && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full max-w-md p-4 z-40"
          >
            <div className="glass rounded-[2rem] p-3.5 flex items-center justify-between border border-amber-200 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="shimmer absolute inset-0 opacity-20"></div>
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tu Pedido</p>
                  <p className="font-bold text-stone-900 text-base leading-tight">{cartCount} Artículos • S/. {calculateTotal().toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummary(true)}
                className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/30 font-bold text-xs uppercase tracking-wider"
              >
                Ver Pedido
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Selection / Entrada choice for Dish */}
      <AnimatePresence>
        {selectedDishForModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedDishForModal(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500"
              >
                <X size={18} />
              </button>

              <div className="mb-4">
                <span className="text-[10px] bg-primary/10 text-primary font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Personalizar Menú
                </span>
                <h3 className="font-title text-xl font-bold text-stone-900 mt-1">
                  {selectedDishForModal.nombre}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{selectedDishForModal.precio}</p>
              </div>

              {/* Entrada Selection */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  1. Selecciona tu Entrada o Sopa (Incluida):
                </label>
                <div className="space-y-1.5">
                  {[
                    "Sopa de Choro",
                    "Sopa de Pollo",
                    "Alita Broaster",
                    "Ceviche de Pescado",
                    "Huevo a la Rusa",
                    "Ocopa",
                    "Ensalada de Palta"
                  ].map(entradaOption => (
                    <label
                      key={entradaOption}
                      onClick={() => setSelectedEntrada(entradaOption)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedEntrada === entradaOption
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span>{entradaOption}</span>
                      {selectedEntrada === entradaOption && (
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra note */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  2. Observaciones adicionales (Opcional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ej: Sin picante, pollo bien frito..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 mb-5">
                <p className="text-[10px] text-amber-900 font-semibold flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  Incluye Refresco de Manzana de cortesía.
                </p>
              </div>

              <button
                onClick={handleConfirmAddModal}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Agregar al Pedido ({selectedDishForModal.precio})
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 lg:p-0"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[3rem] p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-primary" size={24} />
                  <h2 className="font-title text-2xl text-primary font-bold">Mi Pedido</h2>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center"
                >
                  <X size={20} className="text-stone-400" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-stone-50 p-3.5 rounded-2xl border border-stone-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-dish font-bold text-stone-900 text-sm">{item.nombre}</h4>
                        <p className="font-dish text-xs text-primary font-bold">{item.precio}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-stone-200">
                        <button onClick={() => updateQuantity(index, -1)} className="text-stone-400 p-0.5">
                          <Minus size={14} />
                        </button>
                        <span className="font-dish font-bold text-xs w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="text-primary p-0.5">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => updateQuantity(index, -item.cantidad)}
                        className="text-red-400 hover:text-red-600 p-1 ml-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.nota && (
                      <p className="text-[10px] text-stone-500 italic mt-1 bg-white/70 px-2 py-1 rounded-lg border border-stone-100">
                        {item.nota}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-900 font-semibold">
                  Todos los menús incluyen Refresco de Manzana natural.
                </p>
              </div>

              <div className="border-t border-dashed border-stone-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between items-center text-xs text-stone-600">
                  <span>Subtotal Platos</span>
                  <span className="font-semibold">S/. {calculateDishesSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-stone-600">
                  <span className="flex items-center gap-1">📦 Empaque / Táper ({cartCount} x S/. 1.00)</span>
                  <span className="font-semibold text-stone-800">+ S/. {calculateTaperTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                  <h3 className="font-dish text-lg font-bold text-stone-900">Total a pagar</h3>
                  <h3 className="font-dish text-xl font-extrabold text-primary">S/. {calculateTotal().toFixed(2)}</h3>
                </div>
              </div>

              <button
                onClick={sendToWhatsApp}
                className="w-full bg-[#25D366] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-green-100 hover:scale-[1.02] transition-transform font-bold text-sm uppercase tracking-wider"
              >
                <MessageCircle size={20} />
                Enviar Pedido a WhatsApp
                <ChevronRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birthday Form Modal */}
      <AnimatePresence>
        {showBirthdayForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowBirthdayForm(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-400"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                  <Gift size={24} className="text-secondary" />
                </div>
                <h2 className="font-title text-2xl text-stone-900 leading-none mb-1">¡Registro de Cumpleaños!</h2>
                <p className="text-xs text-stone-500">Déjanos tus datos para enviarte una deliciosa sorpresa en tu día especial.</p>
              </div>

              {birthdaySuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-center text-sm font-bold border border-green-200">
                  ¡Gracias! Tus datos han sido registrados con éxito.
                </div>
              ) : (
                <form onSubmit={handleBirthdaySubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Nombre Completo</label>
                    <input required type="text" value={birthdayData.nombre} onChange={e => setBirthdayData({...birthdayData, nombre: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Teléfono</label>
                    <input required type="tel" minLength={9} maxLength={11} pattern="[0-9]*" value={birthdayData.telefono} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setBirthdayData({...birthdayData, telefono: val});
                    }} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Ej. 987654321" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Fecha de Nacimiento</label>
                    <input required type="date" value={birthdayData.fechaNacimiento} onChange={e => setBirthdayData({...birthdayData, fechaNacimiento: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors text-stone-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Distrito</label>
                    <input required type="text" value={birthdayData.distrito} onChange={e => setBirthdayData({...birthdayData, distrito: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Ej. Lima" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Correo Electrónico (Opcional)</label>
                    <input type="email" value={birthdayData.correo} onChange={e => setBirthdayData({...birthdayData, correo: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="correo@ejemplo.com" />
                  </div>
                  
                  <button disabled={isSubmittingBirthday} type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-secondary/20 mt-2 disabled:opacity-70 flex justify-center items-center uppercase tracking-wider">
                    {isSubmittingBirthday ? <Loader2 size={18} className="animate-spin" /> : "Guardar mis datos"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowReviewForm(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-400"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                  <Star size={24} className="text-primary fill-primary" />
                </div>
                <h2 className="font-title text-2xl text-stone-900 leading-none mb-1">¡Tu Opinión Cuenta!</h2>
                <p className="text-xs text-stone-500">Ayúdanos a brindarte siempre la mejor sazón.</p>
              </div>

              {reviewSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-center text-sm font-bold border border-green-200">
                  ¡Muchas gracias por tu reseña!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col items-center">
                    <p className="text-xs font-bold text-stone-700 mb-2">Atención y Servicio</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} type="button" 
                          onClick={() => setReviewData({...reviewData, estrellasMozo: star})}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star size={26} className={reviewData.estrellasMozo >= star ? "text-amber-400 fill-amber-400" : "text-stone-300"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col items-center">
                    <p className="text-xs font-bold text-stone-700 mb-2">Sabor y Calidad de Comida</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} type="button" 
                          onClick={() => setReviewData({...reviewData, estrellasComida: star})}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star size={26} className={reviewData.estrellasComida >= star ? "text-amber-400 fill-amber-400" : "text-stone-300"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase ml-1">Comentario (Opcional)</label>
                    <textarea 
                      rows={3} 
                      value={reviewData.comentario} 
                      onChange={e => setReviewData({...reviewData, comentario: e.target.value})} 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none mt-1" 
                      placeholder="Cuéntanos qué plato te gustó más..." 
                    />
                  </div>
                  
                  <button disabled={isSubmittingReview} type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-primary/20 mt-2 disabled:opacity-70 flex justify-center items-center uppercase tracking-wider">
                    {isSubmittingReview ? <Loader2 size={18} className="animate-spin" /> : "Enviar Reseña"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
