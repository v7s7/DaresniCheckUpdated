import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useTranslation } from "../lib/i18n";
import { authService } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, userProfile } = useAuth();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-lg"></i>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Daresni</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/search" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                location === '/search' 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              data-testid="nav-find-tutors"
            >
              {t('nav.findTutors')}
            </Link>
            <Link 
              href="/become-tutor" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              data-testid="nav-become-tutor"
            >
              {t('nav.becomeTutor')}
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              data-testid="nav-how-it-works"
            >
              {t('nav.howItWorks')}
            </Link>
          </nav>

          {/* Auth & Language */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <button 
                className={`px-2 py-1 font-medium ${
                  language === 'en' ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
                }`}
                onClick={() => setLanguage('en')}
                data-testid="lang-en"
              >
                EN
              </button>
              <span className="text-gray-300">|</span>
              <button 
                className={`px-2 py-1 font-medium ${
                  language === 'ar' ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
                }`}
                onClick={() => setLanguage('ar')}
                data-testid="lang-ar"
              >
                AR
              </button>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/dashboard"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="nav-dashboard"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="button-logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="nav-login"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    data-testid="nav-signup"
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-400 hover:text-gray-500 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link 
                href="/search" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-find-tutors"
              >
                {t('nav.findTutors')}
              </Link>
              <Link 
                href="/become-tutor" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-become-tutor"
              >
                {t('nav.becomeTutor')}
              </Link>
              {!isAuthenticated && (
                <>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-login"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-base font-medium bg-primary-500 text-white rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-signup"
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
