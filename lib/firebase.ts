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
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

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
} as const;

// Settings document ID
export const SETTINGS_DOC_ID = "profile";

// Type definitions for Firestore documents
export interface ProfileSettings {
  displayName: string;
  title: string;
  location: string;
  bio: string;
  heroImage?: string; // base64 image for hero section
  aboutImage?: string; // base64 image for about section
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
    twitter?: string;
    instagram?: string;
  };
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

export interface AnalyticsData {
  pageViews: number;
  projectViews: { [projectId: string]: number };
  lastUpdated: Date;
}
