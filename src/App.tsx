/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Pricing from './components/sections/Pricing';
import Features from './components/sections/Features';
import WhyUs from './components/sections/WhyUs';
import Process from './components/sections/Process';
import Team from './components/sections/Team';
import Testimonials from './components/sections/Testimonials';
import FAQ from './components/sections/FAQ';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import ThreeBackground from './components/layout/ThreeBackground';

export default function App() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-electric/30 selection:text-white overflow-x-hidden relative">
      <ThreeBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Features />
        <Pricing />
        <WhyUs />
        <Process />
        <Team />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
