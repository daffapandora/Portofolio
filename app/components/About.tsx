"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  GraduationCap,
  Calendar,
  MapPin,
  Download,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS, SETTINGS_DOC_ID, ProfileSettings } from "@/lib/firebase";

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [aboutImage, setAboutImage] = useState<string>("");

  // Fetch about image from Firebase
  useEffect(() => {
    async function fetchAboutImage() {
      try {
        const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data() as ProfileSettings;
          if (data.aboutImage) {
            setAboutImage(data.aboutImage);
          }
        }
      } catch (error) {
        console.error("Error fetching about image:", error);
      }
    }
    
    fetchAboutImage();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const education = {
    university: "Diponegoro University",
    major: "Informatics / Computer Science",
    location: "Semarang, Indonesia",
    period: "2023 - 2027 (Expected)",
    semester: "Semester 5",
    coursework: [
      "Data Structures & Algorithms",
      "Software Engineering",
      "Database Systems",
      "Web Development",
      "Mobile Development",
      "Machine Learning",
    ],
  };

  return (
    <section
      id="about"
      ref={ref}
      className="section-padding relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#6c757d]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#495057]/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="gradient-text">Me</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            Get to know more about my background, education, and what drives me
            as a developer.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left Column - Image & Highlights */}
          <div className="space-y-8">
            {/* Profile Image */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c757d]/20 to-[#495057]/20" />
                {aboutImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={aboutImage}
                    alt="Daffa Pandora"
                    className="w-full h-full object-cover absolute inset-0 z-10"
                  />
                ) : (
                  <>
                    <Image
                      src="/about-image.jpg"
                      alt="Daffa Pandora"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    {/* Fallback gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6c757d] to-[#495057] flex items-center justify-center">
                      <span className="text-8xl font-bold text-white/30">DP</span>
                    </div>
                  </>
                )}
              </div>

              {/* Floating Badge - positioned below image */}
              <motion.div
                className="absolute -bottom-20 right-0 lg:right-4 bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 shadow-xl z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6c757d] to-[#495057] flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Currently</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {education.semester}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Spacer for floating badge */}
            <div className="h-16"></div>
          </div>

          {/* Right Column - Bio & Education */}
          <div className="space-y-8">
            {/* Bio */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold">Who I Am</h3>
              <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                <p>
                  I&apos;m <span className="text-[var(--foreground)] font-semibold">Daffa Pandora El-Farisin</span>, 
                  an Informatics undergraduate at Diponegoro University in Indonesia. 
                  I specialize in software project management, quality assurance, and full-stack development.
                </p>
                <p>
                  I have hands-on experience as a Full-Stack Engineer Intern at the Supreme Court of Indonesia, 
                  where I designed responsive interfaces and implemented secure backend solutions. 
                  My expertise includes React.js, Java, and SQL, with a strong foundation in Agile/Scrum 
                  methodologies and quality validation.
                </p>
                <p>
                  I&apos;m passionate about collaborating with diverse teams and delivering impactful digital 
                  solutions for organizations and communities. I believe in continuous learning and staying 
                  up-to-date with the latest technologies.
                </p>
              </div>
            </motion.div>

            {/* Education */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#6c757d]" />
                Education
              </h3>
              <div className="p-6 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#6c757d] to-[#495057] flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{education.university}</h4>
                    <p className="text-[#6c757d] font-medium">{education.major}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {education.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {education.period}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Relevant Coursework */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-sm font-semibold mb-2">Relevant Coursework:</p>
                  <div className="flex flex-wrap gap-2">
                    {education.coursework.map((course) => (
                      <span
                        key={course}
                        className="px-3 py-1 text-xs rounded-full bg-[#6c757d]/10 text-[#6c757d] border border-[#6c757d]/20"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download CV Button */}
            <motion.div variants={itemVariants}>
              <motion.a
                href="https://drive.google.com/file/d/1g1vVErAq7JRe6gUwIKOsTbgGO23gGL0G/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#6c757d] to-[#495057] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                Download CV
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
