"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db, COLLECTIONS, Project } from "@/lib/firebase";
import {
    ArrowLeft,
    Github,
    Globe,
    Youtube,
    FileText,
    Play,
    ExternalLink,
    Calendar,
    Folder,
    Loader2,
    Figma
} from "lucide-react";
import Image from "next/image";
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

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        async function fetchProject() {
            if (!params.id) return;

            try {
                const docRef = doc(db, COLLECTIONS.PROJECTS, params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Project;
                    // Only show published projects
                    if (data.status === "published") {
                        setProject({ id: docSnap.id, ...data });
                    } else {
                        router.push("/#projects");
                    }
                } else {
                    router.push("/#projects");
                }
            } catch (error) {
                console.error("Error fetching project:", error);
                router.push("/#projects");
            } finally {
                setLoading(false);
            }
        }

        fetchProject();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-foreground" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    // Get all images (main + additional)
    const allImages = [
        project.imageUrl,
        ...(project.images || []),
    ].filter(Boolean) as string[];

    // Get visible links
    const visibleLinks = project.links?.filter(link => link.visible && link.url) || [];

    // Fallback to old github/demo if no links array
    const hasLegacyLinks = !project.links?.length && (project.githubUrl || project.demoUrl);

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/#projects"
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Projects</span>
                    </Link>

                    {/* Quick Links */}
                    <div className="flex items-center gap-3">
                        {visibleLinks.slice(0, 3).map((link, index) => {
                            const IconComponent = linkIcons[link.type] || ExternalLink;
                            return (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-foreground/10 transition-colors"
                                    title={link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </a>
                            );
                        })}
                        {hasLegacyLinks && (
                            <>
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-foreground/10 transition-colors"
                                        title="GitHub"
                                    >
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                                {project.demoUrl && (
                                    <a
                                        href={project.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-foreground/10 transition-colors"
                                        title="Live Demo"
                                    >
                                        <Globe className="w-5 h-5" />
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Title & Meta */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-foreground/10 text-foreground">
                                {project.category}
                            </span>
                            {project.featured && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                    Featured
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bbh-bartle-regular tracking-tight mb-4">
                            {project.title}
                        </h1>
                        <p className="text-lg text-[var(--text-muted)] max-w-3xl">
                            {project.description}
                        </p>
                    </div>

                    {/* Image Gallery */}
                    {allImages.length > 0 && (
                        <div className="mb-12">
                            {/* Main Image */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--background-secondary)] border border-[var(--border)] mb-4">
                                <Image
                                    src={allImages[activeImage]}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {allImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === index
                                                ? "border-foreground"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${project.title} ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Long Description */}
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold mb-4">About This Project</h2>
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                                    {project.longDescription || project.description}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tech Stack */}
                            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Folder className="w-4 h-4" />
                                    Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1.5 text-sm rounded-lg bg-foreground/5 text-foreground border border-[var(--border)]"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Links */}
                            {(visibleLinks.length > 0 || hasLegacyLinks) && (
                                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5">
                                    <h3 className="font-semibold mb-3">Project Links</h3>
                                    <div className="space-y-2">
                                        {visibleLinks.map((link, index) => {
                                            const IconComponent = linkIcons[link.type] || ExternalLink;
                                            return (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-foreground/5 transition-colors"
                                                >
                                                    <IconComponent className="w-5 h-5 text-[var(--text-muted)]" />
                                                    <span className="capitalize">{link.type}</span>
                                                    <ExternalLink className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                                                </a>
                                            );
                                        })}
                                        {hasLegacyLinks && (
                                            <>
                                                {project.githubUrl && (
                                                    <a
                                                        href={project.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-foreground/5 transition-colors"
                                                    >
                                                        <Github className="w-5 h-5 text-[var(--text-muted)]" />
                                                        <span>GitHub</span>
                                                        <ExternalLink className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                                                    </a>
                                                )}
                                                {project.demoUrl && (
                                                    <a
                                                        href={project.demoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-foreground/5 transition-colors"
                                                    >
                                                        <Globe className="w-5 h-5 text-[var(--text-muted)]" />
                                                        <span>Live Demo</span>
                                                        <ExternalLink className="w-4 h-4 ml-auto text-[var(--text-muted)]" />
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {project.createdAt && typeof project.createdAt === 'object' && 'toDate' in project.createdAt
                                        ? (project.createdAt as { toDate: () => Date }).toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
                                        : 'Unknown date'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
