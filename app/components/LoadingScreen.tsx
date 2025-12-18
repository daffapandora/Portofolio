"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsComplete(true), 500);
                    return 100;
                }
                // Realistic loading curve - fast at start, slower at end
                const increment = prev < 50 ? Math.random() * 15 : Math.random() * 5;
                return Math.min(prev + increment, 100);
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    if (isComplete) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
            >
                <div className="flex flex-col items-center gap-8">
                    {/* Animated Logo/Text */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Main Text */}
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold bbh-bartle-regular tracking-tight text-foreground"
                            animate={{
                                opacity: [1, 0.7, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            Daffa Pandora
                        </motion.h1>

                        {/* Decorative animated dots */}
                        <div className="absolute -right-8 top-0 flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-foreground"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Progress Bar Container */}
                    <div className="w-64 md:w-80">
                        {/* Progress Bar Background */}
                        <div className="relative h-1 bg-[var(--border)] rounded-full overflow-hidden">
                            {/* Progress Bar Fill */}
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-foreground rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />

                            {/* Shimmer Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
                                animate={{
                                    x: ["-100%", "200%"],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        </div>

                        {/* Progress Percentage */}
                        <motion.p
                            className="text-center mt-4 text-sm text-[var(--text-muted)] font-mono"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {Math.round(progress)}%
                        </motion.p>
                    </div>

                    {/* Loading Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-sm text-[var(--text-muted)]">Loading</span>
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="text-sm text-[var(--text-muted)]"
                                animate={{
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut",
                                }}
                            >
                                .
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
