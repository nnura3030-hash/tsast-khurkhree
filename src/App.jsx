import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import { CartProvider }     from './context/CartContext';
import { ToastProvider }    from './context/ToastContext';
import { ThemeProvider }    from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import PageProgress   from './components/PageProgress';
import OfflineBanner  from './components/OfflineBanner';
import Layout         from './components/Layout';
import { ThemeFloating } from './components/ThemeToggle';

/* ─── Eager: always needed ─── */
import Home from './pages/Home';

/* ─── Lazy: loaded on demand ─── */
const Search          = lazy(() => import('./pages/Search'));
const About           = lazy(() => import('./pages/About'));
const Location        = lazy(() => import('./pages/Location'));
const Resort          = lazy(() => import('./pages/Resort'));
const Nature          = lazy(() => import('./pages/Nature'));
const Wildlife        = lazy(() => import('./pages/Wildlife'));
const CompanyRules    = lazy(() => import('./pages/CompanyRules'));
const Terms           = lazy(() => import('./pages/Terms'));
const GerServices     = lazy(() => import('./pages/GerServices'));
const GerDetails      = lazy(() => import('./pages/GerDetails'));
const TripServices    = lazy(() => import('./pages/TripServices'));
const TripDetails     = lazy(() => import('./pages/TripDetails'));
const FoodServices    = lazy(() => import('./pages/FoodServices'));
const ProductServices = lazy(() => import('./pages/ProductServices'));
const ProductDetails  = lazy(() => import('./pages/ProductDetails'));
const Cart            = lazy(() => import('./pages/Cart'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const Profile         = lazy(() => import('./pages/Profile'));
const Login           = lazy(() => import('./pages/Login'));
const Signup          = lazy(() => import('./pages/Signup'));
const NotFound        = lazy(() => import('./pages/NotFound'));

/* ─── Loading fallback ─── */
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080809] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
        <p className="text-white/20 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <SettingsProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <PageProgress />
            <OfflineBanner />

            <div className="bg-[#F8F5EF] dark:bg-[#080809] min-h-screen font-sans flex flex-col relative text-[#1A1714] dark:text-white transition-colors duration-300">
              <ThemeFloating />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index              element={<Home />} />
                    <Route path="search"      element={<Search />} />
                    <Route path="about"       element={<About />} />
                    <Route path="location"    element={<Location />} />
                    <Route path="resort"      element={<Resort />} />
                    <Route path="nature"      element={<Nature />} />
                    <Route path="wildlife"    element={<Wildlife />} />
                    <Route path="company-rules" element={<CompanyRules />} />
                    <Route path="terms"       element={<Terms />} />
                    <Route path="gers"        element={<GerServices />} />
                    <Route path="ger/:id"     element={<GerDetails />} />
                    <Route path="trips"       element={<TripServices />} />
                    <Route path="trip/:id"    element={<TripDetails />} />
                    <Route path="foods"       element={<FoodServices />} />
                    <Route path="products"    element={<ProductServices />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="cart"        element={<Cart />} />
                    <Route path="*"           element={<NotFound />} />
                  </Route>

                  <Route path="/admin"   element={<AdminDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/login"   element={<Login />} />
                  <Route path="/signup"  element={<Signup />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </ToastProvider>
      </CartProvider>
      </SettingsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
