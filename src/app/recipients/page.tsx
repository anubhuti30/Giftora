"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Plus, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  X, 
  Cake, 
  FileText 
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useGiftora } from "@/context/GiftoraContext";
import { Recipient } from "@/types";
import { POPULAR_INTEREST_TAGS } from "@/data/mockRecipients";

export default function RecipientsPage() {
  const router = useRouter();
  const { recipients, addRecipient, updateRecipient, deleteRecipient, updateSearchCriteria } = useGiftora();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Sister",
    ageGroup: "26-30",
    birthday: "",
    notes: "",
    interests: [] as string[],
  });

  const [customInterest, setCustomInterest] = useState("");

  const handleOpenAdd = () => {
    setEditingRecipient(null);
    setFormData({
      name: "",
      relationship: "Sister",
      ageGroup: "26-30",
      birthday: "",
      notes: "",
      interests: ["Specialty Coffee", "Ceramics & Pottery"],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Recipient) => {
    setEditingRecipient(rec);
    setFormData({
      name: rec.name,
      relationship: rec.relationship,
      ageGroup: rec.ageGroup || "26-30",
      birthday: rec.birthday || "",
      notes: rec.notes || "",
      interests: [...rec.interests],
    });
    setIsModalOpen(true);
  };

  const toggleInterest = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()],
      }));
      setCustomInterest("");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingRecipient) {
      updateRecipient({
        ...editingRecipient,
        ...formData,
      });
    } else {
      addRecipient(formData);
    }
    setIsModalOpen(false);
  };

  const handleStartDiscoveryFor = (rec: Recipient) => {
    updateSearchCriteria({
      recipientName: rec.name,
      relationship: rec.relationship,
      interests: rec.interests,
      age: rec.ageGroup,
    });
    router.push(`/discover?recipient=${encodeURIComponent(rec.name)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0]">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#8E8691] mb-2">
                <Link href="/discover" className="hover:text-[#422C42] flex items-center gap-1">
                  <span>Workspace</span>
                </Link>
                <span>/</span>
                <span className="text-[#422C42] font-semibold">Recipient Directory</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#422C42]">
                Loved Ones & Gift Profiles
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6770] mt-1">
                Save birthdays, evolving interests, and notes to get hyper-tailored gift recommendations year after year.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-[#422C42] hover:bg-[#9B668B] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-soft transition-all active:scale-95 self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Loved One</span>
            </button>
          </div>

          {/* Recipients Grid */}
          {recipients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recipients.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-3xl border border-[#E6DDE5] p-5 sm:p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar, Name, Relationship, Actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#E9DDE7] relative shrink-0 border border-[#E6DDE5]">
                          {rec.avatarUrl ? (
                            <Image
                              src={rec.avatarUrl}
                              alt={rec.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#422C42] font-bold text-lg">
                              {rec.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-serif text-lg font-bold text-[#29252A]">
                              {rec.name}
                            </h2>
                            <span className="text-[10px] font-semibold text-[#834E74] bg-[#F2E8F0] px-2 py-0.5 rounded-full">
                              {rec.relationship}
                            </span>
                          </div>
                          {rec.ageGroup && (
                            <span className="text-[11px] text-[#8E8691]">
                              Age: {rec.ageGroup}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          title="Edit recipient"
                          className="p-2 text-[#8E8691] hover:text-[#422C42] hover:bg-[#FAF8F5] rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRecipient(rec.id)}
                          title="Delete profile"
                          className="p-2 text-[#8E8691] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Birthday / Important Date */}
                    {rec.birthday && (
                      <div className="flex items-center gap-2 text-xs text-[#6E6770] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E6DDE5]/60 w-fit">
                        <Cake className="w-3.5 h-3.5 text-[#9B668B]" />
                        <span>Celebration Date: <strong>{rec.birthday}</strong></span>
                      </div>
                    )}

                    {/* Interests Chips */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8691] block mb-2">
                        Interests & Passions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.interests.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#FAF8F5] text-[#422C42] border border-[#E6DDE5] px-2.5 py-1 rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {rec.notes && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6DDE5]/80 text-xs text-[#6E6770] flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#8E8691] shrink-0 mt-0.5" />
                        <p className="line-clamp-2">{rec.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Launch Action */}
                  <div className="mt-6 pt-4 border-t border-[#E6DDE5] flex items-center justify-between">
                    <span className="text-[11px] text-[#8E8691]">
                      {rec.savedGiftCount || 0} saved gift ideas
                    </span>
                    <button
                      onClick={() => handleStartDiscoveryFor(rec)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#422C42] hover:text-[#9B668B] transition-colors group"
                    >
                      <span>Find Gifts for {rec.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white p-12 rounded-3xl border border-[#E6DDE5] text-center max-w-lg mx-auto my-12 space-y-4 shadow-soft">
              <div className="w-14 h-14 rounded-2xl bg-[#E9DDE7] text-[#422C42] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-[#9B668B]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#422C42]">
                No recipient profiles yet
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6770] leading-relaxed">
                Add family members, partners, and friends to keep track of what they love and plan gifts ahead of time.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#422C42] text-white text-xs font-semibold hover:bg-[#9B668B] transition-colors shadow-soft"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Recipient</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add / Edit Recipient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E6DDE5] max-w-lg w-full p-6 sm:p-8 shadow-elevated space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#422C42]">
                  {editingRecipient ? "Edit Recipient Profile" : "Add Loved One"}
                </h3>
                <p className="text-xs text-[#6E6770]">
                  Help Giftora understand what makes them feel truly seen.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#8E8691] hover:text-[#422C42] rounded-xl hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Their Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pooja"
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                  >
                    {["Sister", "Brother", "Partner", "Mom", "Dad", "Best Friend", "Colleague", "Child", "Other"].map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Birthday or Milestone
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                    Age Group
                  </label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                  >
                    {["Under 18", "18-25", "26-30", "31-40", "41-50", "50+"].map((age) => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                  Interests & Passions (Select from popular tags)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#FAF8F5] rounded-xl border border-[#E6DDE5]">
                  {POPULAR_INTEREST_TAGS.map((tag) => {
                    const isSelected = formData.interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                          isSelected
                            ? "bg-[#422C42] text-white font-medium"
                            : "bg-white text-[#6E6770] border border-[#E6DDE5] hover:border-[#9B668B]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    placeholder="Add custom interest (e.g. Calligraphy)..."
                    className="flex-1 bg-white border border-[#E6DDE5] rounded-xl px-3 py-1.5 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B]"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddCustomInterest(e)}
                    className="px-3 py-1.5 bg-[#422C42] hover:bg-[#9B668B] text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#422C42] mb-1.5">
                  Personal Quirks & Preferences Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Loves warm neutral tones, handmade pottery. Dislikes plastic items..."
                  className="w-full bg-[#FAF8F5] border border-[#E6DDE5] rounded-xl px-3.5 py-2 text-xs text-[#29252A] focus:outline-none focus:border-[#9B668B] focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6DDE5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E6DDE5] text-xs font-semibold text-[#6E6770] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#422C42] hover:bg-[#9B668B] text-white text-xs font-semibold shadow-soft transition-all"
                >
                  {editingRecipient ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
