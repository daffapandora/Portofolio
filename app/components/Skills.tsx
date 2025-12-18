"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, COLLECTIONS, Skill as SkillType, Certificate } from "@/lib/firebase";
import { DirectionAwareHover } from "./ui/direction-aware-hover";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";

// Fallback skills if none in database
const fallbackSkills = [
  { name: "React.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Git/GitHub", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
];

interface DisplaySkill {
  name: string;
  icon: string;
}

export default function Skills() {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const skillScrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [skills, setSkills] = useState<DisplaySkill[]>(fallbackSkills);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [skillCanScrollLeft, setSkillCanScrollLeft] = useState(false);
  const [skillCanScrollRight, setSkillCanScrollRight] = useState(false);

  // Fetch skills and certificates from Firebase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch skills
        const skillsRef = collection(db, COLLECTIONS.SKILLS);
        const skillsQuery = query(skillsRef, orderBy("order", "asc"));
        const skillsSnapshot = await getDocs(skillsQuery);

        const skillsData = skillsSnapshot.docs.map((doc) => {
          const data = doc.data() as SkillType;
          return {
            name: data.name,
            icon: data.icon || "",
          };
        });

        if (skillsData.length > 0) {
          setSkills(skillsData);
        }

        // Fetch certificates
        const certsRef = collection(db, COLLECTIONS.CERTIFICATIONS);
        const certsQuery = query(certsRef, orderBy("order", "asc"));
        const certsSnapshot = await getDocs(certsQuery);

        const certsData = certsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Certificate[];

        setCertificates(certsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Check scroll capabilities
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      checkScroll();
      scrollElement.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [certificates]);

  // Check skill scroll capabilities
  useEffect(() => {
    const checkSkillScroll = () => {
      if (skillScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = skillScrollRef.current;
        setSkillCanScrollLeft(scrollLeft > 0);
        setSkillCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollElement = skillScrollRef.current;
    if (scrollElement) {
      checkSkillScroll();
      scrollElement.addEventListener("scroll", checkSkillScroll);
      window.addEventListener("resize", checkSkillScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", checkSkillScroll);
      }
      window.removeEventListener("resize", checkSkillScroll);
    };
  }, [skills]);

  // Scroll function for certificates
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll function for skills (mobile only)
  const scrollSkills = (direction: "left" | "right") => {
    if (skillScrollRef.current) {
      // Calculate scroll amount based on container width (one "page" of 4 columns)
      const containerWidth = skillScrollRef.current.clientWidth;
      skillScrollRef.current.scrollBy({
        left: direction === "left" ? -containerWidth : containerWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="skills"
      ref={ref}
      className="min-h-screen flex items-center justify-center py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Skills Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold bbh-bartle-regular tracking-tight mb-4">
            Skills & Technologies
          </h2>
          <p className="text-[var(--text-muted)] max-w-lg mx-auto">
            Technologies and tools I work with to bring ideas to life.
          </p>
        </motion.div>

        {/* Skills Grid - Desktop: Normal Grid, Mobile: Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Loading Skeleton */}
          {loading && (
            <>
              {/* Desktop Loading Skeleton */}
              <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`skeleton-desktop-${i}`}
                    className="flex flex-col items-center gap-2 p-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--border)]" />
                    <div className="w-16 h-3 rounded bg-[var(--border)]" />
                  </div>
                ))}
              </div>
              {/* Mobile Loading Skeleton */}
              <div className="md:hidden">
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`skeleton-mobile-${i}`}
                      className="flex flex-col items-center gap-1 p-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--border)]" />
                      <div className="w-12 h-2 rounded bg-[var(--border)]" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actual Skills Content */}
          {!loading && (
            <>
              {/* Desktop Grid - Hidden on mobile, Grid on md+ */}
              <div className="hidden md:block">
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={`desktop-${skill.name}-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                      whileHover={{ y: -3, scale: 1.03 }}
                      className="group flex flex-col items-center gap-2 p-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl hover:border-foreground/20 transition-all duration-300"
                    >
                      {skill.icon && (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={skill.icon}
                            alt={skill.name}
                            fill
                            sizes="40px"
                            className="object-contain transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <span className="text-xs font-medium text-foreground text-center">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile Carousel - Hidden on desktop */}
              <div className="md:hidden relative">
                {/* Navigation Buttons */}
                {skillCanScrollLeft && (
                  <button
                    onClick={() => scrollSkills("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-foreground/10 transition-colors -translate-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {skillCanScrollRight && (
                  <button
                    onClick={() => scrollSkills("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-foreground/10 transition-colors translate-x-2"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {/* Scrollable Container with 2 rows x 4 columns per page */}
                <div
                  ref={skillScrollRef}
                  className="flex overflow-x-auto pb-4 snap-x snap-mandatory gap-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Group skills into chunks of 8 (4 columns x 2 rows) */}
                  {Array.from({ length: Math.ceil(skills.length / 8) }).map((_, pageIndex) => (
                    <div
                      key={`page-${pageIndex}`}
                      className="flex-shrink-0 w-full snap-center"
                    >
                      <div className="grid grid-cols-4 gap-3">
                        {skills.slice(pageIndex * 8, pageIndex * 8 + 8).map((skill, skillIndex) => (
                          <motion.div
                            key={`mobile-${skill.name}-${skillIndex}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: 0.1 + skillIndex * 0.03 }}
                            className="group flex flex-col items-center gap-1 p-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg"
                          >
                            {skill.icon && (
                              <div className="w-8 h-8 relative">
                                <Image
                                  src={skill.icon}
                                  alt={skill.name}
                                  fill
                                  sizes="32px"
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-1">
                              {skill.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Swipe Indicator + Page Dots */}
                {skills.length > 8 && (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <span className="text-xs text-[var(--text-muted)]">
                      ← Swipe to see more →
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Certifications Section */}
        {certificates.length > 0 && (
          <>
            {/* Certifications Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-24 mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-8 h-8 text-foreground" />
                <h3 className="text-2xl md:text-3xl font-bold bbh-bartle-regular tracking-tight">
                  Certifications
                </h3>
              </div>
              <p className="text-[var(--text-muted)] max-w-lg mx-auto">
                Professional certifications and credentials I&apos;ve earned.
              </p>
            </motion.div>

            {/* Certifications Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative"
            >
              {/* Navigation Buttons */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-foreground/10 transition-colors -translate-x-1/2 hidden md:flex"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background/90 backdrop-blur-sm border border-[var(--border)] rounded-full shadow-lg hover:bg-foreground/10 transition-colors translate-x-1/2 hidden md:flex"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-4 px-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex-shrink-0 snap-center"
                  >
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <DirectionAwareHover
                          imageUrl={cert.imageUrl}
                          className="h-40 w-64 sm:h-48 sm:w-80 md:h-56 md:w-96 cursor-pointer"
                        >
                          <p className="font-bold text-sm md:text-base line-clamp-2">
                            {cert.name}
                          </p>
                          <p className="font-normal text-xs md:text-sm text-white/80">
                            {cert.issuer}
                          </p>
                        </DirectionAwareHover>
                      </a>
                    ) : (
                      <DirectionAwareHover
                        imageUrl={cert.imageUrl}
                        className="h-40 w-64 sm:h-48 sm:w-80 md:h-56 md:w-96"
                      >
                        <p className="font-bold text-sm md:text-base line-clamp-2">
                          {cert.name}
                        </p>
                        <p className="font-normal text-xs md:text-sm text-white/80">
                          {cert.issuer}
                        </p>
                      </DirectionAwareHover>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Scroll Indicator (Mobile) */}
              {certificates.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 md:hidden">
                  <span className="text-xs text-[var(--text-muted)]">
                    ← Swipe to see more →
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
