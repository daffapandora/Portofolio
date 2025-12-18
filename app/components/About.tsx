"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { CometCard } from "@/app/components/ui/comet-card";
import { doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS, SETTINGS_DOC_ID, ProfileSettings } from "@/lib/firebase";

// Default fallback image
const DEFAULT_ABOUT_IMAGE = "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Default values
const defaults = {
  displayName: "Daffa Pandora El-Farisin",
  bio: "an Informatics undergraduate at Diponegoro University. I specialize in full-stack development with React, Next.js, and Firebase.",
  bioExtended: "I have hands-on experience as a Full-Stack Engineer Intern at the Supreme Court of Indonesia, where I designed responsive interfaces and implemented secure backend solutions. My expertise includes React.js, Java, and SQL, with a strong foundation in Agile methodologies.",
  bioPassion: "I'm passionate about creating impactful digital solutions and continuously learning the latest technologies.",
  education: {
    degree: "Informatics / Computer Science",
    university: "Diponegoro University",
    period: "2023 - 2027 (Expected)",
    gpa: "",
    coursework: [
      "Data Structures",
      "Software Engineering",
      "Database Systems",
      "Web Development",
      "Mobile Development",
      "Machine Learning",
    ],
  },
  cvUrl: "https://drive.google.com/file/d/1g1vVErAq7JRe6gUwIKOsTbgGO23gGL0G/view?usp=sharing",
  location: "Semarang, Indonesia",
};

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // State for profile data from Firebase
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
        console.error("Error loading profile settings:", error);
      }
    }

    loadSettings();
  }, []);

  // Get values with fallbacks
  const aboutImage = settings?.aboutImage || DEFAULT_ABOUT_IMAGE;
  const displayName = settings?.displayName || defaults.displayName;
  const bio = settings?.bio || defaults.bio;
  const bioExtended = settings?.bioExtended || defaults.bioExtended;
  const bioPassion = settings?.bioPassion || defaults.bioPassion;
  const education = settings?.education || defaults.education;
  const cvUrl = settings?.cvUrl || defaults.cvUrl;
  const location = settings?.location || defaults.location;

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

  return (
    <section
      id="about"
      ref={ref}
      className="min-h-screen flex items-center justify-center py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column: Who I Am & Education */}
          <div className="space-y-12 md:space-y-20">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl md:text-4xl font-bold bbh-bartle-regular tracking-tight">
                Who I Am
              </h1>
            </motion.div>

            {/* Introduction - Dynamic from Firebase */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4 md:space-y-6 text-[var(--text-muted)] text-sm md:text-base leading-relaxed text-center lg:text-left"
            >
              <p>
                I&apos;m <span className="text-foreground font-semibold">{displayName}</span>,{" "}
                {bio}
              </p>
              {bioExtended && <p>{bioExtended}</p>}
              {bioPassion && <p>{bioPassion}</p>}
            </motion.div>

            {/* Education Section - Dynamic from Firebase */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Education Header */}
              <h2 className="text-2xl md:text-3xl font-bold bbh-bartle-regular tracking-tight text-center lg:text-left">
                Education
              </h2>

              {/* Education Card */}
              <div className="space-y-4 p-5 sm:p-8 md:p-10 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  {education.university}
                </h3>
                <p className="text-[var(--text-muted)] text-sm md:text-base">
                  {education.degree}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {education.period}
                  </span>
                </div>

                {/* Relevant Coursework */}
                {education.coursework && education.coursework.length > 0 && (
                  <div className="pt-6 space-y-3">
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide">
                      Relevant Coursework
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {education.coursework.map((course) => (
                        <span
                          key={course}
                          className="px-3 py-1 text-xs bg-[var(--border)] text-foreground rounded-full"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Download CV */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: 0.3 }}
              className="text-center lg:text-left pt-4"
            >
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-all duration-300 hover:gap-4 hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
            </motion.div>
          </div>

          {/* Right Column: CometCard Invitation */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center lg:justify-end"
          >
            <CometCard className="max-w-[420px] w-full">
              <button
                type="button"
                className="flex w-full cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-2 md:p-4"
                aria-label="View portfolio invitation"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "none",
                  opacity: 1,
                }}
              >
                <div className="mx-2 flex-1">
                  <div className="relative mt-2 aspect-[3/4] w-full">
                    <img
                      loading="lazy"
                      className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover contrast-75"
                      alt="Portfolio invitation background"
                      src={aboutImage}
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                        opacity: 1,
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
                  <div className="text-xs">Portfolio Invitation</div>
                  <div className="text-xs text-gray-300 opacity-50">#2024</div>
                </div>
              </button>
            </CometCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
