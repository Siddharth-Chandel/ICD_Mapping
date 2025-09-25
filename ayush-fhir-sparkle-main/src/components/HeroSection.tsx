import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Globe, Shield, ArrowDown } from "lucide-react";

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToContent = () => {
    document.getElementById('welcome-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="hero-section min-h-[100vh] flex items-center justify-center relative text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-40 right-40 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-glow">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-glow" style={{ animationDelay: '1s' }}>
                <Zap className="h-8 w-8" />
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-glow" style={{ animationDelay: '2s' }}>
                <Globe className="h-8 w-8" />
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-glow" style={{ animationDelay: '3s' }}>
                <Shield className="h-8 w-8" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight">
            <span className="text-white drop-shadow-2xl">Ayush</span>
            <br />
            <span className="text-white drop-shadow-2xl">Interop & FHIR</span>
          </h1>

          <p className="text-xl md:text-2xl text-white drop-shadow-lg mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced Healthcare Interoperability Platform for seamless medical data exchange, 
            coding system translation, and FHIR compliance
          </p>

          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">8+</div>
              <div className="text-sm text-white/70">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">4</div>
              <div className="text-sm text-white/70">Coding Systems</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">100%</div>
              <div className="text-sm text-white/70">FHIR Compliant</div>
            </div>
          </div>

          <div className="mt-12">
            <Button
              onClick={scrollToContent}
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Explore Platform
              <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};