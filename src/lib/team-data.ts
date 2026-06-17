export interface TeamMember {
  name: string;
  role: string;
  department: 'Leadership' | 'Engineering' | 'Design' | 'Strategy';
  bio: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  skills: string[];
  focus: string;
  experience?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Babar Ali",
    role: "CEO & Founder",
    department: "Leadership",
    bio: "Visionary tech leader driving business & educational growth through cutting-edge, custom digital solutions.",
    image: "/team/babar-ali.jpeg",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "founder.codecrafters@gmail.com"
    },
    skills: ["System Design", "Business Strategy", "Product Vision"],
    focus: "High-level strategy & modern digital transformations",
    experience: "8+ Years"
  },
  {
    name: "Adnan Ali Samo",
    role: "Co-Founder & CTO",
    department: "Engineering",
    bio: "Full-stack systems architect crafting secure, high-performance database and cloud application modules.",
    image: "/team/adnan-ali.png",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      github: "https://github.com",
      email: "adnan.codecrafters@gmail.com"
    },
    skills: ["Node.js", "Cloud Architecture", "Database Systems"],
    focus: "Performance engineering & ultra-secure cloud database architectures",
    experience: "6+ Years"
  },
  {
    name: "Ali Abbas Shaikh",
    role: "Social Media Lead & Brand Strategist",
    department: "Strategy",
    bio: "Creative brand strategist driving online engagement, professional community outreach, and modern brand footprint across social media.",
    image: "/team/ali-abbas.png",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "ali.codecrafters@gmail.com"
    },
    skills: ["Content Marketing", "SEO Optimization", "Public Relations"],
    focus: "Community growth, strategic positioning, and PR campaigns",
    experience: "4+ Years"
  },
  {
    name: "Mehdi Hassan Qurashi",
    role: "Lead Technical Content Writer",
    department: "Strategy",
    bio: "Creative wordsmith crafting professional documentation, UI copywriting, technical blogs, and engaging software guides.",
    image: "/team/mehdi-hassan.png",
    socials: {
      linkedin: "https://linkedin.com",
      email: "mehdi.codecrafters@gmail.com"
    },
    skills: ["Technical Copywriting", "Framer Guides", "Brand Voice Styling"],
    focus: "Sleek UX writing, tutorials, and informative software guides",
    experience: "5+ Years"
  },
  {
    name: "Ayesha Khan",
    role: "Senior UI/UX Designer",
    department: "Design",
    bio: "Award-winning designer specializing in futuristic dark interfaces, smooth micro-interactions, and visual brand layouts.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      email: "ayesha.codecrafters@gmail.com"
    },
    skills: ["Figma Design", "Prototyping", "Design Systems"],
    focus: "Intelligent UX systems & beautiful sleek accessibility",
    experience: "5+ Years"
  },
  {
    name: "Zayan Ahmed",
    role: "Principal Frontend Developer",
    department: "Engineering",
    bio: "Creative frontend engineer passionate about React, client state paradigms, complex transitions, and component optimizations.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "zayan.codecrafters@gmail.com"
    },
    skills: ["React Core", "Tailwind CSS", "TypeScript", "Motion"],
    focus: "Highly interactive client portals & responsive interfaces",
    experience: "4+ Years"
  },
  {
    name: "Sana Malik",
    role: "Quality Assurance Lead",
    department: "Engineering",
    bio: "Detail-oriented specialist certified in automated testing suites, security audits, and robustness analysis under load.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "sana.codecrafters@gmail.com"
    },
    skills: ["Automation Suites", "Security Auditing", "CI Integration"],
    focus: "Zero-bug guarantees & high-load application optimization",
    experience: "3+ Years"
  },
  {
    name: "Rohan Siddiqui",
    role: "Senior DevOps Engineer",
    department: "Engineering",
    bio: "Infrastructure expert specializing in cloud orchestrations, system balancing, automated pipelines, and fast container builds.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "rohan.codecrafters@gmail.com"
    },
    skills: ["Docker / K8s", "Terraform", "Google Cloud Plat."],
    focus: "Automated container builds, scalability & continuous delivery",
    experience: "6+ Years"
  },
  {
    name: "Fatima Shah",
    role: "Client Success Specialist",
    department: "Strategy",
    bio: "Strategic communicator bridging the gap between client requirements, active milestones, and timely project delivery.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      email: "fatima.codecrafters@gmail.com"
    },
    skills: ["Project Liaison", "Agile Operations", "CRM Systems"],
    focus: "Transparent client expectations & milestone alignments",
    experience: "4+ Years"
  },
  {
    name: "Hamza Baig",
    role: "AI Integration Lead",
    department: "Engineering",
    bio: "Machine learning specialist implementing generative AI, localized vector retrieval models, and semantic processing gateways.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=300&fit=crop",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "hamza.codecrafters@gmail.com"
    },
    skills: ["Generative AI", "RAG Systems", "Vector Indexes"],
    focus: "Smart features integration & workflow automated intelligence",
    experience: "5+ Years"
  }
];
