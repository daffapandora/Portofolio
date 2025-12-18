"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Briefcase,
    Calendar,
    MapPin,
    Building2,
    GripVertical,
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
    serverTimestamp,
} from "firebase/firestore";
import { db, COLLECTIONS, Experience } from "@/lib/firebase";
import toast from "react-hot-toast";

const jobTypes = ["Magang", "Full-time", "Part-time", "Freelance", "Contract"];

export default function ExperiencesPage() {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        position: "",
        type: "Magang" as Experience["type"],
        company: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        skills: "",
    });

    // Fetch experiences
    useEffect(() => {
        fetchExperiences();
    }, []);

    async function fetchExperiences() {
        try {
            const experiencesRef = collection(db, COLLECTIONS.EXPERIENCES);
            const q = query(experiencesRef, orderBy("order", "asc"));
            const snapshot = await getDocs(q);

            const experiencesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Experience[];

            setExperiences(experiencesData);
        } catch (error) {
            console.error("Error fetching experiences:", error);
            toast.error("Failed to load experiences");
        } finally {
            setLoading(false);
        }
    }

    // Handle form submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const experienceData = {
                position: formData.position,
                type: formData.type,
                company: formData.company,
                startDate: formData.startDate,
                endDate: formData.endDate,
                location: formData.location,
                description: formData.description,
                skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
                order: editingExperience ? editingExperience.order : experiences.length,
                updatedAt: serverTimestamp(),
            };

            if (editingExperience?.id) {
                // Update existing
                await updateDoc(doc(db, COLLECTIONS.EXPERIENCES, editingExperience.id), experienceData);
                toast.success("Experience updated successfully");
            } else {
                // Create new
                await addDoc(collection(db, COLLECTIONS.EXPERIENCES), {
                    ...experienceData,
                    createdAt: serverTimestamp(),
                });
                toast.success("Experience added successfully");
            }

            setShowModal(false);
            resetForm();
            fetchExperiences();
        } catch (error) {
            console.error("Error saving experience:", error);
            toast.error("Failed to save experience");
        } finally {
            setSaving(false);
        }
    }

    // Handle delete
    async function handleDelete(id: string) {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, COLLECTIONS.EXPERIENCES, id));
            setExperiences(experiences.filter((exp) => exp.id !== id));
            setDeleteModalOpen(false);
            setExperienceToDelete(null);
            toast.success("Experience deleted successfully");
        } catch (error) {
            console.error("Error deleting experience:", error);
            toast.error("Failed to delete experience");
        } finally {
            setDeleting(false);
        }
    }

    // Open edit modal
    function openEditModal(exp: Experience) {
        setEditingExperience(exp);
        setFormData({
            position: exp.position,
            type: exp.type,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            location: exp.location,
            description: exp.description,
            skills: exp.skills?.join(", ") || "",
        });
        setShowModal(true);
    }

    // Reset form
    function resetForm() {
        setEditingExperience(null);
        setFormData({
            position: "",
            type: "Magang",
            company: "",
            startDate: "",
            endDate: "",
            location: "",
            description: "",
            skills: "",
        });
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-[var(--background-secondary)] rounded w-48 animate-pulse" />
                    <div className="h-10 bg-[var(--background-secondary)] rounded w-40 animate-pulse" />
                </div>
                <div className="grid gap-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-background border border-[var(--border)] rounded-xl animate-pulse"
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
                    <h1 className="text-2xl font-bold text-foreground">Experiences</h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        Manage your work experience and internships
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
                    Add Experience
                </button>
            </div>

            {/* Experience List */}
            {experiences.length === 0 ? (
                <div className="bg-background border border-[var(--border)] rounded-xl p-12 text-center">
                    <Briefcase className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No experiences yet</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Add your work experience to showcase on your portfolio
                    </p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add First Experience
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-background border border-[var(--border)] rounded-xl p-6 hover:border-foreground/20 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <div className="pt-1 cursor-move text-[var(--text-muted)]">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {exp.position}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${exp.type === "Magang"
                                                        ? "bg-blue-500/10 text-blue-500"
                                                        : exp.type === "Full-time"
                                                            ? "bg-green-500/10 text-green-500"
                                                            : "bg-purple-500/10 text-purple-500"
                                                        }`}
                                                >
                                                    {exp.type}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1.5">
                                                    <Building2 className="h-4 w-4" />
                                                    {exp.company}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {exp.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {exp.startDate} - {exp.endDate}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-[var(--text-muted)] line-clamp-2">
                                                {exp.description}
                                            </p>
                                            {exp.skills && exp.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {exp.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="px-2 py-0.5 text-xs bg-[var(--background-secondary)] text-[var(--text-muted)] rounded"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(exp)}
                                                className="p-2 text-[var(--text-muted)] hover:text-foreground hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setExperienceToDelete(exp.id!);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
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
                        className="bg-background border border-[var(--border)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-6">
                            {editingExperience ? "Edit Experience" : "Add Experience"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Position */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Position / Role *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., Full-Stack Engineer Intern"
                                />
                            </div>

                            {/* Type & Company */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Job Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Experience["type"] })}
                                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    >
                                        {jobTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Company / Organization *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                        placeholder="e.g., Supreme Court of Indonesia"
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                        placeholder="e.g., Jul 2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                        placeholder="e.g., Aug 2024 or Present"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., Jakarta, Indonesia"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="Describe your responsibilities and achievements..."
                                />
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Skills (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., React.js, Java, SQL, Agile"
                                />
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
                                    {editingExperience ? "Update" : "Add"} Experience
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
                            Delete Experience
                        </h3>
                        <p className="text-[var(--text-muted)] mb-6">
                            Are you sure you want to delete this experience? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setExperienceToDelete(null);
                                }}
                                className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => experienceToDelete && handleDelete(experienceToDelete)}
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
