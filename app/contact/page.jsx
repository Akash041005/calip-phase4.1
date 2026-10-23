"use client";

import { useState } from "react";
import Navbar from "../../components/dashboard/Navbar";
import Footer from "../../components/dashboard/Footer";
import { submitGeneralEnquiry, submitInvestorContact } from "../../lib/contactApi";
import { Mail, Briefcase, CheckCircle2, AlertCircle, Send, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "investor"

  // General Enquiry State
  const [generalForm, setGeneralForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [generalLoading, setGeneralLoading] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Investor Contact State
  const [investorForm, setInvestorForm] = useState({
    name: "",
    email: "",
    organization: "",
    ticketSize: "$50K - $250K",
    interests: "",
    message: "",
  });
  const [investorLoading, setInvestorLoading] = useState(false);
  const [investorSuccess, setInvestorSuccess] = useState(false);
  const [investorError, setInvestorError] = useState("");

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setGeneralLoading(true);
    try {
      if (!generalForm.name || !generalForm.email || !generalForm.subject || !generalForm.message) {
        throw new Error("Please complete all required fields.");
      }
      await submitGeneralEnquiry(generalForm);
      setGeneralSuccess(true);
      setGeneralForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setGeneralError(err.message || "Failed to submit inquiry.");
    } finally {
      setGeneralLoading(false);
    }
  };

  const handleInvestorSubmit = async (e) => {
    e.preventDefault();
    setInvestorError("");
    setInvestorLoading(true);
    try {
      if (!investorForm.name || !investorForm.email || !investorForm.organization || !investorForm.message) {
        throw new Error("Please fill in your name, email, organization, and message.");
      }
      await submitInvestorContact(investorForm);
      setInvestorSuccess(true);
      setInvestorForm({
        name: "",
        email: "",
        organization: "",
        ticketSize: "$50K - $250K",
        interests: "",
        message: "",
      });
    } catch (err) {
      setInvestorError(err.message || "Failed to submit investor inquiry.");
    } finally {
      setInvestorLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f4f5fb] transition-colors">
      <Navbar activePage="faq" />

      <main className="mx-auto max-w-[1440px] px-4 pb-[80px] sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[800px] pt-8 sm:pt-12">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Support & Institutional Relations
          </p>

          <h1 className="mt-3 text-[30px] font-bold tracking-tight text-slate-900 dark:text-white sm:text-[38px] lg:text-[44px]">
            Get in Touch with Calip
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Have questions about startup tokenization, auction escrow, or institutional allocations? Submit an inquiry and our team will respond within 24 hours.
          </p>

          {/* Mode Tabs */}
          <div className="mt-8 flex gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-3">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "general"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Mail className="h-4 w-4" />
              General Support & Inquiries
            </button>
            <button
              onClick={() => setActiveTab("investor")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === "investor"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Accredited & Institutional Investors
            </button>
          </div>

          {/* General Form */}
          {activeTab === "general" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] sm:p-8">
              {generalSuccess ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Message Received</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Thank you for reaching out. We have received your inquiry and sent an acknowledgment to your email.
                  </p>
                  <button
                    onClick={() => setGeneralSuccess(false)}
                    className="mt-6 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGeneralSubmit} className="space-y-5">
                  {generalError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{generalError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={generalForm.name}
                        onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={generalForm.email}
                        onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                        placeholder="alex@domain.com"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Subject *</label>
                    <input
                      type="text"
                      required
                      value={generalForm.subject}
                      onChange={(e) => setGeneralForm({ ...generalForm, subject: e.target.value })}
                      placeholder="e.g. Question regarding live auction participation"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Message *</label>
                    <textarea
                      rows={5}
                      required
                      value={generalForm.message}
                      onChange={(e) => setGeneralForm({ ...generalForm, message: e.target.value })}
                      placeholder="Describe your inquiry or the issue you are experiencing..."
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generalLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {generalLoading ? "Sending..." : "Send Inquiry"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Investor Form */}
          {activeTab === "investor" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.12] dark:bg-[#151824] sm:p-8">
              {investorSuccess ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Investor Inquiry Received</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Thank you for your interest. A member of our Institutional Venture Operations will connect with you promptly.
                  </p>
                  <button
                    onClick={() => setInvestorSuccess(false)}
                    className="mt-6 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInvestorSubmit} className="space-y-5">
                  {investorError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{investorError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={investorForm.name}
                        onChange={(e) => setInvestorForm({ ...investorForm, name: e.target.value })}
                        placeholder="e.g. Jordan Hayes"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Corporate / Entity Email *</label>
                      <input
                        type="email"
                        required
                        value={investorForm.email}
                        onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                        placeholder="jordan@venturecapital.com"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Organization / Fund *</label>
                      <input
                        type="text"
                        required
                        value={investorForm.organization}
                        onChange={(e) => setInvestorForm({ ...investorForm, organization: e.target.value })}
                        placeholder="e.g. Horizon Syndicate / Family Office"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Ticket Size</label>
                      <select
                        value={investorForm.ticketSize}
                        onChange={(e) => setInvestorForm({ ...investorForm, ticketSize: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                      >
                        <option value="$10K - $50K">$10,000 - $50,000</option>
                        <option value="$50K - $250K">$50,000 - $250,000</option>
                        <option value="$250K - $1M">$250,000 - $1,000,000</option>
                        <option value="$1M+">$1,000,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Sectors of Interest</label>
                    <input
                      type="text"
                      value={investorForm.interests}
                      onChange={(e) => setInvestorForm({ ...investorForm, interests: e.target.value })}
                      placeholder="e.g. DeFi, AI / Robotics, CleanTech, Enterprise Infra"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Strategic Objectives & Inquiries *</label>
                    <textarea
                      rows={4}
                      required
                      value={investorForm.message}
                      onChange={(e) => setInvestorForm({ ...investorForm, message: e.target.value })}
                      placeholder="Outline your allocation timeline, syndicate structure, or specific venture interests..."
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:focus:border-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={investorLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {investorLoading ? "Submitting..." : "Submit Institutional Application"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
