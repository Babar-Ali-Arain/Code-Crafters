export interface TeamMember {
  id?: string;
  name: string;
  designation: string;
  bio: string;
  skills: string[]; // split by comma
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  profileImage: string;
  createdAt?: any;
}

export interface Project {
  id?: string;
  projectName: string;
  description: string;
  technologies: string[]; // split by comma
  clientName: string;
  projectStatus: 'pending' | 'in_progress' | 'completed';
  completionDate: string;
  projectImages: string; // url or Base64
  liveUrl: string;
  githubUrl: string;
  published: boolean;
  featured: boolean;
  category: string;
  createdAt?: any;
}

export interface Service {
  id?: string;
  serviceName: string;
  icon: string; // lucide icon name as string
  description: string;
  features: string[]; // split by comma
  pricing: string;
  orderIndex: number;
}

export interface Client {
  id?: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  projects: string[]; // Project IDs associated
  notes: string;
  createdAt?: any;
}

export interface Blog {
  id?: string;
  title: string;
  slug: string;
  featuredImage: string;
  content: string;
  tags: string[];
  categories: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  published: boolean;
  createdAt?: any;
}

export interface Testimonial {
  id?: string;
  clientName: string;
  position: string;
  company: string;
  rating: number; // 1-5
  review: string;
  profileImage: string;
  approved: boolean;
  createdAt?: any;
}

export interface Meeting {
  id?: string;
  clientName: string;
  email: string;
  date: string;
  time: string;
  duration: number; // in mins
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  details: string;
  timestamp: any;
}

export interface WebsiteContent {
  id: string; // e.g. "hero", "about" etc.
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  additionalData?: Record<string, any>;
  updatedAt?: any;
}
