import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const PACKAGES = [
  {
    name: 'BASIC PACKAGE',
    price: '200',
    pkr: '56,000',
    popular: false,
    features: [
      'Professional Business/School Website',
      'Admin Dashboard',
      'User / Student Management',
      'Staff Management',
      'News & Events',
      'Gallery',
      'Basic Record Management',
      'Document / Marksheet Printing',
      'Firebase Integration',
      'Mobile Responsive Design'
    ],
    buttonText: 'Get Started'
  },
  {
    name: 'STANDARD PACKAGE',
    price: '300',
    pkr: '84,000',
    popular: true,
    features: [
      'Everything in Basic',
      'Attendance Management',
      'Department / Class Management',
      'Section / Group Management',
      'Advanced Reporting System',
      'Custom Document Design',
      'PDF Document Download',
      'Ledger & Fee Records',
      'Dashboard Analytics',
      'Notice Board System'
    ],
    buttonText: 'Choose Standard'
  },
  {
    name: 'PREMIUM PACKAGE',
    price: '400',
    pkr: '112,000',
    popular: false,
    isPremium: true,
    features: [
      'Everything in Standard',
      'Client / Student Portal',
      'Employee / Teacher Portal',
      'Admin / Parent Portal',
      'Online Admissions / Onboarding',
      'QR Verification System',
      'ID Card Generation',
      'Advanced Custom Reports',
      'Excel & PDF Export',
      'Performance Analytics',
      'Priority Support'
    ],
    buttonText: 'Choose Premium'
  }
];

export default function Pricing() {
  return (
    <section id="packages" className="py-24 relative bg-navy-light/30 border-y border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-electric uppercase mb-4">Investment Plans</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold mb-6">Management Software Packages</h3>
          <p className="text-gray-400 text-lg">
            Transparent pricing focused on delivering massive value to your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-navy rounded-3xl border p-8 flex flex-col h-full transition-all duration-300 ${
                pkg.popular 
                ? 'border-electric shadow-[0_0_40px_rgba(0,240,255,0.15)] transform lg:-translate-y-4' 
                : (pkg as any).isPremium 
                  ? 'border-white/10 hover:border-golden/50' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-electric text-navy font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              {(pkg as any).isPremium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-golden text-navy font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                  Premium
                </div>
              )}

              <div className="mb-8">
                <h4 className={`text-sm font-semibold mb-2 ${(pkg as any).isPremium ? 'text-golden' : 'text-gray-400'}`}>{pkg.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-300">$</span>
                  <span className={`text-5xl font-display font-bold ${(pkg as any).isPremium ? 'text-white' : 'text-white'}`}>{pkg.price}</span>
                </div>
                <div className="text-sm text-gray-400 mt-2 font-medium">~ PKR {(pkg as any).pkr}</div>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {pkg.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${
                      pkg.popular ? 'text-electric' : ((pkg as any).isPremium ? 'text-golden' : 'text-blue-500')
                    }`} />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href="#contact" 
                className={`w-full py-4 rounded-xl font-medium text-center transition-all ${
                  pkg.popular 
                  ? 'bg-electric text-navy hover:bg-electric-dark shadow-lg' 
                  : (pkg as any).isPremium
                    ? 'bg-golden text-navy hover:bg-golden-dark shadow-lg shadow-golden/20'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {pkg.buttonText}
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
