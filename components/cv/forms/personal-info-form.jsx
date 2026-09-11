"use client";

import { useState, useRef } from "react";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  FolderGit2,
  Camera,
  Trash2,
  UploadCloud,
  Check,
  Circle,
  Square,
} from "lucide-react";

export function PersonalInfoForm({
  personal = {},
  onChange,
  photo = { enabled: false, url: "", shape: "circle" },
  onPhotoChange,
  onPhotoRemove,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  // Process image file to base64 Data URL
  const handleProcessFile = (file) => {
    setPhotoError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === "string" && onPhotoChange) {
        onPhotoChange({
          enabled: true,
          url: dataUrl,
          shape: photo.shape || "circle",
        });
      }
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const shapes = [
    { id: "circle", label: "Circle", radius: "rounded-full" },
    { id: "rounded", label: "Rounded", radius: "rounded-2xl" },
    { id: "square", label: "Square", radius: "rounded-md" },
  ];

  const currentShape = photo.shape || "circle";
  const currentRadius =
    currentShape === "circle"
      ? "rounded-full"
      : currentShape === "rounded"
      ? "rounded-2xl"
      : "rounded-md";

  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════════════════════
          PROMINENT PROFILE PHOTO UPLOAD WIDGET
      ══════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Profile Photo
            </h4>
          </div>
          {photo.url && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={photo.enabled}
                onChange={(e) =>
                  onPhotoChange && onPhotoChange({ enabled: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>Show in CV</span>
            </label>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileInput}
          className="hidden"
        />

        {photo.url ? (
          /* Photo Uploaded State */
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div
              className={`relative w-20 h-20 shrink-0 overflow-hidden border-2 border-indigo-500 shadow-md ${currentRadius} group`}
            >
              <img
                src={photo.url}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Photo Controls */}
            <div className="flex-1 space-y-2.5">
              {/* Shape Switcher */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Photo Shape
                </label>
                <div className="flex items-center gap-1.5">
                  {shapes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        onPhotoChange && onPhotoChange({ shape: s.id })
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                        currentShape === s.id
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={onPhotoRemove}
                  className="px-3 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              dragOver
                ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800/40"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to upload or drag &amp; drop photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG or WebP (max 5MB)
              </p>
            </div>
          </div>
        )}

        {photoError && (
          <p className="text-xs text-rose-500 font-medium mt-2">{photoError}</p>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          PERSONAL CONTACT DETAILS
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="cv-fullName"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-fullName"
              type="text"
              value={personal.fullName || ""}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Professional Title */}
        <div>
          <label
            htmlFor="cv-professionalTitle"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Professional Title
          </label>
          <div className="relative">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-professionalTitle"
              type="text"
              value={personal.professionalTitle || ""}
              onChange={(e) => handleChange("professionalTitle", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="e.g. Senior Software Engineer"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="cv-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-email"
              type="email"
              value={personal.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="alex@example.com"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="cv-phone"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-phone"
              type="tel"
              value={personal.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="+1 (555) 019-2834"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="cv-location"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Location
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-location"
              type="text"
              value={personal.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="San Francisco, CA"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="cv-website"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Website / Portfolio
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-website"
              type="url"
              value={personal.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="https://alexmorgan.dev"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="cv-linkedin"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            LinkedIn URL
          </label>
          <div className="relative">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-linkedin"
              type="url"
              value={personal.linkedin || ""}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="https://linkedin.com/in/alexmorgan"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label
            htmlFor="cv-github"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            GitHub / Repository
          </label>
          <div className="relative">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cv-github"
              type="url"
              value={personal.github || ""}
              onChange={(e) => handleChange("github", e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="https://github.com/alexmorgan"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
