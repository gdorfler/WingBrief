"use client";

/** Achievement toasts. Deliberately quiet: adult military students, not slot machines. */

import { motion } from "motion/react";
import { useEffect } from "react";
import { achievementById } from "@/lib/xp";
import { useProgress } from "@/lib/progress-store";
import { AchievementIcon } from "./achievement-icon";

export function AwardToasts() {
  const { pendingAwards, clearAwards } = useProgress();

  useEffect(() => {
    if (pendingAwards.length === 0) return;
    const t = setTimeout(clearAwards, 5200);
    return () => clearTimeout(t);
  }, [pendingAwards, clearAwards]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-8">
        {pendingAwards.map((id) => {
          const def = achievementById(id);
          if (!def) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-gold/30 bg-ink-800 px-4 py-3 shadow-lg"
            >
              <AchievementIcon icon={def.icon} size={34} />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-gold">
                  Achievement unlocked
                </p>
                <p className="text-[15px] font-bold leading-tight text-white">{def.name}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-[#a8c2dd]">
                  {def.description}
                </p>
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}
