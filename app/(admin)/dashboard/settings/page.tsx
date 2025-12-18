"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, COLLECTIONS, SETTINGS_DOC_ID, ProfileSettings } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Profile settings state
  const [displayName, setDisplayName] = useState("Daffa Pandora El-farisin");
  const [title, setTitle] = useState("Full Stack Developer");
  const [location, setLocation] = useState("Semarang, Indonesia");
  const [bio, setBio] = useState("");
  const [heroTagline, setHeroTagline] = useState("");
  const [bioExtended, setBioExtended] = useState("");
  const [bioPassion, setBioPassion] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  // Education state
  const [eduDegree, setEduDegree] = useState("Informatics / Computer Science");
  const [eduUniversity, setEduUniversity] = useState("Diponegoro University");
  const [eduPeriod, setEduPeriod] = useState("2023 - 2027 (Expected)");
  const [eduCoursework, setEduCoursework] = useState("Data Structures, Software Engineering, Database Systems, Web Development, Mobile Development, Machine Learning");

  // Profile images state
  const [heroImage, setHeroImage] = useState<string>("");
  const [aboutImage, setAboutImage] = useState<string>("");
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const [aboutImagePreview, setAboutImagePreview] = useState<string>("");

  // Social links state
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  // Load settings from Firebase
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as ProfileSettings;
          setDisplayName(data.displayName || "Daffa Pandora El-farisin");
          setTitle(data.title || "Full Stack Developer");
          setLocation(data.location || "Semarang, Indonesia");
          setBio(data.bio || "");
          setHeroTagline(data.heroTagline || "");
          setBioExtended(data.bioExtended || "");
          setBioPassion(data.bioPassion || "");
          setCvUrl(data.cvUrl || "");
          // Education
          if (data.education) {
            setEduDegree(data.education.degree || "Informatics / Computer Science");
            setEduUniversity(data.education.university || "Diponegoro University");
            setEduPeriod(data.education.period || "2023 - 2027 (Expected)");
            setEduCoursework(data.education.coursework?.join(", ") || "");
          }
          setHeroImage(data.heroImage || "");
          setHeroImagePreview(data.heroImage || "");
          setAboutImage(data.aboutImage || "");
          setAboutImagePreview(data.aboutImage || "");
          setGithub(data.socialLinks?.github || "");
          setLinkedin(data.socialLinks?.linkedin || "");
          setTwitter(data.socialLinks?.twitter || "");
          setInstagram(data.socialLinks?.instagram || "");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Compress image to reduce file size (same as projects)
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
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

  // Handle hero image selection
  const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      try {
        const compressedBase64 = await compressImage(file, 600, 0.7);
        setHeroImage(compressedBase64);
        setHeroImagePreview(compressedBase64);
      } catch (error) {
        console.error("Error compressing hero image:", error);
      }
    }
  };

  // Handle about image selection
  const handleAboutImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      try {
        const compressedBase64 = await compressImage(file, 600, 0.7);
        setAboutImage(compressedBase64);
        setAboutImagePreview(compressedBase64);
      } catch (error) {
        console.error("Error compressing about image:", error);
      }
    }
  };

  // Handle drop for hero image
  const handleHeroImageDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      try {
        const compressedBase64 = await compressImage(file, 600, 0.7);
        setHeroImage(compressedBase64);
        setHeroImagePreview(compressedBase64);
      } catch (error) {
        console.error("Error compressing hero image:", error);
      }
    }
  }, []);

  // Handle drop for about image
  const handleAboutImageDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      try {
        const compressedBase64 = await compressImage(file, 600, 0.7);
        setAboutImage(compressedBase64);
        setAboutImagePreview(compressedBase64);
      } catch (error) {
        console.error("Error compressing about image:", error);
      }
    }
  }, []);

  // Save settings to Firebase
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");

    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      await setDoc(docRef, {
        displayName,
        title,
        location,
        bio,
        heroTagline,
        bioExtended,
        bioPassion,
        cvUrl,
        heroImage,
        aboutImage,
        education: {
          degree: eduDegree,
          university: eduUniversity,
          period: eduPeriod,
          coursework: eduCoursework.split(",").map(s => s.trim()).filter(Boolean),
        },
        socialLinks: {
          github,
          linkedin,
          twitter,
          instagram,
          email: user?.email || "",
        },
        updatedAt: serverTimestamp(),
      });

      setSuccessMessage("Settings saved successfully!");
      toast.success("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-[var(--background-secondary)] rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-[var(--background-secondary)] rounded w-1/4"></div>
            <div className="h-10 bg-[var(--background-secondary)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage your portfolio settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Profile Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Profile Images
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Section Image (Home Page)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleHeroImageDrop}
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden hover:border-blue-500 transition-colors cursor-pointer aspect-square"
              onClick={() => document.getElementById("hero-image-input")?.click()}
            >
              {heroImagePreview ? (
                <>
                  { }
                  <img
                    src={heroImagePreview}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroImage("");
                      setHeroImagePreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Max 5MB, will be compressed
                  </p>
                </div>
              )}
              <input
                type="file"
                id="hero-image-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleHeroImageSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This image will appear in the circular frame on the home page
            </p>
          </div>

          {/* About Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Section Image
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleAboutImageDrop}
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden hover:border-blue-500 transition-colors cursor-pointer aspect-square"
              onClick={() => document.getElementById("about-image-input")?.click()}
            >
              {aboutImagePreview ? (
                <>
                  { }
                  <img
                    src={aboutImagePreview}
                    alt="About Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAboutImage("");
                      setAboutImagePreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Max 5MB, will be compressed
                  </p>
                </div>
              )}
              <input
                type="file"
                id="about-image-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAboutImageSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This image will appear in the About Me section
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Profile Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title/Role
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio (First paragraph - appears after your name)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="an Informatics undergraduate at Diponegoro University. I specialize in..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio Extended (Second paragraph - experience/background)
          </label>
          <textarea
            rows={3}
            value={bioExtended}
            onChange={(e) => setBioExtended(e.target.value)}
            placeholder="I have hands-on experience as..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio Passion (Third paragraph - passion/goals)
          </label>
          <textarea
            rows={2}
            value={bioPassion}
            onChange={(e) => setBioPassion(e.target.value)}
            placeholder="I'm passionate about creating impactful digital solutions..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hero Tagline (below your name)
            </label>
            <input
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="Full Stack Developer | UI/UX Enthusiast"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CV/Resume URL
            </label>
            <input
              type="url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Education Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Education
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              University
            </label>
            <input
              type="text"
              value={eduUniversity}
              onChange={(e) => setEduUniversity(e.target.value)}
              placeholder="Diponegoro University"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Degree/Major
            </label>
            <input
              type="text"
              value={eduDegree}
              onChange={(e) => setEduDegree(e.target.value)}
              placeholder="Informatics / Computer Science"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Period
            </label>
            <input
              type="text"
              value={eduPeriod}
              onChange={(e) => setEduPeriod(e.target.value)}
              placeholder="2023 - 2027 (Expected)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coursework (comma-separated)
            </label>
            <input
              type="text"
              value={eduCoursework}
              onChange={(e) => setEduCoursework(e.target.value)}
              placeholder="Data Structures, Software Engineering, Database Systems..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 space-y-6"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Social Links
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GitHub
            </label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter/X
            </label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram
            </label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save All Changes
        </button>
      </div>
    </div>
  );
}
