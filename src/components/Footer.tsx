import React, { useState } from "react";
import { X, Copy, Check, Send, ExternalLink, Shield, FileText, Building2, MessageSquare } from "lucide-react";

interface FooterProps {
  onTabChange?: (tab: "practice" | "review" | "progress") => void;
  onOpenSettings?: () => void;
}

type ActiveModal = "contact" | "impressum" | "terms" | "privacy" | null;

export const Footer: React.FC<FooterProps> = () => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("contact@verba.app");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackName("");
      setFeedbackMessage("");
      setActiveModal(null);
    }, 2500);
  };

  return (
    <>
      <footer className="w-full bg-black border-t border-neutral-900 py-10 sm:py-14 px-4 sm:px-8 mt-auto text-neutral-400 font-mono-code">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-5 sm:gap-6">
          
          {/* Primary Terminal Links Row */}
          <nav
            className="flex flex-wrap items-center justify-center gap-y-2.5 gap-x-4 sm:gap-x-7 md:gap-x-8 text-xs sm:text-sm font-bold tracking-[0.14em] sm:tracking-[0.18em] uppercase"
            aria-label="Footer Terminal Navigation"
          >
            {/* // CONTACT */}
            <button
              id="footer-contact-btn"
              onClick={() => setActiveModal("contact")}
              className="py-1 px-1.5 text-white hover:text-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:underline"
            >
              <span>// CONTACT</span>
            </button>

            {/* INSTAGRAM */}
            <a
              id="footer-instagram-link"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus:underline"
              title="Visit Verba on Instagram"
            >
              INSTAGRAM
            </a>

            {/* TIKTOK */}
            <a
              id="footer-tiktok-link"
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus:underline"
              title="Visit Verba on TikTok"
            >
              TIKTOK
            </a>

            {/* IMPRESSUM */}
            <button
              id="footer-impressum-btn"
              onClick={() => setActiveModal("impressum")}
              className="py-1 px-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus:underline"
            >
              IMPRESSUM
            </button>

            {/* TERMS */}
            <button
              id="footer-terms-btn"
              onClick={() => setActiveModal("terms")}
              className="py-1 px-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus:underline"
            >
              TERMS
            </button>

            {/* PRIVACY */}
            <button
              id="footer-privacy-btn"
              onClick={() => setActiveModal("privacy")}
              className="py-1 px-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus:underline"
            >
              PRIVACY
            </button>
          </nav>

          {/* Slogan and Copyright Row */}
          <div className="pt-1 text-[10px] sm:text-xs tracking-[0.10em] sm:tracking-[0.16em] uppercase text-neutral-500 select-none max-w-xl leading-relaxed">
            © 2026 VERBA · EDUCATION SHOULDN&apos;T BE EXPENSIVE
          </div>
        </div>
      </footer>

      {/* Interactive Modals for Footer Elements */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-[#121212] border-2 border-black dark:border-white text-black dark:text-white rounded-2xl max-w-lg w-full p-5 sm:p-8 shadow-2xl max-h-[88vh] overflow-y-auto font-mono-code text-xs transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-5">
              <div className="flex items-center gap-2">
                {activeModal === "contact" && (
                  <span className="text-black dark:text-white font-bold text-sm sm:text-base tracking-wider">
                    // CONTACT
                  </span>
                )}
                {activeModal === "impressum" && (
                  <div className="flex items-center gap-2 text-black dark:text-white font-bold text-sm sm:text-base tracking-wider">
                    <Building2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>IMPRESSUM</span>
                  </div>
                )}
                {activeModal === "terms" && (
                  <div className="flex items-center gap-2 text-black dark:text-white font-bold text-sm sm:text-base tracking-wider">
                    <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>TERMS OF SERVICE</span>
                  </div>
                )}
                {activeModal === "privacy" && (
                  <div className="flex items-center gap-2 text-black dark:text-white font-bold text-sm sm:text-base tracking-wider">
                    <Shield className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    <span>PRIVACY POLICY</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* CONTACT MODAL CONTENT */}
            {activeModal === "contact" && (
              <div className="space-y-5">
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans text-sm">
                  We built Verba because language practice should be accessible, distraction-free, and high-tempo.
                  Get in touch directly for feedback, word suggestions, or support.
                </p>

                {/* Email Direct Box */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">
                      Direct Inquiries
                    </div>
                    <div className="font-bold text-sm text-black dark:text-white">contact@verba.app</div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Transmission Form */}
                <form onSubmit={handleSendFeedback} className="space-y-3 pt-2">
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Quick Transmission</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Your name or handle (optional)"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />

                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your suggestion, issue, or request..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white resize-none transition-colors"
                  />

                  {feedbackSent ? (
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-black dark:border-white rounded-xl text-black dark:text-white text-center font-bold text-xs flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Transmission received. Thank you!</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-85 font-arial-black uppercase tracking-wider rounded-xl transition-opacity cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </button>
                  )}
                </form>

                {/* Social Quick-Links */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Community channels:</span>
                  <div className="flex gap-4 font-bold text-black dark:text-white">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>IG</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>TT</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* IMPRESSUM CONTENT */}
            {activeModal === "impressum" && (
              <div className="space-y-4 text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed text-xs">
                <div className="font-mono-code text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">
                  Angaben gemäß § 5 TMG
                </div>
                <div>
                  <p className="font-bold text-black dark:text-white text-sm">Verba Language Systems</p>
                  <p className="text-neutral-500 dark:text-neutral-400 font-mono-code mt-0.5">Project: Verba</p>
                  <p className="text-neutral-500 dark:text-neutral-400 font-mono-code">Berlin &amp; Global Remote Lab</p>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="font-bold text-black dark:text-white mb-1 font-mono-code text-xs">CONTACT</p>
                  <p className="text-neutral-500 dark:text-neutral-400 font-mono-code">E-Mail: contact@verba.app</p>
                  <p className="text-neutral-500 dark:text-neutral-400 font-mono-code">Web: https://verba.app</p>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="font-bold text-black dark:text-white mb-1 font-mono-code text-xs">MISSION</p>
                  <p className="text-neutral-700 dark:text-neutral-300 italic">
                    &quot;Education shouldn&apos;t be expensive.&quot; — We provide open, distraction-free sentence practice using cognitive spaced repetition.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <p className="font-bold text-black dark:text-white font-mono-code mb-1">DISCLAIMER</p>
                  <p>
                    All linguistic content, translations, and CEFR sentence alignments are curated for educational and non-commercial language acquisition purposes.
                  </p>
                </div>
              </div>
            )}

            {/* TERMS CONTENT */}
            {activeModal === "terms" && (
              <div className="space-y-4 text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed text-xs">
                <div className="font-mono-code text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">
                  CORE PRINCIPLES
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      1. EDUCATION SHOULDN&apos;T BE EXPENSIVE
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Verba is built to ensure high-velocity spaced repetition language learning is universally accessible.
                      Core sentence practice, memory retention tracking, and audio pronunciation remain completely accessible.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      2. PERSONAL STUDY &amp; DATA OWNERSHIP
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Your flashcard progress, spaced repetition intervals, and streak data are stored locally in your browser.
                      You are free to export and import your full JSON archive at any time.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      3. FAIR USE &amp; INTEGRITY
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Verba is provided as-is to foster natural German and English language fluency.
                      Do not attempt automated scraping or disruption of shared services.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY CONTENT */}
            {activeModal === "privacy" && (
              <div className="space-y-4 text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed text-xs">
                <div className="font-mono-code text-[11px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">
                  PRIVACY BY DESIGN
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      ZERO TRACKERS OR ADVERTISING
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Verba does not use advertising cookies, behavior profiling trackers, or third-party marketing beacons.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      LOCAL BROWSER PERSISTENCE
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Your practice ratings, daily streak, and custom audio speed preferences reside entirely in your browser&apos;s LocalStorage.
                      No personal information is sold or syndicated.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <p className="font-bold text-black dark:text-white font-mono-code text-xs mb-1">
                      ON-DEVICE SPEECH SYNTHESIS
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      Audio pronunciation utilizes your operating system and browser&apos;s native Web Speech API directly on-device.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Dismiss */}
            <div className="pt-4 mt-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-85 font-bold font-mono-code rounded-xl transition-opacity cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
