// Internationalization module
import { useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    'nav.findTutors': 'Find Tutors',
    'nav.becomeTutor': 'Become a Tutor',
    'nav.howItWorks': 'How it Works',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    
    // Hero section
    'hero.title': 'Find the Perfect Tutor for Your Learning Journey',
    'hero.subtitle': 'Connect with verified expert tutors in over 50+ subjects. Get personalized 1-on-1 sessions that fit your schedule and learning style.',
    'hero.searchButton': 'Find Tutors',
    
    // Trust indicators
    'trust.verifiedTutors': 'Verified Tutors',
    'trust.averageRating': 'Average Rating',
    'trust.support': '24/7 Support',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.close': 'Close',
    
    // Forms
    'form.email': 'Email',
    'form.password': 'Password',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.subject': 'Subject',
    'form.level': 'Level',
    'form.budget': 'Budget',
    
    // Auth
    'auth.loginTitle': 'Log In',
    'auth.signupTitle': 'Sign Up',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.rememberMe': 'Remember me',
    
    // Dashboard
    'dashboard.upcomingSessions': 'Upcoming Sessions',
    'dashboard.pastSessions': 'Past Sessions',
    'dashboard.totalSessions': 'Total Sessions',
    'dashboard.totalEarnings': 'Total Earnings',
    
    // Booking
    'booking.selectTime': 'Select Time',
    'booking.confirmBooking': 'Confirm Booking',
    'booking.sessionWith': 'Session with',
    'booking.duration': 'Duration',
    'booking.price': 'Price',
    
    // Reviews
    'reviews.writeReview': 'Write a Review',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Comment',
    'reviews.submitReview': 'Submit Review'
  },
  
  ar: {
    // Navigation  
    'nav.findTutors': 'ابحث عن معلمين',
    'nav.becomeTutor': 'كن معلماً',
    'nav.howItWorks': 'كيف يعمل',
    'nav.login': 'دخول',
    'nav.signup': 'تسجيل',
    
    // Hero section
    'hero.title': 'اعثر على المعلم المثالي لرحلة التعلم الخاصة بك',
    'hero.subtitle': 'تواصل مع معلمين خبراء معتمدين في أكثر من 50+ مادة. احصل على جلسات شخصية فردية تناسب جدولك وأسلوب التعلم الخاص بك.',
    'hero.searchButton': 'ابحث عن معلمين',
    
    // Trust indicators
    'trust.verifiedTutors': 'معلمين معتمدين',
    'trust.averageRating': 'متوسط التقييم',
    'trust.support': 'دعم 24/7',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    
    // Forms
    'form.email': 'البريد الإلكتروني',
    'form.password': 'كلمة المرور',
    'form.firstName': 'الاسم الأول',
    'form.lastName': 'اسم العائلة',
    'form.subject': 'المادة',
    'form.level': 'المستوى',
    'form.budget': 'الميزانية',
    
    // Auth
    'auth.loginTitle': 'دخول',
    'auth.signupTitle': 'تسجيل جديد',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.rememberMe': 'تذكرني',
    
    // Dashboard
    'dashboard.upcomingSessions': 'الجلسات القادمة',
    'dashboard.pastSessions': 'الجلسات السابقة',
    'dashboard.totalSessions': 'إجمالي الجلسات',
    'dashboard.totalEarnings': 'إجمالي الأرباح',
    
    // Booking
    'booking.selectTime': 'اختر الوقت',
    'booking.confirmBooking': 'تأكيد الحجز',
    'booking.sessionWith': 'جلسة مع',
    'booking.duration': 'المدة',
    'booking.price': 'السعر',
    
    // Reviews
    'reviews.writeReview': 'اكتب مراجعة',
    'reviews.rating': 'التقييم',
    'reviews.comment': 'تعليق',
    'reviews.submitReview': 'إرسال المراجعة'
  }
};

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.fallbackLanguage = 'en';
  }
  
  setLanguage(language) {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      
      // Update document direction for RTL languages
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Trigger re-render of components
      window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
    }
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  t(key, params = {}) {
    const translation = translations[this.currentLanguage]?.[key] || 
                      translations[this.fallbackLanguage]?.[key] || 
                      key;
    
    // Simple parameter replacement
    return Object.keys(params).reduce((text, param) => {
      return text.replace(`{{${param}}}`, params[param]);
    }, translation);
  }
  
  isRTL() {
    return this.currentLanguage === 'ar';
  }
}

export const i18n = new I18n();

// React hook for using translations
export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);
  
  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    isRTL: i18n.isRTL()
  };
}

export default i18n;
