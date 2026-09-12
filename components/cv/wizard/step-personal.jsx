"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Camera,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Globe,
  Link as LinkIcon,
  FolderGit2,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

export function StepPersonal({
  personal = {},
  onChange,
  photo = { enabled: false, url: "", shape: "circle" },
  onPhotoChange,
  onPhotoRemove,
  onNext,
}) {
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState("");
  const [showAdditional, setShowAdditional] = useState(
    Boolean(
      personal.professionalTitle ||
        personal.linkedin ||
        personal.github ||
        personal.website
    )
  );

  // Split fullName into firstName & lastName for intuitive editing
  const { firstName, lastName } = useMemo(() => {
    if (personal.firstName !== undefined || personal.lastName !== undefined) {
      return {
        firstName: personal.firstName || "",
        lastName: personal.lastName || "",
      };
    }
    const parts = (personal.fullName || "").trim().split(/\s+/);
    if (parts.length <= 1) {
      return { firstName: parts[0] || "", lastName: "" };
    }
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  }, [personal.firstName, personal.lastName, personal.fullName]);

  const handleFirstNameChange = (val) => {
    const newFirst = val;
    const newLast = lastName;
    const combined = `${newFirst} ${newLast}`.trim();
    onChange("firstName", newFirst);
    onChange("lastName", newLast);
    onChange("fullName", combined);
  };

  const handleLastNameChange = (val) => {
    const newFirst = firstName;
    const newLast = val;
    const combined = `${newFirst} ${newLast}`.trim();
    onChange("firstName", newFirst);
    onChange("lastName", newLast);
    onChange("fullName", combined);
  };

  const handleLocationUpdate = (field, val) => {
    onChange(field, val);
    const updated = {
      address: field === "address" ? val : personal.address || "",
      city: field === "city" ? val : personal.city || "",
      zipCode: field === "zipCode" ? val : personal.zipCode || "",
    };
    const parts = [updated.address, updated.city, updated.zipCode].filter(Boolean);
    onChange("location", parts.join(", "));
  };

  const handleFileChange = (e) => {
    setPhotoError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (typeof dataUrl === "string" && onPhotoChange) {
        onPhotoChange({
          enabled: true,
          url: dataUrl,
          shape: photo.shape || "circle",
        });
      }
    };
    reader.onerror = () => setPhotoError("Failed to read image file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in-50 duration-300">
      {/* ─── Main Rootixa Floating Card ─── */}
      <div className="bg-white dark:bg-[#0E1524] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 md:p-10 transition-all">
        {/* Card Title & Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5 mb-7">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
              Step 1 of 3
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personal Details
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your name, contact details, and location will form the authoritative header of your resume.
          </p>
        </div>

        {/* ─── Form Fields Grid ─── */}
        <div className="space-y-5">
          {/* Photo + Name Row */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Photo Uploader */}
            <div className="w-full sm:w-36 shrink-0 flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {photo?.enabled && photo?.url ? (
                <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md shadow-indigo-500/15">
                  <img
                    src={photo.url}
                    alt={personal.fullName || "Candidate"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-xs transition-transform hover:scale-105"
                      title="Change photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {onPhotoRemove && (
                      <button
                        type="button"
                        onClick={onPhotoRemove}
                        className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shadow-xs transition-transform hover:scale-105"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-slate-800 hover:border-indigo-500 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center mb-1.5 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Camera className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Add photo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">(optional)</span>
                </button>
              )}
              {photoError && (
                <p className="text-[11px] text-rose-500 mt-1 text-center">{photoError}</p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>First name</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>Last name</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morgan"
                  value={lastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Email address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" />
                  <span>Email address</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. alex.morgan@example.com"
                  value={personal.email || ""}
                  onChange={(e) => onChange("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" />
                  <span>Phone number</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={personal.phone || ""}
                  onChange={(e) => onChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-500" />
              <span>Street Address</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 742 Evergreen Terrace"
              value={personal.address || ""}
              onChange={(e) => handleLocationUpdate("address", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Zip code & City/Town */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Postal / Zip code
              </label>
              <input
                type="text"
                placeholder="e.g. 94103"
                value={personal.zipCode || ""}
                onChange={(e) => handleLocationUpdate("zipCode", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City, State / Country
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={personal.city || ""}
                onChange={(e) => handleLocationUpdate("city", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* ─── Expandable Additional Information ─── */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdditional(!showAdditional)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>+ Additional Professional Links &amp; Title</span>
              {showAdditional ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showAdditional && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Professional Title / Target Role</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Software Engineer"
                    value={personal.professionalTitle || ""}
                    onChange={(e) => onChange("professionalTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-indigo-500" />
                      <span>LinkedIn URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="linkedin.com/in/username"
                      value={personal.linkedin || ""}
                      onChange={(e) => onChange("linkedin", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      <span>GitHub URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="github.com/username"
                      value={personal.github || ""}
                      onChange={(e) => onChange("github", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-teal-500" />
                      <span>Portfolio / Website</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.dev"
                      value={personal.website || ""}
                      onChange={(e) => onChange("website", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Bottom Navigation: Rootixa Gradient CTA ─── */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <button
            type="button"
            onClick={onNext}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 active:scale-98 transition-all cursor-pointer w-full sm:w-auto min-w-[220px]"
          >
            <span>Continue to Experiences</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 mt-2.5 text-center">
            Next: Add your work history, degrees, and core competencies.
          </p>
        </div>
      </div>
    </div>
  );
}
