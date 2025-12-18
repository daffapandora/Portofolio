"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Mail,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Instagram,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, COLLECTIONS, SETTINGS_DOC_ID, ProfileSettings } from "@/lib/firebase";
import toast from "react-hot-toast";

// Default values
const defaults = {
  email: "daffapandoraelfarisin@gmail.com",
  location: "Semarang, Indonesia",
  github: "https://github.com/daffapandora",
  linkedin: "https://www.linkedin.com/in/daffapandora/",
  instagram: "https://www.instagram.com/elfarisin",
};

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
        console.error("Error loading contact settings:", error);
      }
    }
    loadSettings();
  }, []);

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      await addDoc(collection(db, COLLECTIONS.MESSAGES), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        read: false,
        createdAt: new Date(),
      });

      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully!");

      // Reset success state after 5 seconds
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // Get values with fallbacks
  const email = settings?.socialLinks?.email || defaults.email;
  const location = settings?.location || defaults.location;
  const github = settings?.socialLinks?.github || defaults.github;
  const linkedin = settings?.socialLinks?.linkedin || defaults.linkedin;
  const instagram = settings?.socialLinks?.instagram || defaults.instagram;

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: location,
      href: null,
    },
    {
      icon: Calendar,
      label: "Availability",
      value: "Available for opportunities",
      href: null,
    },
  ];

  const socialLinks = [
    { name: "GitHub", href: github, icon: Github },
    { name: "LinkedIn", href: linkedin, icon: Linkedin },
    { name: "Instagram", href: instagram, icon: Instagram },
  ].filter(link => link.href); // Only show links that are configured

  return (
    <footer
      id="contact"
      ref={ref}
      className="py-12 md:py-16 px-4 sm:px-6 border-t border-[var(--border)]"
    >
      <div className="w-full max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-xl md:text-2xl font-bold bbh-bartle-regular tracking-tight mb-2">
            Get In Touch
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-muted)]">
            Feel free to reach out for collaborations or opportunities.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <input
                type="email"
                required
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <textarea
              required
              placeholder="Your Message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            />
            <button
              type="submit"
              disabled={sending || sent}
              className="w-full py-3 px-6 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : sent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Contact Info Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-8"
        >
          {contactInfo.map((info) => (
            <div key={info.label} className="flex items-center gap-2 text-center">
              <info.icon className="w-4 h-4 text-[var(--text-muted)]" />
              {info.href ? (
                <a
                  href={info.href}
                  className="text-sm text-foreground hover:text-foreground/70 transition-colors"
                >
                  {info.value}
                </a>
              ) : (
                <span className="text-sm text-foreground">{info.value}</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-5 mb-8"
        >
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-foreground transition-colors"
              aria-label={link.name}
            >
              <link.icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-6 border-t border-[var(--border)] text-center"
        >
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Daffa Pandora El-Farisin. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
