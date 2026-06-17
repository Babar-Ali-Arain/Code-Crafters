import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Twitter, Github, Mail, ChevronDown, ChevronUp, ArrowRight, Users } from 'lucide-react';
import { TEAM_MEMBERS, TeamMember } from '../../lib/team-data';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Team() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liveMembers, setLiveMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Team members from firestore in real time, fallback to static TEAM_MEMBERS
  useEffect(() => {
    const q = query(collection(db, 'team'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        setLiveMembers(TEAM_MEMBERS);
      } else {
        const list: TeamMember[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            name: data.name || '',
            role: data.role || '',
            department: data.department || 'Engineering',
            bio: data.bio || '',
            image: data.image || '',
            socials: {
              linkedin: data.socials?.linkedin || '',
              twitter: data.socials?.twitter || '',
              github: data.socials?.github || '',
              email: data.socials?.email || ''
            },
            skills: data.skills || [],
            focus: data.focus || '',
            experience: data.experience || ''
          });
        });
        setLiveMembers(list);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Firestore team read non-authorized or inactive, fallback to local team data:', err);
      setLiveMembers(TEAM_MEMBERS);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const primaryMembers = liveMembers.slice(0, 4);
  const secondaryMembers = liveMembers.slice(4);

  return (
    <section id="team" className="py-24 relative border-t border-white/5 bg-[#030712]/40 overflow-hidden">
      {/* Premium subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-electric/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-electric bg-electric/5 border border-electric/10 px-3 py-1 rounded-full">
              Our Core Specialists
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight pt-2">
              The Minds Behind <span className="bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent font-semibold">Code Crafters</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              A synchronized collective of system architects, designers, strategists, and authors engineered to deploy resilient digital solutions.
            </p>
          </motion.div>
        </div>

        {/* Primary Row (4 Experts) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {primaryMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>

        {/* Inline Extended Grid of 6 Extra Members with AnimatePresence */}
        <AnimatePresence>
          {isExpanded && secondaryMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
                {secondaryMembers.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <TeamMemberCard member={member} index={index + 4} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 max-w-md mx-auto relative z-20">
          {secondaryMembers.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] text-white transition-all cursor-pointer text-xs font-semibold uppercase tracking-wider text-center"
            >
              <span>{isExpanded ? "Show Fewer Specialists" : "Meet Our Full Team"}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}

          <Link
            to="/team"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric hover:bg-electric/90 text-navy transition-all cursor-pointer text-xs font-bold uppercase tracking-wider text-center shadow-[0_4px_20px_rgba(0,240,255,0.15)]"
          >
            <span>Team Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}

// Ultra-premium Minimally Crafted Single Card
const TeamMemberCard: React.FC<{ member: TeamMember; index: number }> = ({ member, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.06, duration: 0.4 }}
      className="bg-[#0b1329]/40 border border-white/[0.06] rounded-2xl p-5 hover:border-white/20 hover:bg-[#0b1329]/75 transition-all duration-300 relative flex flex-col justify-between group overflow-hidden"
    >
      <div className="w-full">
        {/* Grayscale on idle, rich color on hover aspect-square frame */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#030712] relative border border-white/[0.05]">
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500 ease-out"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // High fidelity fallback using initials
              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=020617,0f172a&fontSize=33`;
            }}
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-navy/10 pointer-events-none mix-blend-multiply opacity-50 group-hover:opacity-0 transition-opacity" />
        </div>

        {/* Identity Details */}
        <div className="mt-4 flex flex-col">
          <h4 className="text-base font-semibold text-white tracking-tight group-hover:text-electric transition-colors duration-200 font-display">
            {member.name}
          </h4>
          <span className="text-[10px] font-mono text-golden/85 uppercase tracking-widest mt-1">
            {member.role}
          </span>
          <p className="text-gray-400 text-xs leading-relaxed mt-3 mb-4 line-clamp-3">
            {member.bio}
          </p>
        </div>
      </div>

      {/* Minimal social links bar */}
      <div className="flex gap-4 items-center pt-3 border-t border-white/[0.04] mt-auto">
        {member.socials?.linkedin && (
          <a 
            href={member.socials.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors duration-200"
            title="LinkedIn ID"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        )}
        {member.socials?.twitter && (
          <a 
            href={member.socials.twitter} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors duration-200"
            title="Twitter ID"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
        )}
        {member.socials?.github && (
          <a 
            href={member.socials.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white transition-colors duration-200"
            title="GitHub ID"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        )}
        {member.socials?.email && (
          <a 
            href={`mailto:${member.socials.email}`} 
            className="text-gray-500 hover:text-white transition-colors duration-200"
            title="Direct eMail"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        
        {/* Simple, quiet department label */}
        <span className="ml-auto text-[9px] font-mono text-gray-500 uppercase tracking-widest">
          {member.department}
        </span>
      </div>

    </motion.div>
  );
}
