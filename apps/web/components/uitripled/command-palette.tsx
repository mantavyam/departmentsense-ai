"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { File, Search, Settings, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type Command = {
  id?: string;
  icon: typeof File;
  label: string;
  shortcut?: string;
  description?: string;
};

const defaultCommands: Command[] = [
  {
    icon: File,
    label: "New File",
    shortcut: "⌘N",
    description: "Spin up a glassmorphic canvas",
  },
  {
    icon: Settings,
    label: "Workspace Settings",
    shortcut: "⌘,",
    description: "Fine-tune tokens, motion, and themes",
  },
  {
    icon: User,
    label: "Team Directory",
    shortcut: "⌘P",
    description: "Invite collaborators to your motion library",
  },
  {
    icon: Search,
    label: "Global Command",
    shortcut: "⌘K",
    description: "Jump anywhere with palette search",
  },
];

const overlayTransition: Transition = { duration: 0.24, ease: "easeOut" };

export interface CommandPaletteProps {
  /** Commands shown inside the palette. Falls back to a demo list. */
  commands?: Command[];
  /** Callback when a command is selected. Receives the chosen Command. */
  onSelect?: (cmd: Command) => void;
  /** Trigger button label. Default: "Search commands…" */
  triggerLabel?: string;
  /** Placeholder shown inside the palette search input. */
  placeholder?: string;
  /** Bind global ⌘K shortcut to open the palette. Default: true */
  bindShortcut?: boolean;
}

export function CommandPalette({
  commands,
  onSelect,
  triggerLabel = "Search commands…",
  placeholder = "Search…",
  bindShortcut = true,
}: CommandPaletteProps = {}) {
  const items = commands ?? defaultCommands;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!bindShortcut) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bindShortcut]);

  const filteredCommands = useMemo(
    () =>
      items.filter((cmd) =>
        (cmd.label + " " + (cmd.description ?? "")).toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  );

  const handleSelect = (cmd: Command) => {
    onSelect?.(cmd);
    setIsOpen(false);
    setQuery("");
  };

  const panelVariants: Variants = shouldReduceMotion
    ? {
        initial: { opacity: 0, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 0, scale: 1 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 20, filter: "blur(6px)" },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.28, ease: [0.18, 0.89, 0.32, 1.12] },
        },
        exit: {
          opacity: 0,
          scale: 0.97,
          y: 12,
          filter: "blur(8px)",
          transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
        },
      };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-4 py-2.5 text-sm text-[var(--muted-foreground)] shadow-[0_12px_30px_-15px_rgba(15,23,42,0.6)] backdrop-blur-lg transition-shadow duration-300 hover:shadow-[0_18px_45px_-20px_rgba(15,23,42,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      >
        <Search className="h-4 w-4 text-primary" aria-hidden />
        <span className="font-medium">{triggerLabel}</span>
        <kbd className="ml-auto rounded-full border border-border/60 bg-white/5 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
          ⌘K
        </kbd>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              aria-hidden
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={() => setIsOpen(false)}
            />

            <div className="fixed inset-0 z-[65] flex items-start justify-center px-4 pt-24 sm:px-6">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                {...panelVariants}
                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card/90 backdrop-blur-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                >
                  <motion.div
                    className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[150px]"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: [0.25, 0.55, 0.25],
                            scale: [0.92, 1.08, 0.98],
                          }
                    }
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }
                  />
                  <motion.div
                    className="absolute bottom-[-30%] right-[-5%] h-72 w-72 rounded-full bg-emerald-400/20 blur-[160px]"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : { opacity: [0.2, 0.5, 0.2], rotate: [0, 12, 0] }
                    }
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : { duration: 10, repeat: Infinity, ease: "linear" }
                    }
                  />
                </div>

                <div className="relative flex items-center gap-3 border-b border-border/60 px-5 py-4">
                  <Search className="h-5 w-5 text-primary" aria-hidden />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-[var(--muted-foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                    autoFocus
                  />
                  <motion.button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white/5 text-[var(--muted-foreground)] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : { rotate: 90, scale: 1.05 }
                    }
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Close command palette</span>
                  </motion.button>
                </div>

                <motion.div
                  className="relative max-h-96 overflow-y-auto px-3 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredCommands.length === 0 ? (
                    <div className="rounded-2xl border border-border/60 bg-white/5 p-6 text-center text-sm text-[var(--muted-foreground)] backdrop-blur">
                      No commands found. Try a different search term.
                    </div>
                  ) : (
                    <ul className="space-y-2" role="list">
                      {filteredCommands.map((cmd, index) => {
                        const Icon = cmd.icon;
                        return (
                          <motion.li
                            key={cmd.label}
                            initial={{
                              opacity: shouldReduceMotion ? 1 : 0,
                              y: shouldReduceMotion ? 0 : 12,
                            }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : {
                                    delay: 0.04 * index,
                                    duration: 0.24,
                                    ease: "easeOut",
                                  }
                            }
                          >
                            <button
                              type="button"
                              onClick={() => handleSelect(cmd)}
                              className="group flex w-full items-center justify-between rounded-2xl border border-transparent bg-white/5 px-4 py-4 text-left transition-colors duration-200 hover:border-border hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-white/5 text-primary shadow-sm backdrop-blur">
                                  <Icon className="h-4 w-4" aria-hidden />
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-[var(--muted-foreground)]">
                                    {cmd.label}
                                  </span>
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    {cmd.description}
                                  </span>
                                </div>
                              </div>
                              {cmd.shortcut && (
                                <kbd className="rounded-full border border-border/40 bg-white/5 px-2 py-1 text-xs text-[var(--muted-foreground)] shadow-sm">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                            </button>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}