'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MayaAvatar from '@/components/MayaAvatar';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)',
      }}
    >
      {/* Animated background elements matching onboarding style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ top: '20%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ bottom: '20%', right: '10%' }}
        />
      </div>

      <div className="w-full max-w-4xl px-8 z-10">
        <div className="text-center">
          {/* Brand Element: MayaAvatar */}
          <motion.div
            className="mb-10 mx-auto w-fit"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <MayaAvatar size="xl" animated />
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            404
          </motion.h1>

          <motion.h2
            className="text-3xl md:text-4xl font-semibold mb-6 text-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Page Not Found
          </motion.h2>

          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            It seems you've wandered off the track. Let Maya help you find your way back.
          </motion.p>

          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              className="px-10 py-7 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20"
            >
              <Link href="/">
                <Home className="mr-3 w-5 h-5" />
                Back to Dashboard
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
