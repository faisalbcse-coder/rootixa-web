"use client";

import React, { useState } from "react";
import {
  MessageSquare, Star, Mail, CheckCircle2, Clock,
  Send, ExternalLink, RefreshCw, AlertCircle, Search,
  Filter, ChevronRight, User, Sparkles, Paperclip,
  Download, FileText
} from "lucide-react";

export function FeedbackClientView({ initialFeedbacks = [] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [selectedFeedback, setSelectedFeedback] = useState(initialFeedbacks[0] || null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Reply form state
  const [replyMessage, setReplyMessage] = useState(initialFeedbacks[0]?.admin_reply || "");
  const [replyStatus, setReplyStatus] = useState("replied");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState("");

  const fetchLatestFeedbacks = async () => {
    try {
      const res = await fetch("/api/ceo/feedback");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
          if (data.feedbacks.length > 0) {
            setSelectedFeedback((prev) => {
              if (!prev) return data.feedbacks[0];
              const match = data.feedbacks.find((f) => f.id === prev.id);
              return match || data.feedbacks[0];
            });
          } else {
            setSelectedFeedback(null);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  React.useEffect(() => {
    setFeedbacks(initialFeedbacks);
    if (initialFeedbacks.length > 0) {
      setSelectedFeedback(initialFeedbacks[0]);
      setReplyMessage(initialFeedbacks[0]?.admin_reply || "");
    } else {
      setSelectedFeedback(null);
    }
    fetchLatestFeedbacks();
  }, [initialFeedbacks]);

  const filteredFeedbacks = feedbacks.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchEmail = (item.user_email || "").toLowerCase().includes(q);
      const matchName = (item.user_name || "").toLowerCase().includes(q);
      const matchMsg = (item.message || "").toLowerCase().includes(q);
      const matchTool = (item.tool_name || "").toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchMsg && !matchTool) return false;
    }
    return true;
  });

  const handleSelectFeedback = (fb) => {
    setSelectedFeedback(fb);
    setReplyMessage(fb.admin_reply || "");
    setReplyStatus(fb.status === "pending" ? "replied" : fb.status);
    setReplySuccessMessage("");
  };

  const handleSaveReply = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFeedback || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    setReplySuccessMessage("");

    try {
      const res = await fetch("/api/ceo/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackId: selectedFeedback.id,
          adminReply: replyMessage.trim(),
          newStatus: replyStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save reply");
      }

      // Update local state
      const updated = feedbacks.map((f) =>
        f.id === selectedFeedback.id
          ? {
              ...f,
              admin_reply: replyMessage.trim(),
              status: replyStatus,
              replied_at: new Date().toISOString(),
            }
          : f
      );
      setFeedbacks(updated);
      setSelectedFeedback({
        ...selectedFeedback,
        admin_reply: replyMessage.trim(),
        status: replyStatus,
        replied_at: new Date().toISOString(),
      });
      setReplySuccessMessage("Reply recorded and status updated!");
    } catch (err) {
      alert(err.message || "Failed to save reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Quick reply snippet handler
  const insertTemplate = (templateText) => {
    setReplyMessage(templateText);
  };

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            এখনো কোনো ফিডব্যাক জমা পড়েনি (Inbox Empty)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            যেহেতু ওয়েবসাইটটি এখনো লাইভ হয়নি বা কেউ ফর্ম ফিলাপ করেনি, তাই ইনবক্স সম্পূর্ণ ফাঁকা রাখা হয়েছে। পাবলিক <code>/feedback</code> পেজ থেকে আসল ইউজার কোনো মতামত বা ফাইল পাঠালে তা স্বয়ংক্রিয়ভাবে এখানে চলে আসবে।
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/feedback"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> /feedback পেজ খুলুন (টেস্ট করতে)
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch("/api/ceo/feedback");
                const data = await res.json();
                if (data.success && Array.isArray(data.feedbacks)) {
                  setFeedbacks(data.feedbacks);
                  if (data.feedbacks.length > 0) {
                    setSelectedFeedback(data.feedbacks[0]);
                  }
                }
              } catch {
                // ignore
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> ইনবক্স রিফ্রেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left List Column */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, name, tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "replied", label: "Replied" },
              { id: "resolved", label: "Resolved" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Cards */}
        <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((item) => {
              const isSelected = selectedFeedback?.id === item.id;
              const isPending = item.status === "pending";

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectFeedback(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.user_name || "Community Member"}
                      </span>
                      {item.rating && (
                        <span className="flex items-center text-amber-500 text-xs">
                          <Star className="w-3 h-3 fill-current" /> {item.rating}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isPending
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-600 font-semibold mb-1">
                    {item.user_email}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {item.tool_name || "General"}
                      </span>
                      {item.attachment && (
                        <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                          <Paperclip className="w-2.5 h-2.5" /> File
                        </span>
                      )}
                    </div>
                    <span>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "Recent"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
              No feedback items found matching this filter.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Feedback Details & Reply Center */}
      <div className="lg:col-span-7">
        {selectedFeedback ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedFeedback.user_name || "Community Member"}
                  </h3>
                  <span className="text-xs text-slate-400">#{selectedFeedback.id}</span>
                </div>
                <span
                  className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                    selectedFeedback.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {selectedFeedback.status}
                </span>
              </div>

              {/* Email and Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <a
                  href={`mailto:${selectedFeedback.user_email}`}
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" /> {selectedFeedback.user_email}
                </a>
                <span>&bull;</span>
                <span>Category: <strong className="capitalize text-slate-700">{selectedFeedback.category}</strong></span>
                <span>&bull;</span>
                <span>Tool: <strong className="text-slate-700">{selectedFeedback.tool_name || "General"}</strong></span>
                <span>&bull;</span>
                <span>Rating: <strong className="text-amber-500">{selectedFeedback.rating || 5}/5</strong></span>
              </div>
            </div>

            {/* Message Body */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                User Feedback Message
              </p>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedFeedback.message}
              </p>
            </div>

            {/* Attachment Display */}
            {selectedFeedback.attachment && (
              <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-indigo-950 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-indigo-600" /> Attached Picture / File
                  </span>
                  <span className="text-[11px] text-indigo-600 font-normal">
                    {selectedFeedback.attachment.size ? `${(selectedFeedback.attachment.size / 1024).toFixed(1)} KB` : ""}
                  </span>
                </div>

                {selectedFeedback.attachment.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(selectedFeedback.attachment.url || "") ? (
                  <div className="space-y-2">
                    <a
                      href={selectedFeedback.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group relative overflow-hidden rounded-xl border border-indigo-200 max-h-64 bg-slate-900 flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={selectedFeedback.attachment.url}
                        alt={selectedFeedback.attachment.name || "Attachment"}
                        className="max-h-64 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ExternalLink className="w-4 h-4" /> View Full Image
                      </div>
                    </a>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate">{selectedFeedback.attachment.name}</span>
                      <a
                        href={selectedFeedback.attachment.url}
                        download={selectedFeedback.attachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {selectedFeedback.attachment.name || "Document"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {selectedFeedback.attachment.type || "Attached Document"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={selectedFeedback.attachment.url}
                      download={selectedFeedback.attachment.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Open / Download
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Previous Reply If Any */}
            {selectedFeedback.admin_reply && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>Previous Admin Reply</span>
                  <span className="text-[11px] font-normal text-emerald-600">
                    {selectedFeedback.replied_at
                      ? new Date(selectedFeedback.replied_at).toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed">
                  {selectedFeedback.admin_reply}
                </p>
              </div>
            )}

            {/* Reply Composer */}
            <form onSubmit={handleSaveReply} className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Reply / Send Update to User
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                  >
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const firstName = selectedFeedback.user_name ? selectedFeedback.user_name.split(" ")[0] : "সম্মানিত গ্রাহক";
                    insertTemplate(
                      `ধন্যবাদ ${firstName}! আপনার সুন্দর পরামর্শটির জন্য অসংখ্য ধন্যবাদ। আমরা এটি আমাদের ডেভেলপমেন্ট রোড়ম্যাপে যুক্ত করেছি এবং পরবর্তী রুটিএক্সা (Rootixa) আপডেটে এটি বাস্তবায়নের চেষ্টা করব।\n\nশুভকামনায়,\nটিম Rootixa`
                    );
                  }}
                  className="text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + ফিচার গ্রহণ (Feature Accepted)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstName = selectedFeedback.user_name ? selectedFeedback.user_name.split(" ")[0] : "সম্মানিত গ্রাহক";
                    insertTemplate(
                      `ধন্যবাদ ${firstName}! সমস্যাটি আমাদের দৃষ্টিগোচর করার জন্য আন্তরিকভাবে কৃতজ্ঞ। আমাদের ইঞ্জিনিয়ারিং টিম সমস্যাটি ফিক্স করে নতুন আপডেট লাইভ করেছে। অনুগ্রহ করে আবার ট্রাই করে দেখুন এবং আপনার অভিজ্ঞতা জানান!\n\nধন্যবাদান্তে,\nটিম Rootixa`
                    );
                  }}
                  className="text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + সমস্যা সমাধান (Bug Resolved)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstName = selectedFeedback.user_name ? selectedFeedback.user_name.split(" ")[0] : "সম্মানিত গ্রাহক";
                    insertTemplate(
                      `অনেক ধন্যবাদ ${firstName}! রুটিএক্সা (Rootixa) আপনার দৈনন্দিন কাজে সহায়তা করতে পেরে আমরা অত্যন্ত আনন্দিত। সামনে আপনার যেকোনো মতামত বা প্রয়োজন থাকলে নির্দ্বিধায় আমাদের জানাবেন।\n\nআন্তরিক শুভেচ্ছাসহ,\nটিম Rootixa`
                    );
                  }}
                  className="text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  + ধন্যবাদ ও প্রশংসা (Thank You)
                </button>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                placeholder="Write your reply or update message for this user..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />

              {replySuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {replySuccessMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* One-click open in Gmail / Mail client */}
                <a
                  href={`mailto:${selectedFeedback.user_email}?subject=${encodeURIComponent(
                    `Re: [Rootixa Feedback #${selectedFeedback.id}] ${selectedFeedback.title || "Your Request"}`
                  )}&body=${encodeURIComponent(replyMessage || `Hi ${selectedFeedback.user_name},\n\nRegarding your feedback on Rootixa:\n\n`)}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Send via Email Client (Mailto)
                </a>

                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyMessage.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Save Reply & Update Status
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            Select a feedback submission from the left list to view details and reply.
          </div>
        )}
      </div>
    </div>
  );
}
