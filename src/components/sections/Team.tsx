import { motion } from 'motion/react';
import { Linkedin, Twitter, Github, Mail, Globe } from 'lucide-react';

const TEAM = [
  {
    name: "Babar Ali",
    role: "CEO & Founder",
    bio: "Visionary tech leader driving business & educational growth through cutting-edge, custom digital solutions.",
    image: "/team/babar-ali.jpeg",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "founder.codecrafters@gmail.com"
    }
  },
  {
    name: "Adnan Ali Samo",
    role: "Co-Founder",
    bio: "Full-stack systems architect crafting secure, high-performance database and cloud application modules.",
    image: "/team/adnan-ali.png",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "adnan.codecrafters@gmail.com"
    }
  },
  {
    name: "Ali Abbas Shaikh",
    role: "Social Media Handler",
    bio: "Creative digital brand strategist and communicator driving Code Crafters' online engagement, professional outreach, and modern brand footprint across social media platforms.",
    image: "/team/ali-abbas.png",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "ali.codecrafters@gmail.com"
    }
  },
  {
    name: "Mehdi Hassan Qurashi",
    role: "Senior Content Writer",
    bio: "Wordsmith crafting professional documentation, UI copy, and engaging guides for complex software platforms.",
    image: "/team/mehdi-hassan.png",
    socials: {
      linkedin: "https://linkedin.com",
      email: "mehdi.codecrafters@gmail.com"
    }
  }
];

export default function Team() {
  return (
    <section id="team" className="py-24 relative border-t border-white/5 bg-navy-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-sm font-bold tracking-widest text-electric uppercase">Meet Our Team</h2>
            <h3 className="text-3xl md:text-5xl font-display font-bold">The Minds Behind Code Crafters</h3>
            <p className="text-gray-400 text-lg">
              A highly dedicated team of industry experts passionate about helping modern organizations and schools thrive in the digital landscape.
            </p>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {TEAM.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-navy border border-white/10 rounded-3xl p-5 relative flex flex-col justify-between items-center text-center group hover:border-electric/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] transition-all duration-300"
            >
              {/* Background ambient light on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-electric/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
              
              <div className="w-full flex flex-col items-center">
                {/* Profile Image Frame */}
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 mb-5 relative overflow-hidden group-hover:from-electric/40 group-hover:to-golden/40 group-hover:border-transparent transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-navy-light relative">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Name */}
                <h4 className="text-lg font-bold text-white group-hover:text-electric transition-colors duration-200">
                  {member.name}
                </h4>
                
                {/* Designation / Role */}
                <p className="text-xs font-semibold text-golden tracking-wider uppercase mt-1 mb-3">
                  {member.role}
                </p>

                {/* Short Bio */}
                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                  {member.bio}
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4 relative z-10">
                {member.socials.linkedin && (
                  <a 
                    href={member.socials.linkedin} 
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/30 transition-all duration-200"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {member.socials.twitter && (
                  <a 
                    href={member.socials.twitter} 
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/30 transition-all duration-200"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {member.socials.github && (
                  <a 
                    href={member.socials.github} 
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/30 transition-all duration-200"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {member.socials.email && (
                  <a 
                    href={`mailto:${member.socials.email}`} 
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-electric/20 hover:border-electric/30 transition-all duration-200"
                    title="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
