import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "../lib/i18n";
import { api } from "../lib/api";
import TutorCard from "../components/TutorCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { t } = useTranslation();
  const [searchFilters, setSearchFilters] = useState({
    subject: '',
    level: '',
    budget: ''
  });

  // Fetch featured tutors
  const { data: featuredTutors = [], isLoading } = useQuery({
    queryKey: ['featured-tutors'],
    queryFn: async () => {
      const tutors = await api.getTutors({ 
        verified: true, 
        orderBy: 'ratingAvg', 
        limit: 3 
      });
      
      // Get subjects for each tutor
      const tutorsWithSubjects = await Promise.all(
        tutors.map(async (tutor) => {
          const subjects = await api.getTutorSubjects(tutor.id);
          return { ...tutor, subjects };
        })
      );
      
      return tutorsWithSubjects;
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search page with filters
    const params = new URLSearchParams();
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-50 to-secondary-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Find the Perfect 
                <span className="text-primary-600"> Tutor</span> 
                for Your Learning Journey
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                {t('hero.subtitle')}
              </p>
              
              {/* Search Form */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.subject')}
                      </label>
                      <Select 
                        value={searchFilters.subject}
                        onValueChange={(value) => setSearchFilters(prev => ({ ...prev, subject: value }))}
                      >
                        <SelectTrigger data-testid="select-hero-subject">
                          <SelectValue placeholder="Select subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="physics">Physics</SelectItem>
                          <SelectItem value="chemistry">Chemistry</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="arabic">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.level')}
                      </label>
                      <Select 
                        value={searchFilters.level}
                        onValueChange={(value) => setSearchFilters(prev => ({ ...prev, level: value }))}
                      >
                        <SelectTrigger data-testid="select-hero-level">
                          <SelectValue placeholder="Any level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary">Elementary</SelectItem>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('form.budget')}
                      </label>
                      <Select 
                        value={searchFilters.budget}
                        onValueChange={(value) => setSearchFilters(prev => ({ ...prev, budget: value }))}
                      >
                        <SelectTrigger data-testid="select-hero-budget">
                          <SelectValue placeholder="Any budget..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10-25">$10-25/hour</SelectItem>
                          <SelectItem value="25-50">$25-50/hour</SelectItem>
                          <SelectItem value="50-100">$50-100/hour</SelectItem>
                          <SelectItem value="100+">$100+/hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-3 text-lg"
                    data-testid="button-hero-search"
                  >
                    <i className="fas fa-search mr-2"></i>
                    {t('hero.searchButton')}
                  </Button>
                </form>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center" data-testid="trust-tutors">
                  <i className="fas fa-check-circle text-primary-500 mr-2"></i>
                  <span>1000+ {t('trust.verifiedTutors')}</span>
                </div>
                <div className="flex items-center" data-testid="trust-rating">
                  <i className="fas fa-star text-yellow-400 mr-2"></i>
                  <span>4.9/5 {t('trust.averageRating')}</span>
                </div>
                <div className="flex items-center" data-testid="trust-support">
                  <i className="fas fa-clock text-primary-500 mr-2"></i>
                  <span>{t('trust.support')}</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img 
                src="https://i.ibb.co/jPjMmwcD/young-men-studying-exam-1421-3639.png?auto=format&fit=crop&w=800&h=600" 
                alt="Students studying together" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg" data-testid="card-stats">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-primary-600 text-lg"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15,000+</div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Top-Rated Tutors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn from experienced educators who are passionate about helping you succeed
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center" data-testid="loading-tutors">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="featured-tutors">
                {featuredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/search">
                  <Button size="lg" data-testid="button-view-all-tutors">
                    View All Tutors
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Daresni Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with your learning journey in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center" data-testid="step-1">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Find Your Tutor</h3>
              <p className="text-gray-600">
                Browse through our verified tutors, read reviews, and find the perfect match for your subject and learning style.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center" data-testid="step-2">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-alt text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Book a Session</h3>
              <p className="text-gray-600">
                Choose a convenient time from your tutor's availability and book your session instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center" data-testid="step-3">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-video text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Start Learning</h3>
              <p className="text-gray-600">
                Join your online session and start learning with personalized 1-on-1 attention from your tutor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Safety is Our Priority</h2>
              <p className="text-lg text-gray-600 mb-8">
                We ensure a safe and secure learning environment through our comprehensive verification process.
              </p>

              <div className="space-y-6">
                <div className="flex items-start" data-testid="safety-verified">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verified Tutors</h3>
                    <p className="text-gray-600">All tutors go through background checks and qualification verification</p>
                  </div>
                </div>
                
                <div className="flex items-start" data-testid="safety-payments">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="fas fa-shield-alt text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                    <p className="text-gray-600">Your payments are protected with bank-level security</p>
                  </div>
                </div>
                
                <div className="flex items-start" data-testid="safety-support">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="fas fa-headset text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                    <p className="text-gray-600">Our support team is always here to help you</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Secure online learning" 
                className="rounded-xl shadow-lg w-full h-auto"
                data-testid="img-safety"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students who have improved their grades with Daresni
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-50"
                data-testid="button-cta-find-tutor"
              >
                Find a Tutor
              </Button>
            </Link>
            <Link href="/register?role=tutor">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
                data-testid="button-cta-become-tutor"
              >
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
