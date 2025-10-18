'use client'

import { motion } from 'framer-motion'
import { Loader2, Camera, Shirt, Brain, Star, Users, ShoppingBag } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#E6DCD3]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-grid-black/[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #8B7355 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        <div className="container mx-auto px-4 pt-24 pb-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-[#4A3728] to-[#8B7355] bg-clip-text text-transparent">
              Your AI Fashion Journey
            </h1>
            <p className="text-xl md:text-2xl text-[#5C4033] max-w-3xl mx-auto leading-relaxed">
              Experience the future of fashion with ChromaFit. Create your digital twin, explore endless styles, and find your perfect fit through AI-powered analysis.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-[#F5EFE6]/90 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-[#D4C5B5] transition-all"
            >
              <div className="bg-[#E6DCD3] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-[#8B7355]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#4A3728]">2D Avatar</h3>
              <p className="text-[#5C4033] leading-relaxed">
                Create your digital profile with just a selfie. Our AI technology captures your unique style preferences and measurements.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-[#F5EFE6]/90 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-[#D4C5B5] transition-all"
            >
              <div className="bg-[#E6DCD3] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shirt className="w-6 h-6 text-[#8B7355]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#4A3728]">Virtual Try-On</h3>
              <p className="text-[#5C4033] leading-relaxed">
                Experience clothes virtually before buying. See how garments fit and look with your style profile in real-time.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-[#F5EFE6]/90 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-[#D4C5B5] transition-all"
            >
              <div className="bg-[#E6DCD3] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-[#8B7355]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#4A3728]">Style AI</h3>
              <p className="text-[#5C4033] leading-relaxed">
                Get personalized style recommendations and outfit suggestions powered by advanced AI algorithms.
              </p>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4A3728] mb-2">98%</div>
              <div className="text-[#5C4033]">Fit Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4A3728] mb-2">10k+</div>
              <div className="text-[#5C4033]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4A3728] mb-2">50k+</div>
              <div className="text-[#5C4033]">Virtual Try-ons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4A3728] mb-2">4.9</div>
              <div className="text-[#5C4033]">User Rating</div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-lg mx-auto mb-16 text-center"
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#8B7355] fill-current" />
              ))}
            </div>
            <p className="text-lg text-[#5C4033] italic mb-4">
              "ChromaFit has completely transformed how I shop for clothes online. The virtual try-on is incredibly accurate!"
            </p>
            <p className="text-[#8B7355]">- Sarah M., Fashion Blogger</p>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <div className="space-y-4 md:space-y-0 md:space-x-4">
              <motion.a 
                href="/auth/signup" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-[#4A3728] text-[#F5EFE6] px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:bg-[#5C4033]"
              >
                Get Started Free
              </motion.a>
              <motion.a 
                href="/auth/login" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block bg-[#F5EFE6] text-[#4A3728] px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all border border-[#D4C5B5] hover:bg-[#E6DCD3]"
              >
                Sign In
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}