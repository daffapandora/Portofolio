"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Award,
    ExternalLink,
    Upload,
    X,
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
import { db, COLLECTIONS, Certificate } from "@/lib/firebase";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CertificationsPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [certToDelete, setCertToDelete] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        issuer: "",
        imageUrl: "",
        credentialUrl: "",
        issueDate: "",
    });

    // Fetch certificates
    useEffect(() => {
        fetchCertificates();
    }, []);

    async function fetchCertificates() {
        try {
            const certsRef = collection(db, COLLECTIONS.CERTIFICATIONS);
            const q = query(certsRef, orderBy("order", "asc"));
            const snapshot = await getDocs(q);

            const certsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Certificate[];

            setCertificates(certsData);
        } catch (error) {
            console.error("Error fetching certificates:", error);
            toast.error("Failed to load certificates");
        } finally {
            setLoading(false);
        }
    }

    // Handle image upload
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
        }

        setUploading(true);
        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;

                // Compress image
                const img = document.createElement("img");
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxSize = 800;
                    let { width, height } = img;

                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    const compressed = canvas.toDataURL("image/jpeg", 0.8);
                    setFormData({ ...formData, imageUrl: compressed });
                    setUploading(false);
                };
                img.src = base64;
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
            setUploading(false);
        }
    }

    // Handle form submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.imageUrl) {
            toast.error("Please upload a certificate image");
            return;
        }

        setSaving(true);

        try {
            const certData = {
                name: formData.name,
                issuer: formData.issuer,
                imageUrl: formData.imageUrl,
                credentialUrl: formData.credentialUrl || null,
                issueDate: formData.issueDate || null,
                order: editingCert ? editingCert.order : certificates.length,
                updatedAt: new Date(),
            };

            if (editingCert?.id) {
                await updateDoc(doc(db, COLLECTIONS.CERTIFICATIONS, editingCert.id), certData);
                toast.success("Certificate updated successfully");
            } else {
                await addDoc(collection(db, COLLECTIONS.CERTIFICATIONS), {
                    ...certData,
                    createdAt: new Date(),
                });
                toast.success("Certificate added successfully");
            }

            setShowModal(false);
            resetForm();
            fetchCertificates();
        } catch (error) {
            console.error("Error saving certificate:", error);
            toast.error("Failed to save certificate");
        } finally {
            setSaving(false);
        }
    }

    // Handle delete
    async function handleDelete(id: string) {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, COLLECTIONS.CERTIFICATIONS, id));
            setCertificates(certificates.filter((c) => c.id !== id));
            setDeleteModalOpen(false);
            setCertToDelete(null);
            toast.success("Certificate deleted successfully");
        } catch (error) {
            console.error("Error deleting certificate:", error);
            toast.error("Failed to delete certificate");
        } finally {
            setDeleting(false);
        }
    }

    // Open edit modal
    function openEditModal(cert: Certificate) {
        setEditingCert(cert);
        setFormData({
            name: cert.name,
            issuer: cert.issuer,
            imageUrl: cert.imageUrl,
            credentialUrl: cert.credentialUrl || "",
            issueDate: cert.issueDate || "",
        });
        setShowModal(true);
    }

    // Reset form
    function resetForm() {
        setEditingCert(null);
        setFormData({
            name: "",
            issuer: "",
            imageUrl: "",
            credentialUrl: "",
            issueDate: "",
        });
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-[var(--background-secondary)] rounded w-48 animate-pulse" />
                    <div className="h-10 bg-[var(--background-secondary)] rounded w-40 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-64 bg-background border border-[var(--border)] rounded-xl animate-pulse"
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
                    <h1 className="text-2xl font-bold text-foreground">Certifications</h1>
                    <p className="text-[var(--text-muted)] mt-1">
                        Manage your professional certifications
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
                    Add Certificate
                </button>
            </div>

            {/* Certificates Grid */}
            {certificates.length === 0 ? (
                <div className="bg-background border border-[var(--border)] rounded-xl p-12 text-center">
                    <Award className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No certifications yet</h3>
                    <p className="text-[var(--text-muted)] mb-6">
                        Add your professional certifications to showcase
                    </p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add First Certificate
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-background border border-[var(--border)] rounded-xl overflow-hidden hover:border-foreground/20 transition-colors group"
                        >
                            {/* Image */}
                            <div className="relative h-40 w-full">
                                <Image
                                    src={cert.imageUrl}
                                    alt={cert.name}
                                    fill
                                    className="object-cover"
                                />
                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => openEditModal(cert)}
                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCertToDelete(cert.id!);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-medium text-foreground line-clamp-1">{cert.name}</h3>
                                <p className="text-sm text-[var(--text-muted)]">{cert.issuer}</p>
                                {cert.issueDate && (
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{cert.issueDate}</p>
                                )}
                                {cert.credentialUrl && (
                                    <a
                                        href={cert.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground mt-2"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        View Credential
                                    </a>
                                )}
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
                        className="bg-background border border-[var(--border)] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl font-semibold text-foreground mb-6">
                            {editingCert ? "Edit Certificate" : "Add Certificate"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Certificate Image */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Certificate Image *
                                </label>

                                {formData.imageUrl ? (
                                    <div className="relative">
                                        <div className="relative h-48 w-full rounded-lg overflow-hidden border border-[var(--border)]">
                                            <Image
                                                src={formData.imageUrl}
                                                alt="Certificate preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: "" })}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-foreground/30 transition-colors"
                                    >
                                        {uploading ? (
                                            <Loader2 className="h-8 w-8 mx-auto text-[var(--text-muted)] animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 mx-auto text-[var(--text-muted)] mb-2" />
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    Click to upload certificate image
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                    Max 2MB, JPG/PNG
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Certificate Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., AWS Solutions Architect"
                                />
                            </div>

                            {/* Issuer */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Issuing Organization *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.issuer}
                                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., Amazon Web Services"
                                />
                            </div>

                            {/* Issue Date */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Issue Date
                                </label>
                                <input
                                    type="text"
                                    value={formData.issueDate}
                                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="e.g., January 2024"
                                />
                            </div>

                            {/* Credential URL */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Credential URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.credentialUrl}
                                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                                    placeholder="https://credential.url/verify/..."
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
                                    {editingCert ? "Update" : "Add"} Certificate
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
                            Delete Certificate
                        </h3>
                        <p className="text-[var(--text-muted)] mb-6">
                            Are you sure you want to delete this certificate? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setCertToDelete(null);
                                }}
                                className="px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => certToDelete && handleDelete(certToDelete)}
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
