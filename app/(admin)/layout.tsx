"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
  Home,
  ExternalLink,
  Briefcase,
  Code2,
  Award,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/experiences", label: "Experiences", icon: Briefcase },
  { href: "/dashboard/skills", label: "Skills", icon: Code2 },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Hydration-safe mounting detection
const emptySubscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  // Don't show layout for login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Generate breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-[var(--border)] shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            Admin Panel
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--text-muted)] hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {/* Back to Website Link */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-muted)] hover:bg-[var(--background-secondary)] transition-colors mb-4 border border-dashed border-[var(--border)]"
          >
            <Home size={20} />
            <span>Back to Website</span>
            <ExternalLink size={14} className="ml-auto" />
          </Link>

          <div className="border-b border-[var(--border)] mb-4"></div>

          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-foreground/10 text-foreground font-medium"
                  : "text-[var(--text-muted)] hover:bg-[var(--background-secondary)] hover:text-foreground"
                  }`}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[var(--text-muted)] hover:text-foreground"
              >
                <Menu size={24} />
              </button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
                    {crumb.isLast ? (
                      <span className="text-gray-900 dark:text-white font-medium">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 text-[var(--text-muted)] hover:text-foreground rounded-lg hover:bg-[var(--background-secondary)]"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm text-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
