import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Sparkles, CheckCircle, Database, Server, Smartphone, Globe, Cpu, Terminal } from 'lucide-react';

// Simple, high-performance Counter Component
function AnimatedCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * numericValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numericValue, duration]);

  return (
    <span className="font-display font-medium">
      {count}
      {suffix}
    </span>
  );
}

// Brand SVG Icons
const BrandIcons = {
  React: () => (
    <svg className="w-full h-full" viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>React Logo</title>
      <circle cx="0" cy="0" r="2.05" fill="#00D8FF" />
      <g stroke="#00D8FF" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  NodeJS: () => (
    <svg className="w-full h-full" viewBox="0 0 256 292" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Node.js Logo</title>
      <path d="M128 0L24.5 59.8v119.5L128 239.1l103.5-59.8V59.8L128 0zm79 173.2c0 .3-.1.6-.3.8L135 219.7c-.5.3-1.1.3-1.6 0l-71.7-45.7c-.2-.1-.3-.4-.3-.8V93.5c0-.4.2-.6.5-.8L133.6 47c.5-.3 1.1-.3 1.6 0l71.7 45.7c.3.2.5.4.5.8v79.7z" fill="#339933" />
      <path d="M128 59.5c-19 0-34.4 15.3-34.4 34.2v53.4c0 19 15.4 34.2 34.4 34.2s34.4-15.3 34.4-34.2V93.7c0-18.9-15.4-34.2-34.4-34.2zm18.3 87.6c0 10.1-8.2 18.3-18.3 18.3s-18.3-8.2-18.3-18.3V93.7c0-10.1 8.2-18.3 18.3-18.3s18.3 8.2 18.3 18.3l-.0 53.4z" fill="#339933" />
    </svg>
  ),
  JS: () => (
    <svg className="w-full h-full" viewBox="0 0 448 512" fill="currentColor">
      <title>JavaScript Logo</title>
      <path d="M0 32v448h448V32H0zm243.8 349.4c0 43.6-25.6 63.5-62.1 63.5-33.7 0-53.2-18.8-63.2-38.5l34.3-20.7c6.6 11.7 15.3 21 28.5 21 19 0 24.3-9 24.3-30.2V222h42.1v159.4h.1zm115.1 4.5c-.3 37-24.3 59-58.4 59-31.5 0-51.5-17-62.2-37l33.8-19.7c7.2 11.7 16.2 19.3 28.5 19.3 14.9 0 21.6-6.6 21.6-18.9 0-13-10.1-17.6-27.9-25.1-25.1-10.4-51.5-23.7-51.5-58.4 0-32 23.3-54.8 53.8-54.8 28.2 0 44.4 12.8 52.6 30.2l-32.9 20.3c-5.8-10.4-12.8-14.9-19.7-14.9-10.1 0-14.2 6.1-14.2 12.2 0 11.1 7.4 15.3 22.9 21.9 28.2 12 55.4 22.1 55.4 55.8v-.2z" fill="#F7DF1E" />
    </svg>
  ),
  HTML5: () => (
    <svg className="w-full h-full" viewBox="0 0 448 512" fill="currentColor">
      <title>HTML5 Logo</title>
      <path d="M0 64l41.6 360 182.4 50.7 182.4-50.7L448 64H0zm363.3 105.1l-15.1 133.2-111 30.7v-.1l-.1.1-111-30.7-7.4-66h55l3.7 32.7 59.7 16.5 59.8-16.5 6.6-59.5H131.7l-3.3-33h241.6l3.3-44.9H121.8l-3.3-33h263.2l6 44.9z" fill="#E34F26" />
    </svg>
  ),
  CSS3: () => (
    <svg className="w-full h-full" viewBox="0 0 448 512" fill="currentColor">
      <title>CSS3 Logo</title>
      <path d="M0 64l41.6 360 182.4 50.7 182.4-50.7L448 64H0zm362.2 106.1l-24.3 218.4-111 30.7-111-30.7-7.4-66h55l3.7 32.7 59.7 16.5 59.8-16.5 7.4-82.6H176.3l-3.3-33h198.8l3.3-44.9H166.4l-3.3-33h208.6l3.3 2.1z" fill="#1572B6" />
    </svg>
  ),
  MongoDB: () => (
    <svg className="w-full h-full" viewBox="0 0 256 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>MongoDB Logo</title>
      <path d="M115.9 7.9c4 4.3 8 8.8 12.1 13.5 4-4.7 8-9.2 12-13.5C136 .9 132.1 0 128 0c-4.1 0-8 .9-12.1 7.9z" fill="#4AA34C" />
      <path d="M128 21.4c-4.1-4.7-8.1-9.2-12.1-13.5C87.8 45.4 62 84.1 62 133.3c0 98.7 54.3 167.3 66 182.5V21.4z" fill="#4AA34C" />
      <path d="M128 21.4v294.4c11.7-15.2 66-83.8 66-182.5 0-49.2-25.8-87.9-53.9-125.4-4-4.3-8-8.8-12.1-13.5z" fill="#589636" />
      <path d="M128 315.8c-11.7-15.2-66-83.8-66-182.5h66v182.5z" fill="#418442" />
      <path d="M128 315.8v117.4c11.7-15.2 66-83.8 66-182.5H128c0 .1 0 0 0 0z" fill="#12A855" />
      <path d="M128 433.2c-5.7 6.4-11.4 12.8-17.1 19.3-15.1 17.1-23.7 32-23.7 49 0 5.4.9 9.3 2.7 10.5 4.3 3.1 23.3-25.9 38.1-61.9V433.2z" fill="#4AA34C" />
      <path d="M128 433.2v68.8c14.8 35.9 33.8 65 38.1 61.9 1.8-1.2 2.7-5.1 2.7-10.5 0-17.1-8.6-31.9-23.7-49-5.7-6.5-11.4-12.9-17.1-19.3V433.2z" fill="#3F3F3F" />
    </svg>
  ),
  Firebase: () => (
    <svg className="w-full h-full" viewBox="0 0 256 352" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Firebase Logo</title>
      <path d="M12.2 278.4L37.9 61c.4-3.1 2.8-5.6 5.9-5.9 3.1-.3 6 1.4 7.2 4.3L101.4 163l-89.2 115.4z" fill="#FFC24A" />
      <path d="M243.8 278.4L206 58.7c-.5-3.1-3-5.4-6.1-5.5-3.1-.1-5.9 1.8-6.9 4.7L153.2 163M12.2 278.4l107 106.6c4.5 4.5 11.9 4.5 16.4 0l108.2-106.6L243.8 278.4z" fill="#FFA712" />
      <path d="M128 352c-4.5 0-8.8-1.8-12-5L1.7 236s-.1-.1-.1-.2c-1.5-1.7-1.9-4.2-1-6.3L48.2 29l2.8-.5c3.2-.6 6.5.9 7.9 3.8L128 163l12.1 24.2M233.1 229.5L128 352" fill="#F44336" />
    </svg>
  ),
  GitHub: () => (
    <svg className="w-full h-full" viewBox="0 0 496 512" fill="currentColor">
      <title>GitHub Logo</title>
      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-11.1-1.1c-.3 2-3 3.6-5.9 3-2.9-.7-4.9-2.7-4.6-4.6.3-2 3-3.6 5.9-3 3 .7 4.9 2.7 4.6 4.6zm13.7-5.7c-.7 1.6-3.1 2.6-5.9 2.2-2.8-.5-4.6-2.2-4-3.8.7-1.6 3.1-2.6 5.9-2.2 2.8.5 4.6 2.2 4 3.8zm21.3-4.8c-.7 1.6-3.7 1.6-6.8.3-3-1.3-4.7-3.6-4-5.2.7-1.6 3.7-1.6 6.8-.3 3 1.3 4.7 3.6 4 5.2zm23.1-1.9c0 1.6-2.4 3-5.6 2.6-3.2-.3-5.6-2-5.6-3.6 0-1.6 2.4-3 5.6-2.6 3.2.3 5.6 2 5.6 3.6zm21.1 1.7c-.3 1.6-3 2.6-6 2.2-3-.3-5.2-2-5-3.6.3-1.6 3-2.6 6-2.2 3 .3 5.2 2 5 3.6zM496 248C496 111.1 384.9 0 248 0S0 111.1 0 248c0 108 69.5 199.7 166.3 231.9 12.4 2.3 17-5.4 17-12 0-5.9-.2-21.6-.3-42.4-69.1 15-83.7-33.3-83.7-33.3-11.2-28.5-27.4-36.1-27.4-36.1-22.5-15.4 1.7-15.1 1.7-15.1 24.9 1.7 38 25.6 38 25.6 22.1 37.8 58 26.8 72.2 20.5 2.2-16 8.6-26.8 15.6-33-54.8-6.2-112.4-27.4-112.4-122.1 0-27 9.6-49.1 25.4-66.4-2.6-6.2-11-31.4 2.4-65.4 0 0 20.8-6.7 67.9 25.4 19.8-5.5 41-8.2 62-8.2 21 0 42.2 2.7 62 8.2 47-32.2 67.9-25.4 67.9-25.4 13.5 34 5.1 59.2 2.6 65.4 15.8 17.3 25.4 39.4 25.4 66.4 0 94.9-57.7 115.8-112.7 121.9 8.8 7.6 16.7 22.8 16.7 46 0 33.2-.3 60-1 68 0 6.6 4.6 14.3 17 12 96.8-32.1 166.3-123.9 166.3-231.9z" />
    </svg>
  )
};

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  return (
    <section id="home" className="relative min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden bg-navy">
      {/* 
        AESTHETIC PREMIUM BACKGROUND (Mesh grid & glow effects) 
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-0 left-0 h-[500px] bg-gradient-to-b from-electric/5 via-navy-light/10 to-transparent blur-3xl pointer-events-none" />
      
      {/* Animated Floating Ambient Orbs */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] bg-electric/10 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/3 right-10 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-golden/[0.04] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-grow flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full py-6 md:py-12">
          
          {/* LEFT SIDE: Brand & Copy Area */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
            
            {/* Premium Interactive Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.25)] hover:border-electric/30 transition-all duration-300 pointer-events-auto cursor-default"
            >
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electric"></span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#00E5FF] flex items-center gap-1">
                ✨ Trusted Software Development Company
              </span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-medium tracking-tight text-white leading-[1.08] sm:leading-[1.05]"
              >
                Transforming Ideas Into <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-white to-golden drop-shadow-sm font-semibold">
                  Powerful Digital Solutions
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-400 text-base sm:text-lg lg:text-lg leading-relaxed max-w-xl font-sans font-light"
              >
                We help businesses, schools, startups, and organizations build modern websites, web applications, management systems, and digital experiences that drive growth and success.
              </motion.p>
            </div>

            {/* CTA Buttons - Professional Stacking on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full max-w-md sm:max-w-none"
            >
              <a
                href="#contact"
                className="relative group overflow-hidden bg-gradient-to-r from-electric to-electric-dark text-navy font-bold px-8 py-4.5 rounded-full text-center hover:shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 tracking-wider uppercase text-xs sm:text-sm"
              >
                <span>🚀 Start Your Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#services"
                className="relative bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] text-white font-bold px-8 py-4.5 rounded-full text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 tracking-wider uppercase text-xs sm:text-sm"
              >
                <span>📂 View Our Work</span>
              </a>
            </motion.div>

            {/* Stats Counter Panel using glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 md:pt-8"
            >
              {[
                { label: 'Projects Completed', value: '50+', icon: '⭐' },
                { label: 'Happy Clients', value: '25+', icon: '⭐' },
                { label: 'Client Satisfaction', value: '98%', icon: '⭐' },
                { label: 'Team Members', value: '5+', icon: '⭐' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 text-left group"
                >
                  <div className="text-[10px] sm:text-xs text-golden-dark font-semibold tracking-wider uppercase flex items-center gap-1 mb-1">
                    <span>{stat.icon}</span>
                    <span>{stat.label.split(' ')[0]}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-electric transition-colors duration-200">
                    <AnimatedCounter value={stat.value} duration={1400 + i * 200} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-sans mt-0.5 line-clamp-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* RIGHT SIDE: Rich interactive, multi-layered device previews */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px] w-full">
            
            {/* Tech Stack Orbits floating background layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              
              {/* React Floating Icon badge */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  x: [0, 8, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(0,216,255,0.4))' }}
                className="absolute top-[8%] left-[10%] w-12 h-12 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.React />
              </motion.div>

              {/* Node.js floating badge */}
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  x: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(51,153,51,0.3))' }}
                className="absolute top-[5%] right-[12%] w-11 h-11 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.NodeJS />
              </motion.div>

              {/* Javascript floating badge */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  x: [0, -8, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(247,223,30,0.25))' }}
                className="absolute bottom-[35%] left-[2%] w-10 h-10 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.JS />
              </motion.div>

              {/* HTML5 floating badge */}
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  x: [0, 12, 0],
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(227,79,38,0.25))' }}
                className="absolute bottom-[2%] left-[20%] w-9 h-9 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.HTML5 />
              </motion.div>

              {/* Firebase badge */}
              <motion.div
                animate={{
                  y: [0, -14, 0],
                  x: [0, 6, 0],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(255,167,18,0.3))' }}
                className="absolute bottom-[5%] right-[15%] w-11 h-11 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.Firebase />
              </motion.div>

              {/* MongoDB badge */}
              <motion.div
                animate={{
                  y: [0, 18, 0],
                  x: [0, -8, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(88,150,54,0.3))' }}
                className="absolute top-[45%] right-[-1%] w-10 h-10 rounded-full border border-white/10 bg-navy/85 flex items-center justify-center p-2.5 backdrop-blur-md"
              >
                <BrandIcons.MongoDB />
              </motion.div>

            </div>

            {/* Main Stage Graphic Containers */}
            <div className="relative w-full max-w-[500px] sm:max-w-[560px] lg:max-w-full aspect-[4/3] flex items-center justify-center">
              
              {/* BACKDROP LIGHT RING */}
              <div className="absolute w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-electric/10 via-golden/5 to-transparent blur-[70px] pointer-events-none" />

              {/* LAYER 1: Core Dashboard Laptop Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute w-[92%] sm:w-[85%] aspect-[1.6] bg-[#0c1830] border border-white/10 rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8),_0_0_50px_rgba(0,240,255,0.06)] overflow-hidden z-10 p-1 sm:p-1.5"
              >
                {/* Header Control Buttons */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="w-[45%] sm:w-[50%] h-4 bg-white/5 border border-white/5 rounded-md flex items-center justify-center px-2">
                    <span className="text-[7px] sm:text-[9px] text-gray-500 font-mono truncate">app.codecrafters.io</span>
                  </div>
                  <div className="w-4" />
                </div>

                {/* Dashboard Inner App Canvas */}
                <div className="w-full h-[calc(100%-25px)] grid grid-cols-5 gap-1.5 p-1 bg-[#060b14]">
                  {/* Sidebar */}
                  <div className="col-span-1 border-r border-white/5 pr-1.5 space-y-1.5 flex flex-col justify-between py-1">
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-electric/20 rounded-sm w-[80%]" />
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-2 rounded-sm ${i === 1 ? 'bg-white/10' : 'bg-white/5'} w-full`} />
                      ))}
                    </div>
                    <div className="h-4 bg-white/5 rounded-sm" />
                  </div>
                  {/* Content Area */}
                  <div className="col-span-4 space-y-1.5 overflow-hidden p-1">
                    <div className="flex justify-between items-center pb-1 border-b border-white/5">
                      <div className="h-3 bg-white/10 rounded-sm w-24" />
                      <div className="h-2.5 bg-golden/20 rounded-sm w-12" />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                        <span className="text-[6px] text-gray-500 block">Deployments</span>
                        <span className="text-[9px] font-bold text-white block">142</span>
                      </div>
                      <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                        <span className="text-[6px] text-gray-500 block">Build Speed</span>
                        <span className="text-[9px] font-bold text-electric block">24s</span>
                      </div>
                      <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                        <span className="text-[6px] text-gray-500 block">Uptime</span>
                        <span className="text-[9px] font-bold text-green-400 block">99.9%</span>
                      </div>
                    </div>
                    <div className="h-[43%] rounded-lg border border-white/5 bg-white/[0.01] p-1.5 relative overflow-hidden flex items-end">
                      <svg className="w-full h-[85%]" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d="M0,30 L10,25 L20,28 L30,12 L40,18 L50,8 L60,14 L70,5 L80,11 L90,3 L100,6 L100,30 Z" fill="rgba(0, 240, 255, 0.08)" />
                        <path d="M0,30 L10,25 L20,28 L30,12 L40,18 L50,8 L60,14 L70,5 L80,11 L90,3 L100,6" fill="none" stroke="#00F0FF" strokeWidth="1.2" />
                      </svg>
                      <div className="absolute top-1 left-2 h-2.5 bg-white/10 rounded-sm w-14" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* LAYER 2: Floating Glass Interactive Metric Overlay (Left overlapping) */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ y: -5, scale: 1.03 }}
                className="absolute bottom-[5%] left-[2%] w-[45%] h-[32%] rounded-2xl border border-white/10 bg-navy-light/75 backdrop-blur-lg shadow-2xl p-2.5 sm:p-3.5 z-20 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-electric/10 text-electric rounded">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-300">Live API Traffic</span>
                  </div>
                  <span className="text-[8px] text-green-400 font-semibold px-1 rounded bg-green-400/10 flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 bg-green-400 rounded-full" /> Stable
                  </span>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <span className="text-[14px] sm:text-[18px] font-display font-bold text-white">45.2k req/s</span>
                  <div className="w-full bg-white/5 h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div className="bg-electric h-full w-[84%] rounded-full shadow-[0_0_8px_rgba(0,240,255,1)]" />
                  </div>
                </div>
                <span className="text-[7px] sm:text-[9px] text-gray-500 font-mono">Response latency: 12ms avg</span>
              </motion.div>

              {/* LAYER 3: Overlapping smartphone app preview card (Right overlapping) */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="absolute top-[12%] right-[2%] w-[38%] h-[55%] rounded-2xl border border-white/10 bg-navy-light/80 backdrop-blur-xl shadow-2xl p-3 z-20 flex flex-col items-center justify-between overflow-hidden"
              >
                {/* Smartphone notches & aesthetics */}
                <div className="w-16 h-3 bg-[#03060c] border border-white/5 rounded-full flex items-center justify-center px-1 mb-2">
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                </div>

                <div className="w-full flex-grow flex flex-col justify-center items-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full border border-white/5 bg-gradient-to-tr from-golden/20 to-transparent flex items-center justify-center mb-1 shadow-inner">
                    <Smartphone className="w-5 h-5 text-golden" />
                  </div>
                  
                  <span className="text-[9px] sm:text-[10px] font-bold text-white">Code Crafters Mobile App</span>
                  <p className="text-[7px] sm:text-[8px] text-gray-400 leading-relaxed max-w-[90%]">School & Enterprise companion modules synced in real-time.</p>
                  
                  <div className="flex gap-1">
                    <span className="text-[6px] bg-electric/15 text-electric px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">IOS</span>
                    <span className="text-[6px] bg-golden/15 text-golden px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Android</span>
                  </div>
                </div>

                {/* Simulated action button */}
                <div className="w-full h-6 bg-white/[0.04] rounded-lg flex items-center justify-center border border-white/5 active:scale-[0.98] transition-transform">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#00E5FF]">Swipe to demo app</span>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </div>

      {/* 
        TRUST BAR SECTION (Sleek tech grid below hero)
      */}
      <div className="border-t border-white/[0.05] bg-navy-light/45 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Trusted Technologies We Work With
          </p>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 items-center justify-center max-w-5xl mx-auto opacity-75">
            {[
              { name: 'React', icon: () => <BrandIcons.React /> },
              { name: 'Next.js', customText: 'Next.js' },
              { name: 'Node.js', icon: () => <BrandIcons.NodeJS /> },
              { name: 'MongoDB', icon: () => <BrandIcons.MongoDB /> },
              { name: 'Firebase', icon: () => <BrandIcons.Firebase /> },
              { name: 'Tailwind CSS', customText: 'Tailwind' },
              { name: 'GitHub', icon: () => <BrandIcons.GitHub /> },
              { name: 'Vercel', customText: 'Vercel ▲' }
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 group cursor-default"
              >
                {tech.icon ? (
                  <div className="w-7 h-7 filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-105">
                    {tech.icon()}
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm font-display font-medium tracking-wide text-gray-500 group-hover:text-white transition-all duration-500 uppercase">
                    {tech.customText}
                  </span>
                )}
                <span className="text-[7px] sm:text-[9px] text-gray-600 group-hover:text-gray-400 mt-1 transition-colors font-medium">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

