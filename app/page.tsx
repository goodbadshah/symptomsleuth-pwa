"use client";

import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import AppHeader from "@/components/layout/AppHeader";
import ReturningMemberSignIn from "@/components/auth/ReturningMemberSignIn";
import { Activity, LineChart, Users, FileText } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: Activity,
    label: "Quick daily log",
    detail: "Tap through your symptoms in seconds. Works offline.",
  },
  {
    icon: LineChart,
    label: "Your patterns over time",
    detail: "Timeline chart shows severity trends and streak data.",
  },
  {
    icon: Users,
    label: "Community intelligence",
    detail: "See how your patterns compare to thousands with the same condition.",
  },
  {
    icon: FileText,
    label: "Doctor-ready reports",
    detail: "Generate a structured clinical summary for your next appointment.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full overflow-hidden">
      <AppHeader showStreak={false} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-24 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 relative z-10">
        
        {/* ── Left Column: Hero & CTAs ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.8 }}
          className="flex-1 max-w-xl w-full flex flex-col justify-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex w-fit items-center rounded-full px-3 py-1 mb-6 text-[11px] uppercase tracking-[0.2em] font-medium bg-[--accent-light] text-[--accent]"
          >
            A Modern Medical Journal
          </motion.div>

          <h1
            className="leading-[1.1] mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.25rem, 4vw, 3.5rem)", color: "var(--text-primary)" }}
          >
            See what your symptoms<br />are saying.
          </h1>

          <p className="text-[1.05rem] leading-relaxed mb-8 max-w-md" style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>
            Built for chronic conditions: Migraines, Long COVID, POTS, MCAS, Lyme, IBS, fibromyalgia, diabetes, PCOS, and more. 
            Track daily, find correlations, and generate reports your doctor will actually read.
          </p>

          {/* Primary CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/onboarding"
              className="group flex items-center justify-between px-6 py-4 w-full md:w-fit min-w-[280px] shadow-[0_4px_14px_rgba(45,106,79,0.2)]"
              style={{
                borderRadius: "1.5rem",
                backgroundColor: "var(--accent)",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
              }}
            >
              <span className="text-[1.05rem] font-medium tracking-wide">Start free trial</span>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300"
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </motion.div>

          <div className="mt-8 pt-5 border-t w-full max-w-sm flex flex-col items-center mx-auto lg:mx-0" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-[11px] uppercase tracking-[0.15em] mb-3 font-medium text-center" style={{ color: "var(--text-secondary)" }}>Already a member?</h3>
            <div className="w-full flex justify-center">
              <ReturningMemberSignIn />
            </div>
          </div>
        </motion.div>

        {/* ── Right Column: Value Props Glass Panel ── */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 w-full max-w-lg relative"
        >
          {/* Decorative blur blob behind the glass panel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[--accent-light] rounded-full blur-[100px] opacity-20 -z-10 pointer-events-none" />

          {/* Glassmorphic Panel */}
          <div 
            className="p-6 md:p-8 rounded-[2rem] border shadow-xl relative overflow-hidden"
            style={{ 
              backgroundColor: "var(--bezel-outer-bg)",
              borderColor: "var(--bezel-ring)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)"
            }}
          >
            <ul className="flex flex-col gap-6">
              {VALUE_PROPS.map(({ icon: Icon, label, detail }, index) => (
                <motion.li
                  variants={itemVariants}
                  key={label}
                  className="flex items-start gap-4 p-3 -m-3 rounded-2xl group cursor-default"
                  whileHover={{ scale: 1.02, backgroundColor: "var(--bg-surface)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className="mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border group-hover:border-[--accent] group-hover:bg-[--accent-light] transition-colors duration-300" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", boxShadow: "var(--bezel-inset-shadow)" }}>
                     <Icon size={18} className="text-[--accent] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col gap-[2px] pt-0.5">
                    <span className="text-[1rem] font-semibold tracking-tight leading-snug group-hover:text-[--accent] transition-colors duration-300" style={{ color: "var(--text-primary)" }}>
                      {label}
                    </span>
                    <span className="text-[0.9rem] leading-relaxed font-medium" style={{ color: "var(--text-secondary)" }}>
                      {detail}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>

            <motion.div 
               variants={itemVariants}
               className="mt-6 pt-6 border-t"
               style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-4 p-4 rounded-[1.25rem] border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
                 <div className="w-8 h-8 rounded-full bg-[--accent-light] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 </div>
                 <p className="text-[13px] font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                   <strong className="mr-1" style={{ color: "var(--text-primary)" }}>Privacy guaranteed.</strong> 
                   Your health data never leaves your device. We literally cannot see it, even if we wanted to.
                 </p>
              </div>
            </motion.div>
          </div>

          {/* Mobile CTA (only visible on mobile layout below the glass panel) */}
          <motion.div variants={itemVariants} className="mt-8 flex justify-center lg:hidden w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Link
                href="/onboarding"
                className="group flex items-center justify-between px-6 py-4 w-full shadow-[0_4px_14px_rgba(45,106,79,0.2)]"
                style={{
                  borderRadius: "1.5rem",
                  backgroundColor: "var(--accent)",
                  color: "#ffffff",
                  fontFamily: "var(--font-body)",
                  textDecoration: "none",
                }}
              >
                <span className="text-[1.05rem] font-medium tracking-wide">Start free trial</span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 group-hover:bg-white/20 transition-all duration-300"
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <polyline points="4,2 8,6 4,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
