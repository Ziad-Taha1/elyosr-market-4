
import React, { useState, useEffect } from 'react';
import { Product, CartItem, AppView, OrderInfo, CATEGORIES } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Header from './components/Header';
import ProductList from './components/ProductList';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import CheckoutModal from './components/CheckoutModal';

const STORAGE_KEY = 'elyosr_products';
const THEME_KEY = 'elyosr_theme';
const ADMIN_PASSWORD = 'admin'; // Simplified for user
const WHATSAPP_PHONE = '201012345678'; // Example Egyptian number

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.CUSTOMER);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync products and theme
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return next;
    });
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOrder = (orderInfo: OrderInfo) => {
    const message = encodeURIComponent(
      `🛒 *طلب جديد من ماركت اليسر - EL YOSR*\n\n` +
      `👤 *الاسم:* ${orderInfo.name}\n` +
      `📞 *رقم الهاتف:* ${orderInfo.phone}\n` +
      `📍 *العنوان:* ${orderInfo.address}\n` +
      `${orderInfo.notes ? `📝 *ملاحظات:* ${orderInfo.notes}\n` : ''}` +
      `---------------------------\n` +
      cart.map(item => `• ${item.name} (${item.quantity} × ${item.price} ج.م)`).join('\n') +
      `\n---------------------------\n` +
      `💰 *الإجمالي الكلي:* ${cartTotal} ج.م`
    );
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, '_blank');
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === "الكل" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header 
        view={view} 
        setView={setView} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {view === AppView.CUSTOMER ? (
          <>
            {/* Search Bar Section */}
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="ابحث عن منتج بالاسم..." 
                  className="w-full pl-4 pr-12 py-4 bg-white dark:bg-darkSurface border-2 border-transparent focus:border-yosrGreen rounded-[2rem] shadow-lg outline-none transition-all dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-yosrGreen">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8 flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-bold border-2 ${
                    selectedCategory === cat 
                      ? 'bg-yosrOrange border-yosrOrange text-yosrGreen shadow-lg scale-105' 
                      : 'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-yosrGreen'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <ProductList 
              products={filteredProducts} 
              onAddToCart={addToCart} 
            />
          </>
        ) : (
          <AdminDashboard 
            products={products} 
            onSaveProducts={saveProducts} 
            adminPassword={ADMIN_PASSWORD}
          />
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={handleOrder}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {!isCartOpen && view === AppView.CUSTOMER && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 left-6 bg-yosrOrange text-yosrGreen p-4 rounded-full shadow-2xl lg:hidden hover:scale-110 active:scale-95 transition-all z-40 border-2 border-yosrGreen"
        >
          <div className="relative">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-darkBg">
                {cart.length}
              </span>
            )}
          </div>
        </button>
      )}

      <footer className="bg-yosrGreen dark:bg-black text-white py-12 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <div className="logo-oval inline-block px-8 py-4 mb-6">
            <h2 className="text-2xl font-black text-yosrGreen leading-none">ماركت اليسر</h2>
            <p className="text-xs font-bold text-yosrGreen opacity-80 mt-1">EL YOSR</p>
          </div>
          <p className="text-gray-300 mb-2">خدمتكم هي سر سعادتنا</p>
          <p className="text-gray-500 text-sm">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
