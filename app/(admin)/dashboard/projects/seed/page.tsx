"use client";

import { useState } from "react";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Database, Upload, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialProjects = [
  {
    title: "Campus Market",
    description:
      "A platform for buying and selling used student goods. Built with React Native and Firebase for real-time updates and seamless user experience.",
    longDescription: "Campus Market is a comprehensive mobile application designed specifically for university students to buy and sell used items within their campus community. The app features real-time messaging, secure payment integration, and location-based listings to facilitate safe and convenient transactions between students.",
    category: "Mobile",
    techStack: ["React Native", "Firebase", "Expo", "TypeScript"],
    status: "published" as const,
    featured: true,
    githubUrl: "https://github.com/Gzaa19/CollectaMarket.git",
    demoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    images: [],
    year: "2024",
  },
  {
    title: "Website Redesign - Mahkamah Agung",
    description:
      "Supreme Court website development and redesign project with a focus on user experience, responsiveness, and government compliance requirements.",
    longDescription: "A comprehensive website redesign project for the Supreme Court of Indonesia (Mahkamah Agung). This project focused on improving user experience, ensuring accessibility compliance, and modernizing the visual design while maintaining government standards and regulations.",
    category: "Web",
    techStack: ["PHP", "Laravel", "React.js", "PostgreSQL"],
    status: "published" as const,
    featured: true,
    githubUrl: "https://github.com/kdandy/MA-LandingPage.git",
    demoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    images: [],
    year: "2025",
  },
  {
    title: "Smart Irrigation System IoT",
    description:
      "Intelligent irrigation system for water conservation and increased harvest using DHT22 temperature sensor and soil moisture sensor based on IoT technology.",
    longDescription: "An Internet of Things (IoT) based smart irrigation system designed to optimize water usage in agriculture. The system uses DHT22 temperature sensors and soil moisture sensors to automatically control water distribution, resulting in water conservation and improved crop yields.",
    category: "IoT",
    techStack: ["Arduino", "C++", "IoT", "Sensors"],
    status: "published" as const,
    featured: true,
    githubUrl: "https://wokwi.com/projects/448745969429353473",
    demoUrl: "https://youtu.be/ycO6V3W7Beg?si=o-v-6MtDLO4cKsl",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    images: [],
    year: "2024",
  },
  {
    title: "E-Voting System",
    description:
      "Secure electronic voting system built with Next.js and PostgreSQL, featuring real-time vote counting and comprehensive admin dashboard.",
    longDescription: "A secure and transparent electronic voting system developed using Next.js and PostgreSQL. Features include real-time vote counting, voter verification, admin dashboard for election management, and comprehensive audit trails to ensure election integrity.",
    category: "Web",
    techStack: ["Next.js", "PostgreSQL", "TypeScript", "Tailwind CSS"],
    status: "published" as const,
    featured: false,
    githubUrl: "https://github.com/daffapandora/e-voting",
    demoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&h=600&fit=crop",
    images: [],
    year: "2024",
  },
  {
    title: "ML Image Classifier",
    description:
      "Machine learning project for image classification using TensorFlow and Python with high accuracy model training.",
    longDescription: "A machine learning project focused on image classification using deep learning techniques. Built with TensorFlow and Python, this project demonstrates the implementation of convolutional neural networks (CNN) for accurate image recognition and classification tasks.",
    category: "Machine Learning",
    techStack: ["Python", "TensorFlow", "Keras", "NumPy"],
    status: "published" as const,
    featured: false,
    githubUrl: "https://github.com/daffapandora/ml-classifier",
    demoUrl: "",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    images: [],
    year: "2024",
  },
  {
    title: "Portfolio Website",
    description:
      "Modern portfolio website built with Next.js 15, Tailwind CSS, and Framer Motion featuring smooth animations and dark mode support.",
    longDescription: "A personal portfolio website showcasing my projects and skills. Built with the latest Next.js 15, featuring server-side rendering, smooth page transitions with Framer Motion, dark mode support, and a fully responsive design using Tailwind CSS.",
    category: "Web",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "published" as const,
    featured: true,
    githubUrl: "https://github.com/daffapandora/Portofolio",
    demoUrl: "https://portofolio-daffa-dusky.vercel.app/",
    imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop",
    images: [],
    year: "2024",
  },
];

export default function SeedProjectsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);

  const seedProjects = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setSuccess(false);

    try {
      // Check existing projects
      const existingQuery = query(collection(db, COLLECTIONS.PROJECTS));
      const existingSnapshot = await getDocs(existingQuery);
      const existingTitles = existingSnapshot.docs.map(doc => doc.data().title);

      const newResults: string[] = [];

      for (const project of initialProjects) {
        if (existingTitles.includes(project.title)) {
          newResults.push(`⏭️ Skipped: "${project.title}" (already exists)`);
          continue;
        }

        const docData = {
          ...project,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await addDoc(collection(db, COLLECTIONS.PROJECTS), docData);
        newResults.push(`✅ Added: "${project.title}"`);
      }

      setResults(newResults);
      setSuccess(true);
    } catch (err) {
      console.error("Error seeding projects:", err);
      setError(err instanceof Error ? err.message : "Failed to seed projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0F172A] to-[#1E293B] p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E293B] rounded-2xl p-8 shadow-xl border border-gray-700"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-linear-to-r from-[#6c757d] to-[#495057] flex items-center justify-center">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Seed Projects Data</h1>
              <p className="text-gray-400">Import initial projects to Firebase</p>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Projects to import ({initialProjects.length}):</h3>
            <ul className="space-y-2">
              {initialProjects.map((project, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {project.title}
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">{project.category}</span>
                  {project.featured && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Featured</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="bg-[#0F172A] rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Results:</h3>
              <ul className="space-y-1">
                {results.map((result, index) => (
                  <li key={index} className="text-sm text-gray-400">
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Projects seeded successfully!</span>
            </div>
          )}

          <button
            onClick={seedProjects}
            disabled={loading}
            className="w-full py-4 bg-linear-to-r from-[#6c757d] to-[#495057] text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeding projects...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Seed Projects to Firebase
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            This will add the initial projects to your Firebase database.
            <br />
            Existing projects with the same title will be skipped.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
