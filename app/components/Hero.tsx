"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS, SETTINGS_DOC_ID, ProfileSettings } from "@/lib/firebase";
import AnimatedBackground from "./AnimatedBackground";

export default function Hero() {
  const [settings, setSettings] = useState<ProfileSettings | null>(null);

  // Fetch settings from Firebase
  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setSettings(snapshot.data() as ProfileSettings);
        }
      } catch (error) {
        console.error("Error loading hero settings:", error);
      }
    }

    loadSettings();
  }, []);

  // Dynamic social links from settings
  const socialLinks = [
    {
      name: "LinkedIn",
      href: settings?.socialLinks?.linkedin || "https://www.linkedin.com/in/daffapandora/",
      icon: Linkedin,
    },
    {
      name: "GitHub",
      href: settings?.socialLinks?.github || "https://github.com/daffapandora",
      icon: Github,
    },
  ];

  // Parse display name into two lines
  const nameParts = (settings?.displayName || "Daffa Pandora El-farisin").split(" ");
  const firstName = nameParts.slice(0, 2).join(" "); // "Daffa Pandora"
  const lastName = nameParts.slice(2).join(" ") || ""; // "El-farisin"

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <AnimatedBackground />
      <div className="absolute inset-0 -z-10 bg-[var(--background-secondary)]" />

      {/* Center Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-6 px-4"
      >
        {/* Hello Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-xs sm:text-sm md:text-base text-[var(--text-muted)] font-light tracking-wider uppercase"
        >
          Hello, I&apos;m
        </motion.p>

        {/* Name with BBH Bartle Font */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bbh-bartle-regular text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground text-center leading-[1.1] tracking-tight px-2 sm:px-4 max-w-[95vw]"
          style={{ fontFamily: "'BBH Bartle', sans-serif" }}
        >
          <span className="block">{firstName}</span>
          {lastName && <span className="block">{lastName}</span>}
        </motion.h1>

        {/* Tagline */}
        {settings?.heroTagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-sm sm:text-base text-[var(--text-muted)] font-light tracking-wide text-center max-w-md"
          >
            {settings.heroTagline}
          </motion.p>
        )}

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center gap-6 mt-2"
        >
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="text-[var(--text-muted)] hover:text-foreground transition-colors duration-300"
              aria-label={link.name}
            >
              <link.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
