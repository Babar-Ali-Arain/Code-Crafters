import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Cpu, Smartphone, Layout, Palette, PenTool, Database, 
  Cloud, Globe, CheckCircle2, ChevronRight, HelpCircle, Rocket, 
  Layers, Settings, ShieldCheck, DollarSign, Clock, ArrowRight, Star,
  ChevronDown, Check, Sparkles, Sliders, Shield, Zap, Plus, Minus, Info
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ThreeBackground from '../layout/ThreeBackground';
import { COMPANY_NAME } from '../../lib/constants';

// World-class services list with custom icons, descriptions and features
const DETAILED_SERVICES = [
  {
    id: 'management-systems',
    category: 'Development',
    icon: Cpu,
    title: 'Management Systems',
    desc: 'End-to-end management software tailored for modern enterprises, progressive startups, & educational academies.',
    longDesc: 'Complete institutional ERP & customer relationship modules (CRM) modeled for complex organizational hierarchies. Complete visual tracking of operational staff pipelines, automated ledger entries, unified multi-user accounts, and secure data storage with ironclad scaling.',
    features: [
      'Custom Role-Based Access Control (RBAC)',
      'Automated Invoicing & Financial Ledger APIs',
      'Real-time Custom Notification Pipelines',
      'Dynamic PDF Report & Sheet Exporter Utility'
    ],
    stack: ['React', 'Node.js', 'Express', 'Drizzle ORM', 'PostgreSQL', 'Tailwind'],
    deliveryTime: '4 - 6 Weeks',
    popularity: 'Best Seller',
    gradient: 'from-blue-500 to-indigo-600',
    colorHex: '#3B82F6',
    basePrice: 1200
  },
  {
    id: 'web-dev',
    category: 'Development',
    icon: Globe,
    title: 'Website Engineering',
    desc: 'Premium, hyper-optimized responsive platforms crafted to elevate your distinctive corporate identity.',
    longDesc: 'Modern lightning-fast landing spaces, custom content architectures, and robust leads generators. Engineered from the ground up to guarantee perfect Core Web Vitals, 100% Google Lighthouse scores, and pristine aesthetic rendering.',
    features: [
      'React SSG Core with Vite Hot-Bundling',
      'Tailwind CSS Proportional Typography Grid',
      'Strategic Search Engine Schema Optimization',
      'Stateful Headless CMS Content Integrations'
    ],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Framer Motion'],
    deliveryTime: '2 - 3 Weeks',
    popularity: 'Most Interactive',
    gradient: 'from-[#00F0FF] to-blue-600',
    colorHex: '#00F0FF',
    basePrice: 450
  },
  {
    id: 'mobile-dev',
    category: 'Development',
    icon: Smartphone,
    title: 'Mobile Applications',
    desc: 'Immersive cross-platform mobile systems running fluid native speeds for iOS & Android devices.',
    longDesc: 'Take your services to your users’ pockets. Formulated to offer real-time notification gates, secure local storage sync models, offline data operations, background tasks, and stunning touch-driven animations.',
    features: [
      'React Native / Flutter High-Fidelity Engine',
      'Robust Client SQL Lite Database Sync',
      'Integrated Firebase Push Notifications',
      'Biometric Touch & Face ID Security Auth'
    ],
    stack: ['React Native', 'TypeScript', 'Redux Toolkit', 'Expo', 'Firebase'],
    deliveryTime: '6 - 8 Weeks',
    popularity: 'High Tech Core',
    gradient: 'from-violet-500 to-fuchsia-600',
    colorHex: '#8B5CF6',
    basePrice: 1800
  },
  {
    id: 'dashboard',
    category: 'Development',
    icon: Layout,
    title: 'Diagnostic Dashboards',
    desc: 'Centralized admin consoles featuring diagnostic reporting, activity tracing, and beautiful visual charts.',
    longDesc: 'Empower management with stateful control screens. Equipped with beautiful Recharts data widgets, instant table filtering columns, audit trails, and multi-tenant telemetry dashboards to monitor your operations instantly.',
    features: [
      'Interactive D3 / Recharts Data Visualization',
      'Instant Activity Audit Logs & System Trails',
      'Universal CSV/Excel Data Exporter Modules',
      'Responsive Fluid Screens with Sidebar Navigation'
    ],
    stack: ['React', 'Recharts', 'Firebase Auth', 'Tailwind', 'Cloud Functions'],
    deliveryTime: '3 - 4 Weeks',
    popularity: 'SaaS Favorite',
    gradient: 'from-emerald-500 to-teal-600',
    colorHex: '#10B981',
    basePrice: 850
  },
  {
    id: 'ui-ux',
    category: 'Design',
    icon: Palette,
    title: 'UI/UX Interactive Design',
    desc: 'Accessible digital mockups, structural micro-wireframes, and clean user-centered systems.',
    longDesc: 'Establish structural clarity before writing any code. We analyze user personas, map interactive pathways, construct detailed wireframes, and establish high-fidelity, interactive vector prototypes.',
    features: [
      'High-Contrast Standard Design Systems',
      'Figma Component Auto-Layout Guidelines',
      'Advanced Interactive Walkthrough Prototypes',
      'Full WCAG / ADA Accessibility Compliance Checks'
    ],
    stack: ['Figma', 'Adobe XD', 'Procreate', 'Spline 3D', 'Illustrator'],
    deliveryTime: '1 - 2 Weeks',
    popularity: 'Creative Choice',
    gradient: 'from-pink-500 to-rose-600',
    colorHex: '#EC4899',
    basePrice: 350
  },
  {
    id: 'graphic-dev',
    category: 'Design',
    icon: PenTool,
    title: 'Graphic & Corporate Brand',
    desc: 'Professional branding kits, vector logotypes, print guidelines, and promotional layouts.',
    longDesc: 'Unlock your brand authority across digital and physical dimensions. Design unique vector corporate identities, elegant stationary packaging, business cards, letterheads, and modern media assets.',
    features: [
      'Custom Multi-Revision Vector Logotypes',
      'Official Brand Guidelines & Typography Rules',
      'High-Resolution Print-Ready PDF Packages',
      'Custom Social Media Creative Cover Templates'
    ],
    stack: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma'],
    deliveryTime: '1 Week',
    popularity: 'Brand Starter',
    gradient: 'from-amber-400 to-orange-500',
    colorHex: '#F59E0B',
    basePrice: 200
  },
  {
    id: 'firebase-core',
    category: 'Infrastructure',
    icon: Database,
    title: 'Firebase Solutions',
    desc: 'Secure real-time databases, user authentication models, cloud engines, and static site hosting.',
    longDesc: 'Durable, fast, serverless app mechanics. Initialize secure Firestore databases, implement multi-factor login gates, trigger automated serverless cloud functions, and launch scale-ready architectures inside Google’s cloud nodes.',
    features: [
      'Dynamic Real-Time Database Streaming',
      'High Security Auth (Email, Google, OTP)',
      'Strict firestore.rules Security Validation',
      'Cloud Functions Cron Trigger Automation'
    ],
    stack: ['Firebase Auth', 'Firestore DB', 'Storage', 'Cloud Functions'],
    deliveryTime: '1 - 2 Weeks',
    popularity: 'Cloud Agile',
    gradient: 'from-cyan-400 to-blue-500',
    colorHex: '#06B6D4',
    basePrice: 400
  },
  {
    id: 'cloud-dev',
    category: 'Infrastructure',
    icon: Cloud,
    title: 'Cloud Scaling & Devops',
    desc: 'Robust automated continuous deployment pipelines paired with stateful Docker virtual containers.',
    longDesc: 'Dunk server down-times forever. Build modern, auto-scaling deployment workflows using continuous integration (CI/CD), secure Docker container sandboxes, API gateway configurations, and reliable cloud database nodes.',
    features: [
      'Docker Containerization Sandbox Configs',
      'GitHub Actions Auto CI/CD Pipeline Build',
      'Edge CDN Load Balancing with Custom SSL',
      'Encrypted Environmental Secret Variables Security'
    ],
    stack: ['Google Cloud Run', 'GitHub Actions', 'Docker', 'Vercel Serverless'],
    deliveryTime: '2 - 3 Weeks',
    popularity: 'Enterprise Grade',
    gradient: 'from-teal-400 to-indigo-600',
    colorHex: '#14B8A6',
    basePrice: 650
  }
];

// Interactive comparison model for the 3 distinct product tiers
const DEPLOYMENT_TIERS = [
  {
    name: 'Standard',
    badge: 'Lean MVP',
    desc: 'Perfect for startups, localized business solutions, and lightweight conceptual iterations.',
    multiplier: 0.8,
    timelineMultiplier: 0.8,
    features: [
      'Complete Mobile & Desktop Custom Design',
      'Optimized Content Architecture (SEO Friendly)',
      'Standard Interactive React/Tailwind Core',
      'Persistent Client-Side Local Memory Storage',
      '30-Day Server Configuration Warranty Diagnostics',
      'Complete Clean Source Code Ownership Transfer'
    ],
    gradient: 'from-slate-700 to-slate-900',
    textGradient: 'from-slate-300 to-slate-100',
    accentColor: '#64748B'
  },
  {
    name: 'Premium',
    badge: 'Pro Tier Strategy',
    desc: 'The gold standard for established operators, scaling entities, and feature-rich digital products.',
    multiplier: 1.0,
    timelineMultiplier: 1.0,
    features: [
      'All features included in Standard baseline',
      'Interactive Dynamic Dashboards & Logs System',
      'Secured Firebase Real-time Firestore or PostgreSQL Data',
      'Personalized UI Transitions & CSS Motion Sprites',
      'Advanced API Integrations & Security Webhooks',
      '60-Day Dedicated Post-Launch SLA Technical Warranty'
    ],
    gradient: 'from-blue-950 to-indigo-950 border-[#00F0FF]/30 shadow-[0_0_35px_rgba(0,240,255,0.08)]',
    textGradient: 'from-[#00F0FF] via-cyan-100 to-white',
    accentColor: '#00F0FF',
    isPopular: true
  },
  {
    name: 'Enterprise',
    badge: 'Advanced Core System',
    desc: 'Tailored for rigorous institutions, deep integrations, and high-availability systems scaling multi-users.',
    multiplier: 1.6,
    timelineMultiplier: 1.4,
    features: [
      'All features configured inside Premium system',
      'High-Load Multi-User Access Controls & Audit Rails',
      'Dockerized Auto-scaling Deployments & Orchestrations',
      'Custom Relational DB Architectures with Migrations',
      'Dedicated Custom Design Token System in Figma',
      '1 Year High-Priority Priority Technical SLAs Support'
    ],
    gradient: 'from-purple-950 to-indigo-950 border-purple-500/30',
    textGradient: 'from-purple-400 via-pink-200 to-white',
    accentColor: '#A855F7'
  }
];

const FAQS = [
  { 
    id: 'faq-1',
    q: "How are project delivery timelines calculated?", 
    a: "Every project timeline is modeled strictly on scope complexity and selected delivery tiers. A standard optimized corporate website typically completes in 2-3 weeks, whereas modular database-connected portals and customized mobile systems require 5-8 weeks. Detailed milestone calendars are presented at project kickoff." 
  },
  { 
    id: 'faq-2',
    q: "Do we secure full intellectual property ownership?", 
    a: "Yes, 100%. Upon completion and approval of all outlined project milestones, complete legal IP certificates are formally signed over to you. Every line of clean, robust custom source code is pushed directly to your personal or corporate secure private GitHub repositories." 
  },
  { 
    id: 'faq-3',
    q: "Can you migrate legacy structures and databases?", 
    a: "Absolutely. We build robust ETL (Extract, Transform, Load) custom migration procedures to cleanly port unstructured spreadsheet tables, physical catalogs, or legacy relational dumps straight into high-performance, validated modern Firestore or secure Cloud SQL frameworks without data rot." 
  },
  { 
    id: 'faq-4',
    q: "What does post-launch maintenance include?", 
    a: "All deliverables are supported by our complimentary post-live diagnostic warranty. This includes real-time server health checks, critical security patches, backup audits, and priority troubleshooting. Longer-term retaining options are easily configured via custom SLAs." 
  }
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Development' | 'Design' | 'Infrastructure'>('All');
  const [focusedService, setFocusedService] = useState<string>('management-systems');
  
  // Real-time pricing configurator factors
  const [configService, setConfigService] = useState<string>('web-dev');
  const [configTier, setConfigTier] = useState<'Standard' | 'Premium' | 'Enterprise'>('Premium');
  const [addonSEO, setAddonSEO] = useState<boolean>(true);
  const [addonSLA, setAddonSLA] = useState<boolean>(false);
  const [addonSecurity, setAddonSecurity] = useState<boolean>(false);
  const [screensCount, setScreensCount] = useState<number>(8); // Interactive scope multiplier slider

  // FAQ Expandable state tracking
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>('faq-1');

  // Contact simulated booking details
  const [simulatedBooked, setSimulatedBooked] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNote, setClientNote] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filteredServices = DETAILED_SERVICES.filter(srv => {
    if (activeCategory === 'All') return true;
    return srv.category === activeCategory;
  });

  const selectedServiceDetails = DETAILED_SERVICES.find(s => s.id === focusedService) || DETAILED_SERVICES[0];
  const curConfigSrv = DETAILED_SERVICES.find(s => s.id === configService) || DETAILED_SERVICES[0];

  // Logic to simulate absolute state-based price estimates
  const calculateCosts = () => {
    const srv = curConfigSrv;
    let base = srv.basePrice;
    
    // 1. Apply Tier Multipliers
    let multiplier = 1.0;
    let timeModifier = 1.0;
    if (configTier === 'Standard') {
      multiplier = 0.8;
      timeModifier = 0.8;
    } else if (configTier === 'Enterprise') {
      multiplier = 1.6;
      timeModifier = 1.4;
    }

    // 2. Add Scope Multiplication (Dynamic slider for panels/views/modules)
    // Baseline is 5 screens/modules. Each unit above adds nominal value.
    const screenPremium = (screensCount - 5) * 45;
    
    // Calculate Base After Scaling
    let calculatedBase = Math.round(base * multiplier) + screenPremium;
    if (calculatedBase < 200) calculatedBase = 200; // Floor price limit

    // 3. Addon modules
    let addonCosts = 0;
    if (addonSEO) addonCosts += 150;
    if (addonSLA) addonCosts += 280;
    if (addonSecurity) addonCosts += 220;

    const finalUSD = calculatedBase + addonCosts;
    const finalPKR = Math.round(finalUSD * 278); // Convert to local metric

    // Dynamic Delivery timeline calculation
    let rawWeeks = 3;
    if (srv.id === 'management-systems') rawWeeks = 6;
    else if (srv.id === 'mobile-dev') rawWeeks = 8;
    else if (srv.id === 'ui-ux' || srv.id === 'graphic-dev') rawWeeks = 2;
    
    const finalWeeks = Math.max(1, Math.round(rawWeeks * timeModifier + (screensCount > 10 ? (screensCount - 10) * 0.2 : 0)));

    return {
      usd: finalUSD,
      pkr: finalPKR,
      weeks: finalWeeks
    };
  };

  const currentEstimates = calculateCosts();

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientName) return;
    setSimulatedBooked(true);
    setTimeout(() => {
      setSimulatedBooked(false);
      setClientName('');
      setClientEmail('');
      setClientNote('');
    }, 6000);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 selection:text-white overflow-x-hidden relative bg-[#020617]">
      <ThreeBackground />
      <Navbar />

      {/* Extreme Visual Ambient Blur Floating Entities */}
      <div className="absolute top-24 left-10 w-[30rem] h-[30rem] bg-cyan-700/[0.04] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-[60rem] right-12 w-[35rem] h-[35rem] bg-indigo-600/[0.03] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-96 left-1/4 w-[40rem] h-[40rem] bg-purple-600/[0.02] rounded-full blur-[240px] pointer-events-none" />

      <main className="pt-32 pb-24 relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb Pill */}
        <div className="mb-8 flex justify-start">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-full bg-white/[0.02] border border-white/5 py-1.5 px-3.5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Lobby</span>
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Interactive Header Card */}
        <div className="relative mb-20 p-8 md:p-12 rounded-[32px] overflow-hidden border border-white/5 bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-black/30 backdrop-blur-3xl">
          
          {/* Internal neon ambient ring decorator */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-indigo-500/0 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[#00F0FF]/30 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/25 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 text-[9px] font-mono tracking-wider font-bold uppercase">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Featured Capabilities 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-tight">
                Perfect Digital{' '}
                <span className="bg-gradient-to-r from-[#00F0FF] via-[#3B82F6] to-pink-400 bg-clip-text text-transparent font-extrabold">
                  Engineering Tiers
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                Explore a modular, fully interactive suite of software solutions optimized to scale organizational infrastructure, launch stunning responsive frontends, and configure secure Firebase/SQL networks with absolute micro-precision.
              </p>

              {/* Dynamic Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5 font-mono">
                <div>
                  <span className="block text-[#00F0FF] text-lg font-bold">100%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Source Ownership</span>
                </div>
                <div>
                  <span className="block text-emerald-400 text-lg font-bold">&lt; 150ms</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Core Load Speeds</span>
                </div>
                <div>
                  <span className="block text-purple-400 text-lg font-bold">24 / 7</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Server Warranty</span>
                </div>
                <div>
                  <span className="block text-amber-400 text-lg font-bold">Enterprise</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Security Matrix</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#030712]/50 border border-white/10 p-6 rounded-[24px] relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF]">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">Fast Infrastructure</h4>
                    <span className="text-[9px] font-mono text-slate-500 uppercase uppercase tracking-widest">Digital Velocity</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  "Every digital application we orchestrate is locked down using optimized code, robust data layers, sleek modern responsive UI grids, and responsive transition sets."
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#00F0FF] hover:translate-x-1 transition-transform duration-300">
                  <span>Explore Spec Matrix Below</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Fully Interactive Service Exploration Tabs */}
        <section className="mb-24">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00F0FF] uppercase font-bold block">
              Discover Interactive Offerings
            </span>
            <h2 className="text-3xl font-display font-medium text-white">
              Catalog of Custom Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Select any capability category below to view beautiful bento metrics and technical engine declarations instantly.
            </p>
          </div>

          {/* Smooth Slider Category Filter Tabs */}
          <div className="flex justify-center mb-12 select-none">
            <div className="flex flex-wrap justify-center gap-1.5 p-1 bg-white/[0.01] border border-white/5 rounded-2xl max-w-3xl backdrop-blur-md">
              {(['All', 'Development', 'Design', 'Infrastructure'] as const).map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      // Set focus automatically to first matching service in the selected category
                      const matching = DETAILED_SERVICES.find(s => cat === 'All' || s.category === cat);
                      if (matching) setFocusedService(matching.id);
                    }}
                    className={`relative px-5 py-3 rounded-xl text-[10px] sm:text-[11px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'text-navy font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{cat === 'All' ? 'ALL TIERS' : cat.toUpperCase()}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-[#00F0FF] rounded-xl z-0 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                        style={{ backgroundColor: '#00F0FF' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Service Grid and Focus Double Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List block */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-[10px] font-mono tracking-widest text-[#00F0FF]/50 font-bold uppercase block px-1 text-left">
                ⚡ CLICK ANY CAPABILITY CARD BELOW TO ACTIVATE FULL TECHNICAL DEEP DIVE SPECIFICATIONS
              </span>

              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((srv, idx) => {
                    const SrvIcon = srv.icon;
                    const isFocused = focusedService === srv.id;

                    return (
                      <motion.div
                        layout
                        key={srv.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setFocusedService(srv.id)}
                        className={`p-6 rounded-[24px] border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${
                          isFocused
                            ? 'bg-slate-900/80 border-[#00F0FF] shadow-[0_0_25px_rgba(0,240,255,0.08)] scale-[1.01]'
                            : 'bg-[#030712]/30 hover:bg-slate-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Dynamic custom colored halo background when selected */}
                        {isFocused && (
                          <div className={`absolute -right-12 -bottom-12 w-24 h-24 bg-${srv.id === 'web-dev' ? 'cyan-400' : 'blue-500'}/10 rounded-full blur-2xl pointer-events-none`} />
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl transition-all duration-300 ${
                            isFocused 
                              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/25' 
                              : 'bg-white/[0.03] text-slate-300 border border-white/5 font-bold group-hover:scale-105'
                          }`}>
                            <SrvIcon className="w-5 h-5 shrink-0" />
                          </div>
                          <span className={`text-[8px] font-mono tracking-wider font-bold uppercase py-0.5 px-2 rounded-full border ${
                            isFocused 
                              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20' 
                              : 'bg-white/[0.02] text-slate-500 border-white/5'
                          }`}>
                            {srv.category}
                          </span>
                        </div>

                        <h3 className={`text-base font-bold font-display transition-colors ${isFocused ? 'text-[#00F0FF]' : 'text-white'}`}>
                          {srv.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-2 line-clamp-2">
                          {srv.desc}
                        </p>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.03] justify-between text-[9px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            {srv.deliveryTime}
                          </span>
                          <span className="text-[#00F0FF] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Micro specifications detail floating drawer */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedServiceDetails.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="p-8 rounded-[28px] bg-slate-950/80 border border-white/10 backdrop-blur-2xl relative overflow-hidden text-left shadow-2xl"
                >
                  {/* Accent visual background badge based on popularity tag */}
                  <div className="absolute top-0 right-0 py-2.5 px-4 bg-gradient-to-r from-indigo-500/20 to-[#00F0FF]/20 text-[#00F0FF] text-[9px] font-mono font-bold tracking-widest uppercase rounded-bl-[16px] border-l border-b border-white/10 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#00F0FF]" />
                    {selectedServiceDetails.popularity}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 text-[#00F0FF] rounded-2xl border border-white/10 shadow-lg shrink-0">
                      {React.createElement(selectedServiceDetails.icon, { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF] px-2.5 py-0.5 rounded-full font-bold">
                        {selectedServiceDetails.category} Engine
                      </span>
                      <h2 className="text-xl font-bold text-white font-display mt-1.5 tracking-tight">
                        {selectedServiceDetails.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed mb-6 font-sans">
                    {selectedServiceDetails.longDesc}
                  </p>

                  {/* Service Deliverable features checkboxes */}
                  <div className="space-y-3.5 mb-6">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block mb-2">
                      Technical Deliverables Included:
                    </h4>
                    {selectedServiceDetails.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400 mt-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-sans leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stack items */}
                  <div className="mb-6 pt-5 border-t border-white/5">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#00F0FF]/70 font-bold block mb-3">
                      Standard Technology Engine:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedServiceDetails.stack.map((stk) => (
                        <span key={stk} className="text-[9px] font-mono text-slate-300 bg-white/[0.03] border border-white/5 py-1 px-3 rounded-lg hover:border-[#00F0FF]/30 hover:bg-slate-900 transition-all cursor-default">
                          {stk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mini estimated specs row */}
                  <div className="bg-[#030712]/70 border border-white/5 rounded-2xl p-4 flex items-center justify-between text-xs mt-6">
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-500 font-mono tracking-wider block uppercase">Average Cycle Time</span>
                      <p className="font-bold text-white flex items-center gap-1.5 font-sans text-sm">
                        <Clock className="w-4 h-4 text-[#00F0FF]" />
                        {selectedServiceDetails.deliveryTime}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        const el = document.getElementById('budget-estimator-console');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setConfigService(selectedServiceDetails.id);
                      }}
                      className="py-2.5 px-4 bg-[#00F0FF] hover:bg-white text-navy text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Simulate Price</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </section>

        {/* Dynamic side-by-side Pricing Deployment Tiers Visual Component */}
        <section className="py-20 border-t border-b border-white/5 my-24 bg-gradient-to-b from-[#030712]/40 to-black/20 rounded-[40px] px-6 md:px-12">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-[9px] font-mono tracking-[0.25em] text-[#00F0FF] uppercase font-black block">
              Core Deliverables Comparison
            </span>
            <h2 className="text-3xl font-display font-bold text-white">
              SLA Delivery & Platform Models
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              We orchestrate digital apps across three baseline deployment models, matching your immediate operational and structural scaling goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {DEPLOYMENT_TIERS.map((curTier) => {
              return (
                <div 
                  key={curTier.name}
                  className={`flex flex-col justify-between p-7 rounded-[28px] border text-left bg-gradient-to-b relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] ${curTier.gradient}`}
                >
                  {/* Special glow aura for most popular tier */}
                  {curTier.isPopular && (
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold font-display text-white tracking-wide">
                        {curTier.name} Model
                      </span>
                      <span className={`text-[8px] font-mono tracking-widest uppercase font-black px-2.5 py-1 rounded-full border ${
                        curTier.isPopular 
                          ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/25' 
                          : 'bg-white/[0.04] text-slate-400 border-white/15'
                      }`}>
                        {curTier.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">
                      {curTier.desc}
                    </p>

                    <div className="space-y-2.5 pt-4 border-t border-white/5">
                      <span className="text-[8px] font-mono tracking-wider font-bold text-[#00F0FF] uppercase block">
                        Included Deliverables
                      </span>
                      {curTier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Cost Weight Factor</span>
                      <span className="text-sm font-bold text-white font-mono">
                        {(curTier.multiplier * 100)}% base value
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setConfigTier(curTier.name as any);
                        const el = document.getElementById('budget-estimator-console');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-all cursor-pointer ${
                        curTier.isPopular
                          ? 'bg-[#00F0FF] text-navy hover:bg-white shadow-[0_4px_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_22px_rgba(0,240,255,0.5)] scale-[1.01]'
                          : 'bg-white/5 text-slate-300 hover:bg-white hover:text-navy border border-white/10 hover:border-white'
                      }`}
                    >
                      Select {curTier.name} Formula
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* Dynamic Interactive Budget Selector Console Slider */}
        <section id="budget-estimator-console" className="py-16 text-left max-w-5xl mx-auto scroll-mt-28">
          
          <div className="relative p-8 md:p-10 rounded-[36px] border border-white/10 bg-[#030712]/70 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-7">
                
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-[9px] font-mono tracking-widest text-amber-300 font-bold uppercase">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    Interactive Simulator Core
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    Live Project Configurator
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                    Interact directly with standard system sliders, tiers, and technical add-ons to simulate development timelines and client budget models dynamically.
                  </p>
                </div>

                {/* Control Item 1: Service Selected */}
                <div className="space-y-2.5">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-black block">
                    1. Choose Targeted Digital Capability
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DETAILED_SERVICES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConfigService(item.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          configService === item.id
                            ? 'bg-slate-900 border-[#00F0FF] text-white shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                            : 'bg-[#030712]/45 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {React.createElement(item.icon, { className: `w-4 h-4 ${configService === item.id ? 'text-[#00F0FF]' : 'text-slate-500'}` })}
                          <span className="text-xs font-bold font-sans">{item.title}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600">${item.basePrice}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Item 2: Tier Formula */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-black block">
                    2. Select Operational Tier Formula
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Standard', 'Premium', 'Enterprise'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setConfigTier(t)}
                        className={`py-3 px-1 rounded-xl border text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-center cursor-pointer transition-all ${
                          configTier === t
                            ? 'bg-[#00F0FF] border-[#00F0FF] text-navy font-black shadow-[0_4px_12px_rgba(0,240,255,0.3)]'
                            : 'bg-[#030712]/45 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Item 3: Project Screen / Module Count Scope (Tactile Slider) */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider font-black">
                    <span className="text-slate-400">3. Scale Factor (Views & Modules)</span>
                    <span className="text-[#00F0FF] font-black">{screensCount} Dynamic Units</span>
                  </div>
                  
                  <div className="bg-[#030712]/50 border border-white/5 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setScreensCount(prev => Math.max(2, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold active:scale-90 transition-all cursor-pointer"
                        aria-label="Reduce views"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="range" 
                        min="2" 
                        max="30" 
                        value={screensCount}
                        onChange={(e) => setScreensCount(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F0FF] focus:outline-none focus:ring-1 focus:ring-[#00F0FF]"
                      />
                      <button 
                        type="button"
                        onClick={() => setScreensCount(prev => Math.min(30, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold active:scale-90 transition-all cursor-pointer"
                        aria-label="Increase views"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-wide">
                      <span>Lightweight Prototype (2 units)</span>
                      <span>Standard App (8-12 units)</span>
                      <span>Heavy System (30 units)</span>
                    </div>
                  </div>
                </div>

                {/* Control Item 4: Checkbox add-ons */}
                <div className="space-y-2.5 pt-2">
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-black block">
                    4. Optional Technical Integration Assemblies
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    <button
                      type="button"
                      onClick={() => setAddonSEO(!addonSEO)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        addonSEO 
                          ? 'bg-emerald-500/10 text-white border-emerald-500/30' 
                          : 'bg-[#030712]/45 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${addonSEO ? 'bg-emerald-500 border-emerald-500 text-navy' : 'border-slate-700'}`}>
                        {addonSEO && <Check className="w-3 h-3 text-navy font-bold" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">SEO Package</span>
                        <span className="text-[8px] text-slate-500 font-mono">+$150 Budget</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddonSLA(!addonSLA)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        addonSLA 
                          ? 'bg-emerald-500/10 text-white border-emerald-500/30' 
                          : 'bg-[#030712]/45 border-white/5 text-[#94a3b8] hover:text-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${addonSLA ? 'bg-emerald-500 border-emerald-500 text-navy' : 'border-slate-700'}`}>
                        {addonSLA && <Check className="w-3 h-3 text-navy font-bold" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">1-Yr VIP SLA</span>
                        <span className="text-[8px] text-slate-500 font-mono">+$280 Budget</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddonSecurity(!addonSecurity)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        addonSecurity 
                          ? 'bg-emerald-500/10 text-white border-emerald-500/30' 
                          : 'bg-[#030712]/45 border-white/5 text-[#94a3b8] hover:text-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${addonSecurity ? 'bg-emerald-500 border-emerald-500 text-navy' : 'border-slate-700'}`}>
                        {addonSecurity && <Check className="w-3 h-3 text-navy font-bold" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">MFA Lock Shield</span>
                        <span className="text-[8px] text-slate-500 font-mono">+$220 Budget</span>
                      </div>
                    </button>

                  </div>
                </div>

              </div>

              {/* Live Calculator Visual Display Pod */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                
                {/* Dynamic floating light circle reacting based on targeted service */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-[72px] pointer-events-none" />

                <div className="space-y-5 relative z-10 text-left">
                  <div className="flex items-center gap-1.5 pb-4 border-b border-white/5 justify-between">
                    <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase font-black">Live Configured Metrics</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-500 font-mono uppercase block tracking-wider">Active Formula Architecture</span>
                    <span className="text-sm font-bold text-white block">
                      {curConfigSrv.title} • <span className="text-[#00F0FF]">{configTier} Tier</span>
                    </span>
                  </div>

                  <div className="space-y-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider font-bold">Estimated Cost Model</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span className="text-3xl sm:text-4xl font-display font-black text-white bg-gradient-to-r from-emerald-400 to-white bg-clip-text text-transparent">
                        {currentEstimates.usd.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">USD value</span>
                    </div>
                    {/* Local currency visual convert display */}
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[#00F0FF] text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full">
                        PKR ~{currentEstimates.pkr.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Est. Exchange conversion</span>
                    </div>
                  </div>

                  {/* Estimated Timeline metric badge */}
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400 tracking-wider">PROJECTED TIMELINE</span>
                    <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-[#00F0FF]" />
                      <span>{currentEstimates.weeks} Weeks Total</span>
                    </div>
                  </div>

                </div>

                {/* Interactive Simulated Order Form */}
                <div className="pt-6 relative z-10 text-left space-y-3.5">
                  <span className="text-[8px] font-mono text-indigo-400 uppercase font-black tracking-widest block">Submit Configuration To Devs</span>
                  
                  {simulatedBooked ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-center"
                    >
                      <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                      <h4 className="text-xs font-bold text-emerald-400">Configuration Transmitted</h4>
                      <p className="text-[10px] text-slate-300">Our senior engineering console has registered this budget formula.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSimulateSubmit} className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          required
                          placeholder="Your Name" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full bg-[#030712] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-200 focus:outline-[#00F0FF] transition-all"
                        />
                        <input 
                          type="email" 
                          required
                          placeholder="Your Email" 
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full bg-[#030712] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-200 focus:outline-[#00F0FF] transition-all"
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add secondary requirements/notes (Optional)" 
                        value={clientNote}
                        onChange={(e) => setClientNote(e.target.value)}
                        className="w-full bg-[#030712] border border-white/5 rounded-xl py-2 px-3 text-[10px] text-slate-250 focus:outline-[#00F0FF] transition-all"
                      />
                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-[#00F0FF] to-blue-500 hover:shadow-[0_4px_22px_rgba(0,240,255,0.4)] hover:scale-[1.01] text-navy font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all block text-center cursor-pointer"
                      >
                        Transmit Simulator Booking
                      </button>
                    </form>
                  )}

                  <span className="text-[8px] text-slate-500 font-mono block text-center mt-1 uppercase tracking-wide leading-relaxed">
                    Estimations represent approximate budget metrics. Formal locks conclude during kickoff.
                  </span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Fully Interactive Beautiful F.A.Q Section */}
        <section className="max-w-4xl mx-auto py-12 mt-12 bg-slate-950/20 rounded-[36px] border border-white/5 p-6 md:p-12">
          
          <div className="text-center mb-12 space-y-2.5">
            <h2 className="text-2xl font-display font-medium text-white tracking-tight">
              Capability & SLA Inquiries
            </h2>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest block">
              Transparent workflows for standard digital deployments
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => {
              const isExpanded = expandedFAQ === faq.id;
              return (
                <div 
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-300 ${
                    isExpanded 
                      ? 'border-[#00F0FF]/30 bg-slate-950/70 shadow-[0_4px_15px_rgba(0,240,255,0.03)]' 
                      : 'border-white/5 bg-[#030712]/20 hover:border-white/10 hover:bg-slate-900/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-white text-sm sm:text-base cursor-pointer focus:outline-none select-none"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className={`w-5 h-5 shrink-0 transition-colors ${isExpanded ? 'text-[#00F0FF]' : 'text-slate-500'}`} />
                      <span className="leading-snug">{faq.q}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-slate-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 pl-12 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans text-left border-t border-white/[0.02]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>

        </section>

        {/* Footer Navigation CTA */}
        <div className="text-center pt-20">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.02] hover:bg-white hover:text-navy border border-white/10 text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.97]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Portal Entrance</span>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
