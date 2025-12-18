"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, Search, Filter, Youtube, Figma, FileText, Play, Globe, Eye } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, COLLECTIONS, Project as FirebaseProject, ProjectLink } from "@/lib/firebase";
import Link from "next/link";

// Link icon mapping
const linkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  demo: Globe,
  youtube: Youtube,
  figma: Figma,
  documentation: FileText,
  video: Play,
  other: ExternalLink,
};

export interface Project {
  id: number | string;
  title: string;
  description: string;
  image: string;
  tech: string[];
  category: "web" | "mobile" | "ml" | "iot";
  github: string;
  demo?: string;
  links?: ProjectLink[];
  featured: boolean;
  date: string;
  status?: string;
}

const categories = [
  { value: "all", label: "All Projects" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "ml", label: "Machine Learning" },
  { value: "iot", label: "IoT" },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const techColors: Record<string, string> = {
    "React Native": "bg-[#61DAFB]/20 text-[#61DAFB]",
    Firebase: "bg-[#FFCA28]/20 text-[#FFCA28]",
    Expo: "bg-[#000020]/20 text-white",
    TypeScript: "bg-[#3178C6]/20 text-[#3178C6]",
    PHP: "bg-[#777BB4]/20 text-[#777BB4]",
    Laravel: "bg-[#FF2D20]/20 text-[#FF2D20]",
    "React.js": "bg-[#61DAFB]/20 text-[#61DAFB]",
    PostgreSQL: "bg-[#4169E1]/20 text-[#4169E1]",
    Arduino: "bg-[#00979D]/20 text-[#00979D]",
    "C++": "bg-[#00599C]/20 text-[#00599C]",
    IoT: "bg-[#00D4AA]/20 text-[#00D4AA]",
    Sensors: "bg-[#495057]/20 text-[#495057]",
    "Next.js": "bg-[#000000]/20 text-white",
    "Tailwind CSS": "bg-[#f8f9fa]/20 text-[#f8f9fa]",
    Python: "bg-[#3776AB]/20 text-[#3776AB]",
    TensorFlow: "bg-[#FF6F00]/20 text-[#FF6F00]",
    Keras: "bg-[#D00000]/20 text-[#D00000]",
    NumPy: "bg-[#013243]/20 text-[#4DABCF]",
    "Framer Motion": "bg-[#0055FF]/20 text-[#0055FF]",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-background rounded-2xl overflow-hidden border border-[var(--border)] hover:border-foreground/30 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/10"
    >
      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-foreground text-background text-xs font-semibold rounded-full">
          Featured
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5" />
        { }
        <img
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 to-foreground/20 flex items-center justify-center -z-10">
          <span className="text-4xl font-bold text-foreground/30">
            {project.title.substring(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <div className="flex gap-3 flex-wrap justify-center">
            {/* View Details Button */}
            <Link
              href={`/project/${project.id}`}
              className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </Link>

            {/* Render links from new links array (visible only) */}
            {project.links && project.links.length > 0 ? (
              project.links
                .filter(link => link.visible && link.url)
                .map((link, index) => {
                  const IconComponent = linkIcons[link.type] || ExternalLink;
                  return (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                    >
                      <IconComponent className="w-5 h-5" />
                    </motion.a>
                  );
                })
            ) : (
              /* Fallback to old github/demo links for backward compatibility */
              <>
                {project.github && (
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </motion.a>
                )}
                {project.demo && (
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Live Demo"
                  >
                    <Globe className="w-5 h-5" />
                  </motion.a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold group-hover:text-foreground/70 transition-colors">
            {project.title}
          </h3>
          <span className="text-xs text-[var(--text-muted)]">{project.date}</span>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className={`px-2 py-1 text-xs font-medium rounded-md ${techColors[tech] || "bg-foreground/10 text-foreground"
                }`}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [projects, setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Simple query without composite index requirement
        const q = query(
          collection(db, COLLECTIONS.PROJECTS),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const firebaseProjects: Project[] = snapshot.docs
            .map((doc) => {
              const data = doc.data() as FirebaseProject;
              // Map Firebase project to local Project interface
              const categoryMap: Record<string, "web" | "mobile" | "ml" | "iot"> = {
                "Web": "web",
                "Mobile": "mobile",
                "Machine Learning": "ml",
                "IoT": "iot",
                "Other": "web",
              };

              return {
                id: doc.id,
                title: data.title,
                description: data.description,
                image: data.imageUrl || "/projects/placeholder.jpg",
                tech: data.techStack || [],
                category: categoryMap[data.category] || "web",
                github: data.githubUrl || "",
                demo: data.demoUrl || undefined,
                links: data.links || [],
                featured: data.featured,
                date: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.getFullYear?.()?.toString() || "2024",
                status: data.status,
              };
            })
            // Filter published projects client-side
            .filter((project) => project.status === "published");

          if (firebaseProjects.length > 0) {
            setProjects(firebaseProjects);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Keep static projects as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project: Project) => {
    const matchesCategory =
      activeCategory === "all" || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  return (
    <section id="projects" ref={ref} className="section-padding relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold bbh-bartle-regular tracking-tight mb-4">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            A collection of projects I&apos;ve worked on, showcasing my skills in
            web development, mobile apps, IoT, and machine learning.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-4 mb-8"
        >
          {/* Search Input - full width on mobile */}
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            {mounted && (
              <>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full border-none outline-none rounded-full py-3 pl-11 pr-4 text-sm bg-[var(--background-secondary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-foreground/20 transition-all"
                  suppressHydrationWarning
                />
                <Search className="absolute top-1/2 left-4 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
              </>
            )}
          </div>

          {/* Category Filter - scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-2 px-2 scrollbar-hide">
            <Filter className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  setActiveCategory(category.value);
                  setVisibleCount(6);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeCategory === category.value
                  ? "bg-foreground text-background"
                  : "bg-[var(--background-secondary)] text-[var(--text-muted)] hover:text-foreground"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="wait">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-[var(--text-muted)]">
              No projects found matching your criteria.
            </p>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-8 py-3 border-2 border-foreground text-foreground font-semibold rounded-lg hover:bg-foreground/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Projects
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
