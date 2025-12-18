"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Code2,
  Briefcase,
  Plus,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db, COLLECTIONS, Project, Skill, Experience } from "@/lib/firebase";
import toast from "react-hot-toast";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function StatCard({ title, value, icon, href, color }: StatCardProps) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6 cursor-pointer hover:border-foreground/20 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSkills: 0,
    totalExperiences: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentExperiences, setRecentExperiences] = useState<Experience[]>([]);
  const [skillsByCategory, setSkillsByCategory] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, COLLECTIONS.PROJECTS));
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];

        // Fetch skills
        const skillsSnapshot = await getDocs(collection(db, COLLECTIONS.SKILLS));
        const skillsData = skillsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Skill[];

        // Fetch experiences
        const experiencesSnapshot = await getDocs(collection(db, COLLECTIONS.EXPERIENCES));
        const experiencesData = experiencesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Experience[];

        // Calculate skills by category
        const categoryMap = new Map<string, number>();
        skillsData.forEach((skill) => {
          const count = categoryMap.get(skill.category) || 0;
          categoryMap.set(skill.category, count + 1);
        });
        const categoryStats = Array.from(categoryMap.entries()).map(([category, count]) => ({
          category,
          count,
        }));

        // Set stats
        setStats({
          totalProjects: projectsData.length,
          totalSkills: skillsData.length,
          totalExperiences: experiencesData.length,
        });

        // Sort and get recent projects
        const sortedProjects = projectsData
          .sort((a, b) => {
            // Handle both Firestore Timestamp and Date types
            const getDate = (date: unknown): Date => {
              if (!date) return new Date(0);
              if (date instanceof Date) return date;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (typeof (date as any).toDate === 'function') return (date as any).toDate();
              return new Date(0);
            };
            const dateA = getDate(a.createdAt);
            const dateB = getDate(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        setRecentProjects(sortedProjects);

        // Get experiences
        setRecentExperiences(experiencesData.slice(0, 3));
        setSkillsByCategory(categoryStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-[var(--background-secondary)] rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--background-secondary)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">
          Welcome back! Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderKanban className="h-6 w-6 text-blue-600" />}
          href="/dashboard/projects"
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Skills Listed"
          value={stats.totalSkills}
          icon={<Code2 className="h-6 w-6 text-green-600" />}
          href="/dashboard/skills"
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Experiences"
          value={stats.totalExperiences}
          icon={<Briefcase className="h-6 w-6 text-purple-600" />}
          href="/dashboard/experiences"
          color="bg-purple-100 dark:bg-purple-900/30"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-background border border-[var(--border)] rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
            <Link
              href="/dashboard/projects"
              className="text-sm text-[var(--text-muted)] hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{project.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">{project.category}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${project.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderKanban className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-muted)]">No projects yet</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 mt-4 text-sm text-foreground hover:underline"
              >
                <Plus className="h-4 w-4" /> Add your first project
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions & Skills Overview */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/projects/new"
                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <Plus className="h-5 w-5 text-foreground" />
                <span className="text-foreground text-sm">New Project</span>
              </Link>
              <Link
                href="/dashboard/skills"
                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <Code2 className="h-5 w-5 text-foreground" />
                <span className="text-foreground text-sm">Manage Skills</span>
              </Link>
              <Link
                href="/dashboard/experiences"
                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <Briefcase className="h-5 w-5 text-foreground" />
                <span className="text-foreground text-sm">Add Experience</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <Settings className="h-5 w-5 text-foreground" />
                <span className="text-foreground text-sm">Settings</span>
              </Link>
            </div>
          </motion.div>

          {/* Skills by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Skills by Category</h3>
            {skillsByCategory.length > 0 ? (
              <div className="space-y-3">
                {skillsByCategory.map(({ category, count }) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">{category}</span>
                    <span className="text-sm font-medium text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No skills added yet</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Experiences Section */}
      {recentExperiences.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background border border-[var(--border)] rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Experiences</h3>
            <Link
              href="/dashboard/experiences"
              className="text-sm text-[var(--text-muted)] hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-[var(--background-secondary)] rounded-lg"
              >
                <p className="font-medium text-foreground">{exp.position}</p>
                <p className="text-sm text-[var(--text-muted)]">{exp.company}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {exp.startDate} - {exp.endDate}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
