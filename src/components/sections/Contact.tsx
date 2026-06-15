import { useState, FormEvent } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { EMAIL, PHONE } from '../../lib/constants';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all form fields.');
      setLoading(false);
      return;
    }

    try {
      const inqRef = collection(db, 'inquiries');
      await addDoc(inqRef, {
        id: '', // optional identifier
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'unread',
        createdAt: serverTimestamp()
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative bg-[#040813] border-t border-white/5 overflow-hidden">
      {/* Background decoration lines */}
      <div className="absolute top-1/2 right-10 w-[250px] h-[250px] bg-electric/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-electric uppercase block mb-3">Get In Touch</span>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white leading-tight">
                Let's Digitize Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-white font-semibold">
                  Organization
                </span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans font-light mt-4">
                Ready to upgrade your organization's management, design systems, and database layers? Reach out for a free consultation and personalized proposal.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/[0.02] rounded-xl flex items-center justify-center border border-white/5 hover:border-electric/35 transition-colors shrink-0">
                  <Phone className="w-4 h-4 text-electric" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">Call Us Directly</div>
                  <div className="text-white font-medium text-sm">{PHONE}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/[0.02] rounded-xl flex items-center justify-center border border-white/5 hover:border-electric/35 transition-colors shrink-0">
                  <Mail className="w-4 h-4 text-electric" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">Email Support</div>
                  <div className="text-white font-medium text-sm">{EMAIL}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/[0.02] rounded-xl flex items-center justify-center border border-white/5 hover:border-electric/35 transition-colors shrink-0">
                  <MapPin className="w-4 h-4 text-electric" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">Company Headquarters</div>
                  <div className="text-white font-medium text-sm">Khairpur Mir's, Pakistan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-electric/30 to-transparent" />
            
            <h4 className="text-lg font-display text-white mb-1">Initiate Enterprise Consult</h4>
            <p className="text-gray-400 text-xs mb-6">Brief us on your software specifications and an engineer will connect shortly.</p>

            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="text-sm font-bold text-white">Inquiry Received Successfully!</h5>
                <p className="text-xs text-gray-300">
                  Thank you for starting your consultation with Code Crafters. An administrative representative will review your message immediately and respond via official email.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white uppercase font-bold tracking-wider transition-all mt-3"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-electric text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@organization.com"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-electric text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Consultation Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Custom Management Portal Design"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-electric text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Brief Specifications</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your current system bottleneck or technological vision..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-electric text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-electric text-navy font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
                >
                  <span>{loading ? 'Submitting details...' : 'Submit Inquiry'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
