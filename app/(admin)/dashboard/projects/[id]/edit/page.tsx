"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  Github,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
  Youtube,
  Figma,
  Globe,
  FileText,
  Play,
  Plus,
} from "lucide-react";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS, Project } from "@/lib/firebase";

// Link types configuration
const linkTypes = [
  { id: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/username/repo" },
  { id: "demo", label: "Live Demo", icon: Globe, placeholder: "https://your-demo-site.com" },
  { id: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/watch?v=..." },
  { id: "figma", label: "Figma", icon: Figma, placeholder: "https://figma.com/file/..." },
  { id: "documentation", label: "Documentation", icon: FileText, placeholder: "https://docs.example.com" },
  { id: "video", label: "Video Demo", icon: Play, placeholder: "https://video-url.com" },
  { id: "other", label: "Other", icon: ExternalLink, placeholder: "https://..." },
];

interface ProjectLink {
  type: string;
  url: string;
  visible: boolean;
}

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const categories = ["Web", "Mobile", "IoT", "Machine Learning", "Other"];
const techOptions = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "Firebase",
  "Tailwind CSS",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Flutter",
  "React Native",
  "TensorFlow",
  "PyTorch",
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [customTech, setCustomTech] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);

  // Link management functions
  const addLink = () => {
    setProjectLinks([...projectLinks, { type: "other", url: "", visible: true }]);
  };

  const removeLink = (index: number) => {
    setProjectLinks(projectLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof ProjectLink, value: string | boolean) => {
    const updated = [...projectLinks];
    updated[index] = { ...updated[index], [field]: value };
    setProjectLinks(updated);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    async function fetchProject() {
      try {
        const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as Project;
          reset({
            title: data.title,
            description: data.description,
            longDescription: data.longDescription || "",
            category: data.category,
            status: data.status,
            featured: data.featured,
          });
          setTechStack(data.techStack || []);
          setExistingImages(data.images || (data.imageUrl ? [data.imageUrl] : []));

          // Load existing links or convert from old format
          if (data.links && Array.isArray(data.links)) {
            setProjectLinks(data.links);
          } else {
            // Convert old githubUrl/demoUrl format to new links format
            const convertedLinks: ProjectLink[] = [];
            if (data.githubUrl) {
              convertedLinks.push({ type: "github", url: data.githubUrl, visible: true });
            }
            if (data.demoUrl) {
              convertedLinks.push({ type: "demo", url: data.demoUrl, visible: true });
            }
            setProjectLinks(convertedLinks);
          }
        } else {
          router.push("/dashboard/projects");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, reset, router]);

  // Compress image to reduce file size
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    addImages(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    addImages(files);
  };

  const addImages = async (files: File[]) => {
    setNewImages((prev) => [...prev, ...files]);

    for (const file of files) {
      try {
        // Compress the image before storing
        const compressedBase64 = await compressImage(file, 800, 0.6);
        setNewImagePreviews((prev) => [...prev, compressedBase64]);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addTech = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const addCustomTech = () => {
    if (customTech.trim() && !techStack.includes(customTech.trim())) {
      setTechStack([...techStack, customTech.trim()]);
      setCustomTech("");
    }
  };

  // Convert new images to base64 strings
  const convertImagesToBase64 = (): string[] => {
    // newImagePreviews already contains base64 strings from FileReader
    return newImagePreviews;
  };

  const onSubmit = async (data: ProjectFormData) => {
    setUploading(true);
    try {
      // Combine existing images with new base64 images
      const newBase64Images = convertImagesToBase64();
      const allImages = [...existingImages, ...newBase64Images];

      // Filter out empty links
      const validLinks = projectLinks.filter(link => link.url.trim() !== "");

      // For backward compatibility, extract github and demo URLs
      const githubLink = validLinks.find(link => link.type === "github");
      const demoLink = validLinks.find(link => link.type === "demo");

      const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      await updateDoc(docRef, {
        ...data,
        techStack,
        imageUrl: allImages[0] || null,
        images: allImages,
        links: validLinks,
        githubUrl: githubLink?.url || null,
        demoUrl: demoLink?.url || null,
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const docRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      await deleteDoc(docRef);
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Project
          </h1>
        </div>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
                }`}
              placeholder="Project title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
                }`}
              placeholder="Brief description of the project"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Description
            </label>
            <textarea
              {...register("longDescription")}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the project, features, challenges, etc."
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category")}
                className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
                  }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register("featured")}
              id="featured"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="featured"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Featured project (shown prominently on homepage)
            </label>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tech Stack
          </h2>

          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {techOptions
              .filter((tech) => !techStack.includes(tech))
              .map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => addTech(tech)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  + {tech}
                </button>
              ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTech();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add custom technology..."
            />
            <button
              type="button"
              onClick={addCustomTech}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Add
            </button>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Links
            </h2>
            <button
              type="button"
              onClick={addLink}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </button>
          </div>

          {projectLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ExternalLink className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No links added yet. Click &quot;Add Link&quot; to add project links.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projectLinks.map((link, index) => {
                const linkConfig = linkTypes.find(lt => lt.id === link.type) || linkTypes[linkTypes.length - 1];
                const IconComponent = linkConfig.icon;

                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <select
                          value={link.type}
                          onChange={(e) => updateLink(index, "type", e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {linkTypes.map((lt) => (
                            <option key={lt.id} value={lt.id}>
                              {lt.label}
                            </option>
                          ))}
                        </select>
                        <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>

                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={linkConfig.placeholder}
                      />

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.visible}
                          onChange={(e) => updateLink(index, "visible", e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Show on portfolio
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Images
          </h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Images
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById("image-input")?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Max 5MB per image. Images will be compressed automatically.
            </p>
            <input
              type="file"
              id="image-input"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                New Images to Upload
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImagePreviews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end gap-4"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Changes
          </button>
        </motion.div>
      </form>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this project? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
