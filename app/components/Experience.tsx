"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Briefcase, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, COLLECTIONS, Experience as ExperienceType } from "@/lib/firebase";

interface ExperienceCardProps {
    position: string;
    type: string;
    company: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    skills: string[];
    index: number;
}

function ExperienceCard({
    position,
    type,
    company,
    startDate,
    endDate,
    location,
    description,
    skills,
    index,
}: ExperienceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative w-full sm:max-w-[320px] rounded-2xl overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl transition-all duration-300 group-hover:border-foreground/30" />

            {/* Content */}
            <div className="relative z-10 flex flex-col p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    {/* Job Type Badge */}
                    <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${type === "Magang"
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            : type === "Full-time"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : type === "Part-time"
                                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                    : type === "Freelance"
                                        ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                                        : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            }`}
                    >
                        {type}
                    </span>

                    {/* Date Range */}
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {startDate} - {endDate}
                        </span>
                    </div>
                </div>

                {/* Position Title */}
                <h3 className="text-xl font-bold text-foreground mb-2 bbh-bartle-regular tracking-wide">
                    {position}
                </h3>

                {/* Company & Location */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[var(--border)] mb-4" />

                {/* Description with Read More */}
                <div className="text-[var(--text-muted)] text-sm leading-relaxed">
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.p
                                key="full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {description}
                            </motion.p>
                        ) : (
                            <motion.p
                                key="truncated"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="line-clamp-3"
                            >
                                {description}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Read More Button */}
                    {description.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 mt-2 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    <span>Show less</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    <span>Read more</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Skills Tags - limit to 4 on mobile */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                    {skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill}
                            className="px-2.5 py-1 text-xs rounded-md bg-foreground/5 text-foreground/80 border border-[var(--border)] hover:bg-foreground/10 transition-colors duration-200"
                        >
                            {skill}
                        </span>
                    ))}
                    {skills.length > 4 && (
                        <span className="px-2.5 py-1 text-xs rounded-md bg-foreground/5 text-foreground/60 border border-[var(--border)]">
                            +{skills.length - 4} more
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function Experience() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [experiences, setExperiences] = useState<ExperienceType[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch experiences from Firebase
    useEffect(() => {
        async function fetchExperiences() {
            try {
                const experiencesRef = collection(db, COLLECTIONS.EXPERIENCES);
                const q = query(experiencesRef, orderBy("order", "asc"));
                const snapshot = await getDocs(q);

                const experiencesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ExperienceType[];

                setExperiences(experiencesData);
            } catch (error) {
                console.error("Error fetching experiences:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiences();
    }, []);

    // Don't render section if no experiences and not loading
    if (!loading && experiences.length === 0) {
        return null;
    }

    return (
        <section
            id="experience"
            ref={ref}
            className="min-h-screen flex items-center justify-center py-16 md:py-20 px-4 sm:px-6"
        >
            <div className="w-full max-w-[1400px] mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold bbh-bartle-regular tracking-tight mb-4">
                        Experience
                    </h2>
                    <p className="text-[var(--text-muted)] max-w-md mx-auto">
                        My professional journey and internship experiences that shaped my
                        skills and expertise.
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center gap-8">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-[400px] w-full max-w-[320px] rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* Experience Cards Grid */}
                {!loading && (
                    <div className="flex flex-wrap justify-center gap-8">
                        {experiences.map((exp, index) => (
                            <ExperienceCard
                                key={exp.id}
                                position={exp.position}
                                type={exp.type}
                                company={exp.company}
                                startDate={exp.startDate}
                                endDate={exp.endDate}
                                location={exp.location}
                                description={exp.description}
                                skills={exp.skills || []}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Timeline connector for larger screens */}
                {!loading && experiences.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="hidden lg:block mt-12"
                    >
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-24 h-px bg-gradient-to-r from-transparent to-[var(--border)]" />
                            <Briefcase className="w-5 h-5 text-[var(--text-muted)]" />
                            <div className="w-24 h-px bg-gradient-to-l from-transparent to-[var(--border)]" />
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
