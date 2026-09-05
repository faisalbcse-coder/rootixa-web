"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  LayoutGrid, ArrowLeft, Star, Sun, Moon,
  Lightbulb, AlertTriangle, MessageSquare, Send,
  CheckCircle2, Mail, User, RefreshCw, ChevronDown,
  Image, FileText, X, Paperclip
} from "lucide-react";

const CATEGORIES = [
  { id: "suggestion", label: "Tool Suggestion", icon: Lightbulb },
  { id: "bug", label: "Report a Bug", icon: AlertTriangle },
  { id: "review", label: "Review & Rating", icon: Star },
  { id: "inquiry", label: "General Message", icon: MessageSquare },
];

const ROOTIXA_TOOLS = [
  "General / Entire Website",
  "QR & BAR Code Generator",
  "Pro CV Builder",
  "Image Resizer & Crop",
  "AI Background Remover",
  "Image & PDF Converter",
  "Invoice Generator",
  "New Tool Request",
];

export default function FeedbackPage() {
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  // Form fields
  const [category, setCategory] = useState("suggestion");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [toolName, setToolName] = useState("General / Entire Website");
  const [message, setMessage] = useState("");
  const [wantsReply, setWantsReply] = useState(true);

  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Sync theme
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("rootixa_theme");
      const isDark = savedTheme === "dark" || document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("rootixa_theme", next ? "dark" : "light");
    } catch {
      // ignore
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileUploadError("File size exceeds 10MB limit.");
      return;
    }

    setFileUploadError("");
    setIsUploadingFile(true);

    let previewUrl = null;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/feedback/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "File upload failed");
      }

      setAttachment({
        url: data.url,
        name: data.name,
        size: data.size,
        type: data.type,
        previewUrl: previewUrl || data.url,
      });
    } catch (err) {
      setFileUploadError(err.message || "Failed to upload file. Please try again.");
      setAttachment(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setFileUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      setErrorMessage("Please enter a valid email address so our team can reply to you.");
      return;
    }

    if (!message || message.trim().length < 3) {
      setErrorMessage("Please write your message or suggestion.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          toolName,
          title: message.trim().slice(0, 50),
          message: message.trim(),
          userName: userName.trim() || "Community Member",
          userEmail: userEmail.trim(),
          wantsReply,
          attachment: attachment ? {
            url: attachment.url,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
          } : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setSuccessInfo({
        referenceId: data.referenceId,
        email: userEmail.trim(),
        name: userName.trim() || "Friend",
        hasAttachment: Boolean(attachment),
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessInfo(null);
    setMessage("");
    setAttachment(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${darkMode ? "dark bg-[#090E17] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      {/* Header */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            <Link
              href="/"
              className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 sm:py-14">
        {successInfo ? (
          /* Clean Success Card */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-indigo-500/5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full mb-3">
              Ticket #{successInfo.referenceId}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Thank you, {successInfo.name}!
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
              Your feedback {successInfo.hasAttachment && "and attachment "}have been delivered to the Rootixa admin team. We will review your submission and reply directly to <strong className="text-indigo-600 dark:text-indigo-400">{successInfo.email}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Send Another Feedback
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Simple, Beautiful Feedback Form */
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Feedback & Suggestions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Help Us Improve Rootixa
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Have a tool idea, spotted an issue, or want to share feedback? You can also attach screenshots or documents.
              </p>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30 space-y-6">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating || rating) >= star
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200 dark:text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                    {rating} of 5 stars
                  </span>
                </div>
              </div>

              {/* Tool Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Related Tool (Optional)
                </label>
                <div className="relative">
                  <select
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                  >
                    {ROOTIXA_TOOLS.map((tool) => (
                      <option key={tool} value={tool} className="bg-white dark:bg-slate-900">
                        {tool}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Your Message or Suggestion <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    category === "suggestion"
                      ? "Describe the tool or feature you need..."
                      : category === "bug"
                      ? "Tell us what happened and what went wrong..."
                      : "Share your thoughts or experience with Rootixa..."
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
                />
              </div>

              {/* Picture or File Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Attach Picture or File (Optional)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />

                {!attachment && !isUploadingFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 group"
                  >
                    <Image className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>Upload screenshot or document (PNG, JPG, PDF up to 10MB)</span>
                  </button>
                ) : isUploadingFile ? (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center gap-2 text-xs text-indigo-600 font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading attachment...</span>
                  </div>
                ) : (
                  <div className="border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {attachment.type?.startsWith("image/") ? (
                        <img
                          src={attachment.previewUrl || attachment.url}
                          alt="Attachment preview"
                          className="w-12 h-12 object-cover rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(attachment.size / 1024).toFixed(1)} KB &bull; Attached ✓
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      aria-label="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {fileUploadError && (
                  <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {fileUploadError}
                  </p>
                )}
              </div>

              {/* User Email & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Your Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Admin will send replies & updates to this email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Faisal Ahmed"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Wants Reply Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={wantsReply}
                  onChange={(e) => setWantsReply(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Email me when the Rootixa admin team reviews or updates this request.</span>
              </label>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>&copy; {new Date().getFullYear()} Rootixa. All feedback directly shapes our roadmap.</p>
      </footer>
    </div>
  );
}
