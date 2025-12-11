"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Eye,
  MessageSquare,
  Code2,
  Plus,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db, COLLECTIONS } from "@/lib/firebase";

// Mock data for charts
const visitorData = [
  { day: "Mon", views: 120 },
  { day: "Tue", views: 150 },
  { day: "Wed", views: 180 },
  { day: "Thu", views: 140 },
  { day: "Fri", views: 220 },
  { day: "Sat", views: 280 },
  { day: "Sun", views: 190 },
];

const projectViewsData = [
  { name: "Portfolio", views: 450 },
  { name: "E-Commerce", views: 320 },
  { name: "IoT Project", views: 280 },
  { name: "ML App", views: 190 },
];

const techStackData = [
  { name: "React", value: 35 },
  { name: "Next.js", value: 25 },
  { name: "Python", value: 20 },
  { name: "TypeScript", value: 15 },
  { name: "Others", value: 5 },
];

const COLORS = ["#6c757d", "#495057", "#EC4899", "#10B981", "#F59E0B"];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">+{trend}%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                vs last week
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>{icon}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pageViews: 0,
    unreadMessages: 0,
    totalSkills: 0,
  });
  const [recentProjects, setRecentProjects] = useState<unknown[]>([]);
  const [recentMessages, setRecentMessages] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects count
        const projectsSnapshot = await getDocs(collection(db, COLLECTIONS.PROJECTS));
        const projectsCount = projectsSnapshot.size;

        // Fetch unread messages count
        const messagesQuery = query(
          collection(db, COLLECTIONS.MESSAGES),
          where("read", "==", false)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const unreadCount = messagesSnapshot.size;

        // Fetch skills count
        const skillsSnapshot = await getDocs(collection(db, COLLECTIONS.SKILLS));
        const skillsCount = skillsSnapshot.size;

        // Fetch recent projects
        const recentProjectsQuery = query(
          collection(db, COLLECTIONS.PROJECTS),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentProjectsSnapshot = await getDocs(recentProjectsQuery);
        const recentProjectsData = recentProjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch recent messages
        const recentMessagesQuery = query(
          collection(db, COLLECTIONS.MESSAGES),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentMessagesSnapshot = await getDocs(recentMessagesQuery);
        const recentMessagesData = recentMessagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStats({
          totalProjects: projectsCount,
          pageViews: 1234, // Mock data - would come from analytics
          unreadMessages: unreadCount,
          totalSkills: skillsCount,
        });
        setRecentProjects(recentProjectsData);
        setRecentMessages(recentMessagesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FolderKanban className="h-6 w-6 text-blue-600" />}
          trend={12}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Page Views"
          value={stats.pageViews.toLocaleString()}
          icon={<Eye className="h-6 w-6 text-purple-600" />}
          trend={8}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={<MessageSquare className="h-6 w-6 text-pink-600" />}
          color="bg-pink-100 dark:bg-pink-900/30"
        />
        <StatCard
          title="Skills Listed"
          value={stats.totalSkills}
          icon={<Code2 className="h-6 w-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Visitor Trends (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#6c757d"
                strokeWidth={3}
                dot={{ fill: "#6c757d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Views
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={projectViewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="views" fill="#495057" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tech Stack & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tech Stack Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tech Stack Usage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={techStackData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {techStackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {techStackData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/projects/add"
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <Plus className="h-5 w-5 text-blue-600" />
              <span className="text-gray-900 dark:text-white font-medium">
                Add New Project
              </span>
              <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
            </Link>
            <Link
              href="/dashboard/messages"
              className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors group"
            >
              <MessageSquare className="h-5 w-5 text-pink-600" />
              <span className="text-gray-900 dark:text-white font-medium">
                View Messages
              </span>
              {stats.unreadMessages > 0 && (
                <span className="ml-auto bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                  {stats.unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Code2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium">
                Manage Skills
              </span>
              <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentProjects.length > 0 ? (
              recentProjects.slice(0, 3).map((project: unknown, index: number) => {
                const p = project as { id: string; title?: string };
                return (
                  <div
                    key={p.id || index}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Added project: {p.title || "Untitled"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent activity
              </p>
            )}
            {recentMessages.length > 0 && (
              <>
                {recentMessages.slice(0, 2).map((message: unknown, index: number) => {
                  const m = message as { id: string; name?: string };
                  return (
                    <div
                      key={m.id || index}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        New message from {m.name || "Anonymous"}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
