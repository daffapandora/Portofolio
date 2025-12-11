"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from bottom
interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, className = "" }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left
interface SlideLeftProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SlideLeft({ children, delay = 0, className = "" }: SlideLeftProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide in from right
interface SlideRightProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SlideRight({ children, delay = 0, className = "" }: SlideRightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale up animation
interface ScaleUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleUp({ children, delay = 0, className = "" }: ScaleUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function StaggerContainer({ children, staggerDelay = 0.1, className = "" }: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// Scroll-triggered animation wrapper
interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleUp";
  threshold?: number;
}

export function ScrollAnimation({
  children,
  className = "",
  animation = "fadeIn",
  threshold = 0.1,
}: ScrollAnimationProps) {
  const animations = {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slideUp: { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } },
    slideLeft: { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } },
    slideRight: { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } },
    scaleUp: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  };

  return (
    <motion.div
      initial={animations[animation].initial}
      whileInView={animations[animation].animate}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover animations
interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverLift({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverScale({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverGlow({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
        transition: { duration: 0.3 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Button press animation
interface PressButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function PressButton({ children, className = "", onClick }: PressButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Image zoom on hover
interface ImageZoomProps {
  children: ReactNode;
  className?: string;
}

export function ImageZoom({ children, className = "" }: ImageZoomProps) {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation
interface PulseProps {
  children: ReactNode;
  className?: string;
}

export function Pulse({ children, className = "" }: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Bounce animation
interface BounceProps {
  children: ReactNode;
  className?: string;
}

export function Bounce({ children, className = "" }: BounceProps) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Typing animation
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className = "", speed = 0.05 }: TypewriterProps) {
  return (
    <motion.span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * speed }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Counter animation
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
}

export function Counter({ from = 0, to, duration = 2, className = "" }: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {to}
    </motion.span>
  );
}
