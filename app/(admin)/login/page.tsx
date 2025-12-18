"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
      toast.success("Welcome back!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          setLoginError("No account found with this email");
        } else if (error.message.includes("wrong-password")) {
          setLoginError("Incorrect password");
        } else if (error.message.includes("too-many-requests")) {
          setLoginError("Too many attempts. Please try again later");
        } else {
          setLoginError("Login failed. Please check your credentials");
        }
        toast.error("Login failed");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-secondary)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-background rounded-2xl shadow-2xl border border-[var(--border)] p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-foreground rounded-xl mx-auto flex items-center justify-center mb-4"
            >
              <span className="text-2xl font-bold text-background">D</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-[var(--text-muted)] mt-2">
              Sign in to access admin panel
            </p>
          </div>

          {/* Error message */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <p className="text-sm text-red-500">{loginError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <input
                type="email"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-[var(--background-secondary)] text-foreground placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-transparent transition-all ${errors.email
                  ? "border-red-500"
                  : "border-[var(--border)]"
                  }`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-[var(--background-secondary)] text-foreground placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-transparent transition-all ${errors.password
                  ? "border-red-500"
                  : "border-[var(--border)]"
                  }`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-[var(--border)] text-foreground focus:ring-foreground/30"
                />
                <span className="text-sm text-[var(--text-muted)]">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-foreground transition-colors"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
