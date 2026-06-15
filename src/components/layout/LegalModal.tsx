import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

export const PrivacyContent = () => (
  <>
    <h3 className="text-white font-bold text-base mb-2">1. Information We Collect</h3>
    <p>We collect information you provide directly to us when you request a proposal, book a consultation, or contact our support team. This may include your name, email address, phone number, and organization details.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">2. How We Use Your Information</h3>
    <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and process your requests or transactions.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">3. Data Security</h3>
    <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">4. Sharing of Information</h3>
    <p>We do not share your personal information with third parties except as necessary to provide our services, comply with the law, or protect our rights.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">5. Updates to this Policy</h3>
    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
  </>
);

export const TermsContent = () => (
  <>
    <h3 className="text-white font-bold text-base mb-2">1. Acceptance of Terms</h3>
    <p>By accessing or using our software, applications, or website, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">2. Use of Service</h3>
    <p>You agree to use our services only for lawful purposes. You must not use our services to transmit any harmful code, spam, or illicit material.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">3. Intellectual Property</h3>
    <p>The software, original content, features, and functionality are owned by Code Crafters and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">4. Support and Maintenance</h3>
    <p>Support and maintenance are provided as described in your specific service plan or package. We reserve the right to modify our service offerings at any time.</p>
    
    <h3 className="text-white font-bold text-base mt-6 mb-2">5. Limitation of Liability</h3>
    <p>Code Crafters shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
  </>
);

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
}

export default function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-[90%] max-w-2xl h-fit max-h-[80vh] bg-navy-light border border-white/10 rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white max-w-[80%]">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-gray-400 text-sm space-y-4">
              {content}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
