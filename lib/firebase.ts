import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMGm3iCLN3WXa0VYyGFX9mNg0wMa-FmBU",
  authDomain: "tugas-rn-pbp.firebaseapp.com",
  projectId: "tugas-rn-pbp",
  storageBucket: "tugas-rn-pbp.firebasestorage.app",
  messagingSenderId: "358042096096",
  appId: "1:358042096096:web:5dfaf088b87e55c3ca9b85",
  measurementId: "G-FMG27DLC52"
};

// Initialize Firebase (prevent multiple instances)
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
let analytics: Analytics | null = null;

// Initialize analytics only on client side
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };

// Firestore Collections
export const COLLECTIONS = {
  PROJECTS: "projects",
  SKILLS: "skills",
  MESSAGES: "messages",
  ANALYTICS: "analytics",
  SETTINGS: "settings",
  EXPERIENCES: "experiences",
  CERTIFICATIONS: "certifications",
} as const;

// Settings document ID
export const SETTINGS_DOC_ID = "profile";

// Type definitions for Firestore documents
export interface ProfileSettings {
  // Basic info
  displayName: string;
  title: string;
  location: string;

  // Hero section
  heroTagline?: string; // e.g., "Full Stack Developer | UI/UX Enthusiast"
  heroDescription?: string; // Brief intro text
  heroImage?: string; // base64 image for hero section

  // About section
  aboutImage?: string; // base64 image for about section
  bio: string; // Main bio paragraph
  bioExtended?: string; // Second paragraph
  bioPassion?: string; // Third paragraph about passion

  // Education
  education?: {
    degree: string;
    university: string;
    period: string;
    gpa?: string;
    coursework: string[];
  };

  // Social links
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
    twitter?: string;
    instagram?: string;
  };

  // CV/Resume link
  cvUrl?: string;

  updatedAt: Date;
}

export interface ProjectLink {
  type: string;
  url: string;
  visible: boolean;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  techStack: string[];
  status: "draft" | "published";
  featured: boolean;
  githubUrl?: string;
  demoUrl?: string;
  links?: ProjectLink[];
  imageUrl?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
  level: number; // 0-100
  icon?: string;
  order: number;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Experience {
  id?: string;
  position: string;
  type: "Magang" | "Full-time" | "Part-time" | "Freelance" | "Contract";
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  skills: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  imageUrl: string;
  credentialUrl?: string;
  issueDate?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  pageViews: number;
  projectViews: { [projectId: string]: number };
  lastUpdated: Date;
}


