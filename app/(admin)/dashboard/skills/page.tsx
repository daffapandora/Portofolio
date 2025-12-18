"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Code2,
} from "lucide-react";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
} from "firebase/firestore";
import { db, COLLECTIONS, Skill } from "@/lib/firebase";
import toast from "react-hot-toast";
import Image from "next/image";

// Predefined icons from devicons
const iconSuggestions = [
    { name: "React.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "Laravel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg" },
    { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
    { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
];

const categories = ["Frontend", "Backend", "Database", "Tools", "Mobile", "Other"];

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "Frontend",
        icon: "",
        level: 80,
    });

    // Fetch skills
    useEffect(() => {
        fetchSkills();
    }, []);

    async function fetchSkills() {
        try {
            const skillsRef = collection(db, COLLECTIONS.SKILLS);
            const q = query(skillsRef, orderBy("order", "asc"));
            const snapshot = await getDocs(q);

            const skillsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Skill[];

            setSkills(skillsData);
        } catch (error) {
            console.error("Error fetching skills:", error);
            toast.error("Failed to load skills");
        } finally {
            setLoading(false);
        }
    }

    // Handle form submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Check for duplicate skill (case-insensitive)
        const skillExists = skills.some(
            (s) => s.name.toLowerCase() === formData.name.toLowerCase() &&
                (!editingSkill || s.id !== editingSkill.id)
        );

        if (skillExists) {
            toast.error(`Skill "${formData.name}" already exists!`);
            return;
        }

        setSaving(true);

        try {
            const skillData = {
                name: formData.name,
                category: formData.category,
                icon: formData.icon,
                level: formData.level,
                order: editingSkill ? editingSkill.order : skills.length,
            };

            if (editingSkill?.id) {
                await updateDoc(doc(db, COLLECTIONS.SKILLS, editingSkill.id), skillData);
                toast.success("Skill updated successfully");
            } else {
                await addDoc(collection(db, COLLECTIONS.SKILLS), skillData);
                toast.success("Skill added successfully");
            }

            setShowModal(false);
            resetForm();
            fetchSkills();
        } catch (error) {
            console.error("Error saving skill:", error);
            toast.error("Failed to save skill");
        } finally {
            setSaving(false);
        }
    }

    // Handle delete
    async function handleDelete(id: string) {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, COLLECTIONS.SKILLS, id));
            setSkills(skills.filter((s) => s.id !== id));
            setDeleteModalOpen(false);
            setSkillToDelete(null);
            toast.success("Skill deleted successfully");
        } catch (error) {
            console.error("Error deleting skill:", error);
            toast.error("Failed to delete skill");
        } finally {
            setDeleting(false);
        }
    }

    // Open edit modal
    function openEditModal(skill: Skill) {
        setEditingSkill(skill);
        setFormData({
            name: skill.name,
            category: skill.category,
            icon: skill.icon || "",
            level: skill.level,
        });
        setShowModal(true);
    }

    // Reset form
    function resetForm() {
        setEditingSkill(null);
        setFormData({
            name: "",
            category: "Frontend",
            icon: "",
            level: 80,
        });
    }

    // Select suggested icon
    function selectSuggestedIcon(suggestion: typeof iconSuggestions[0]) {
        // Check if this skill already exists
        const alreadyExists = skills.some(
            (s) => s.name.toLowerCase() === suggestion.name.toLowerCase()
        );

        if (alreadyExists && !editingSkill) {
            toast.error(`"${suggestion.name}" already exists in your skills!`);
            // Still set the icon but don't set the name
            setFormData({
                ...formData,
                icon: suggestion.icon,
            });
            return;
        }

        setFormData({
            ...formData,
            name: formData.name || suggestion.name,
            icon: suggestion.icon,
        });
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-[var(--background-secondary)] rounded w-48 animate-pulse" />
                    <div className="h-10 bg-[var(--background-secondary)] rounded w-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-background border border-[var(--border)] rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Skills</h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        Manage your technical skills
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Skill
                </button>
            </div>

            {/* Skills Grid */}
            {skills.length === 0 ? (
                <div className="bg-background border border-[var(--border)] rounded-xl p-12 text-center">
                    <Code2 className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No skills yet</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Add your technical skills to showcase on your portfolio
                    </p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add First Skill
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {skills.map((skill, index) => (
                        <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="bg-background border border-[var(--border)] rounded-xl p-4 hover:border-foreground/20 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {skill.icon && (
                                    <div className="w-10 h-10 flex-shrink-0">
                                        <Image
                                            src={skill.icon}
                                            alt={skill.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">{skill.name}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{skill.category}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(skill)}
                                        className="p-1.5 text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--background-secondary)] rounded transition-colors"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSkillToDelete(skill.id!);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background border border-[var(--border)] rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-6">
                            {editingSkill ? "Edit Skill" : "Add Skill"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Skill Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., React.js"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Icon URL */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Icon URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                        placeholder="https://cdn.jsdelivr.net/..."
                                    />
                                    {formData.icon && (
                                        <div className="w-10 h-10 border border-[var(--border)] rounded-lg p-1 flex items-center justify-center">
                                            <Image
                                                src={formData.icon}
                                                alt="Preview"
                                                width={32}
                                                height={32}
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Icon Suggestions */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Quick Select Icon
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                                    {iconSuggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.name}
                                            type="button"
                                            onClick={() => selectSuggestedIcon(suggestion)}
                                            className="w-10 h-10 p-1.5 border border-[var(--border)] rounded-lg hover:border-foreground/30 transition-colors"
                                            title={suggestion.name}
                                        >
                                            <Image
                                                src={suggestion.icon}
                                                alt={suggestion.name}
                                                width={28}
                                                height={28}
                                                className="w-full h-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingSkill ? "Update" : "Add"} Skill
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background border border-[var(--border)] rounded-xl p-6 max-w-md mx-4"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Delete Skill
                        </h3>
                        <p className="text-[var(--text-muted)] mb-6">
                            Are you sure you want to delete this skill? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSkillToDelete(null);
                                }}
                                className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => skillToDelete && handleDelete(skillToDelete)}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
