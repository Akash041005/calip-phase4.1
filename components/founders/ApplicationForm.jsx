"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CircleCheck, ChevronDown, Check } from "lucide-react";
import { uploadStartup } from "../../lib/startupsUploadApi";
import { useAuth } from "../auth/AuthProvider";

const fieldStyles =
  "h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/20 dark:focus:bg-[#111318]";

const textAreaStyles =
  "h-[140px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-white/[0.08] dark:bg-[#0e1015] dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white/20 dark:focus:bg-[#111318]";

const REQUIRED_TEXT_FIELDS = [
  { name: "startupName", label: "Startup Name", placeholder: "Enter your startup name" },
  { name: "founderName", label: "Founder Name", placeholder: "Enter founder's full name" },
  { name: "email", label: "Email Address", type: "email", placeholder: "Enter your email address" },
  { name: "mobileNumber", label: "Mobile Number", placeholder: "+91 98765 43210" },
  { name: "startupWebsite", label: "Startup Website", placeholder: "https://your-startup.com" },
  { name: "linkedInProfile", label: "LinkedIn Profile", placeholder: "https://linkedin.com/in/yourname" },
  { name: "location", label: "Location", placeholder: "e.g. Bengaluru, Karnataka" },
];

const ENUM_FIELDS = [
  {
    name: "companyRegistrationType",
    label: "Company Registration Type",
    options: [
      "Private Limited",
      "LLP",
      "OPC",
      "Partnership Firm",
      "Sole Proprietorship",
      "Other",
    ],
  },
  {
    name: "currentStartupValuation",
    label: "Current Startup Valuation",
    options: [
      "Under ₹1 Cr",
      "₹1–2 Cr",
      "₹2–5 Cr",
      "₹5–10 Cr",
      "Under ₹10 Cr",
      "₹10–20 Cr",
      "₹20–50 Cr",
      "₹50–100 Cr",
      "₹100–500 Cr",
      "₹500 Cr+",
    ],
  },
  {
    name: "startupStage",
    label: "Startup Stage",
    options: [
      "Idea",
      "MVP",
      "Pre-Seed",
      "Early Traction",
      "Pre-revenue",
      "Revenue Generating",
      "Seed",
      "Pre-Series A",
      "Series A",
      "Series B+",
      "Growth Stage",
      "Scaling",
      "Bootstrapped",
    ],
  },
  {
    name: "industrySector",
    label: "Industry Sector",
    options: [
      "FinTech",
      "HealthTech",
      "AI",
      "SaaS",
      "ClimateTech",
      "DeepTech",
      "EdTech",
      "D2C",
      "Logistics",
      "Manufacturing",
      "Web3 & Crypto",
      "Agritech",
      "Other",
    ],
  },
  {
    name: "fundingStatus",
    label: "Funding Status",
    options: [
      "Bootstrapped",
      "Angel Funded",
      "Seed Funded",
      "VC Funded",
      "Corporate Backed",
      "Grant Funded",
    ],
  },
];

const ALL_REQUIRED = [
  "startupName",
  "founderName",
  "email",
  "mobileNumber",
  "startupWebsite",
  "companyRegistrationType",
  "currentStartupValuation",
  "startupStage",
  "industrySector",
  "fundingStatus",
  "linkedInProfile",
  "location",
  "description",
];

function CustomSelect({ field, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <label
        htmlFor={field.name}
        className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
      >
        {field.label} <span className="text-rose-500">*</span>
      </label>

      <button
        type="button"
        id={field.name}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-[44px] w-full items-center justify-between rounded-xl border px-4 text-left text-[14px] transition-all outline-none ${
          error
            ? "border-rose-400 bg-rose-50/50 dark:border-rose-500/40 dark:bg-rose-950/10"
            : open
            ? "border-slate-900 bg-white ring-2 ring-slate-900/10 dark:border-white/40 dark:bg-[#111318] dark:ring-white/10"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0e1015] dark:hover:bg-[#13161c] dark:hover:border-white/15"
        }`}
      >
        <span
          className={`truncate ${
            value ? "font-medium text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500"
          }`}
        >
          {value || `Select ${field.label.toLowerCase()}`}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180 text-slate-900 dark:text-white" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 max-h-[260px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl backdrop-blur-md dark:border-white/[0.1] dark:bg-[#111318] animate-in fade-in zoom-in-95 duration-100">
          {field.options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(field.name, opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                  isSelected
                    ? "bg-slate-900 font-semibold text-white dark:bg-white dark:text-black"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-[6px] text-[13px] text-rose-500">{error}</p>}
    </div>
  );
}

export default function ApplicationForm() {
  const { walletAddress, openConnectModal } = useAuth();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pitchDeckFile, setPitchDeckFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const pitchDeckRef = useRef(null);
  const logoRef = useRef(null);
  const mediaRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  };

  const handleSelectChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    for (const name of ALL_REQUIRED) {
      if (!values[name]?.trim()) {
        const label =
          REQUIRED_TEXT_FIELDS.find((f) => f.name === name)?.label ||
          ENUM_FIELDS.find((f) => f.name === name)?.label ||
          name;
        nextErrors[name] = `${label} is required.`;
      }
    }

    const email = values.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const website = values.startupWebsite?.trim();
    if (website && !/^https?:\/\/.+/.test(website)) {
      nextErrors.startupWebsite = "Please enter a valid URL (https://...).";
    }

    const linkedin = values.linkedInProfile?.trim();
    if (linkedin && !/^https?:\/\/.+/.test(linkedin)) {
      nextErrors.linkedInProfile = "Please enter a valid URL (https://...).";
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("startupName", values.startupName.trim());
      formData.append("founderName", values.founderName.trim());
      formData.append("email", values.email.trim());
      formData.append("mobileNumber", values.mobileNumber.trim());
      formData.append("startupWebsite", values.startupWebsite.trim());
      formData.append("companyRegistrationType", values.companyRegistrationType.trim());
      formData.append("currentStartupValuation", values.currentStartupValuation.trim());
      formData.append("startupStage", values.startupStage.trim());
      formData.append("industrySector", values.industrySector.trim());
      formData.append("fundingStatus", values.fundingStatus.trim());
      formData.append("linkedInProfile", values.linkedInProfile.trim());
      formData.append("location", values.location.trim());
      formData.append("description", values.description.trim());

      if (walletAddress) {
        formData.append("walletAddress", walletAddress);
      }

      if (pitchDeckFile) formData.append("pitchDeck", pitchDeckFile);
      if (logoFile) formData.append("logo", logoFile);
      for (const file of mediaFiles) {
        formData.append("media", file);
      }

      await uploadStartup(formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
    setSubmitted(false);
    setSubmitting(false);
    setSubmitError("");
    setPitchDeckFile(null);
    setLogoFile(null);
    setMediaFiles([]);
    if (pitchDeckRef.current) pitchDeckRef.current.value = "";
    if (logoRef.current) logoRef.current.value = "";
    if (mediaRef.current) mediaRef.current.value = "";
  };

  return (
    <section id="apply" className="mt-[60px] sm:mt-[80px] lg:mt-[110px] scroll-mt-[110px]">
      <h2 className="text-center text-[32px] font-bold leading-[48px] tracking-[-0.5px] text-[#111827] dark:text-white">
        Apply to list your startup
      </h2>

      <p className="mx-auto mt-[36px] max-w-[1000px] text-center text-[16px] sm:text-[22px] md:text-[28px] leading-[1.3] text-[#4b5563] dark:text-[#b0b5bf]">
        Complete the form below and our team will review your application
        within 5 business days.
      </p>

      {submitted ? (
        <div className="mx-auto mt-[60px] flex max-w-[700px] flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-[50px] text-center shadow-sm dark:border-white/[0.08] dark:bg-[#111318]">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CircleCheck
              className="h-[36px] w-[36px] text-emerald-500 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <h3 className="mt-[20px] text-[24px] font-bold text-slate-900 dark:text-white">
            Application submitted
          </h3>
          <p className="mt-[10px] text-[16px] leading-[22px] text-slate-600 dark:text-slate-300">
            Thanks for applying. Your startup is safely registered in the database under the <strong>Pending</strong> review queue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/my-startups"
              className="cl-btn-primary h-[44px] px-6 text-[14px]"
            >
              View In My Startups
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="cl-btn-secondary h-[44px] px-6 text-[14px]"
            >
              Submit Another Application
            </button>
            <Link
              href="/marketplace"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              Continue to Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-[60px]">
          <div className="mx-auto flex max-w-[700px] flex-col gap-[32px]">
            {walletAddress ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13.5px] text-emerald-800 dark:text-emerald-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Connected as <strong className="font-mono text-xs font-semibold">{walletAddress}</strong>. Your submitted startup will appear under <strong>My Startups</strong>.
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13.5px] text-amber-800 dark:text-amber-300">
                <div>
                  <strong>⚠️ Wallet not connected.</strong> Connect your wallet so this application is linked to your account and visible under <strong>My Startups</strong>.
                </div>
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
                >
                  Connect Wallet
                </button>
              </div>
            )}
            {REQUIRED_TEXT_FIELDS.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
                >
                  {field.label} <span className="text-rose-500">*</span>
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={fieldStyles}
                />
                {errors[field.name] && (
                  <p className="mt-[6px] text-[13px] text-rose-500">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {ENUM_FIELDS.map((field) => (
              <CustomSelect
                key={field.name}
                field={field}
                value={values[field.name] || ""}
                onChange={handleSelectChange}
                error={errors[field.name]}
              />
            ))}

            <div>
              <label
                htmlFor="description"
                className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
              >
                Startup Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={values.description || ""}
                onChange={handleChange}
                placeholder="Describe your startup — problem, solution, market, traction..."
                className={textAreaStyles}
              />
              {errors.description && (
                <p className="mt-[6px] text-[13px] text-rose-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pitchDeck"
                className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
              >
                Pitch Deck <span className="text-[#6b7280] dark:text-[#7c8190] font-normal text-xs">(optional, max 5MB)</span>
              </label>
              <input
                ref={pitchDeckRef}
                id="pitchDeck"
                name="pitchDeck"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)}
                className="w-full text-[14px] text-slate-700 dark:text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-white file:transition-all hover:file:bg-slate-800 dark:file:bg-white dark:file:text-slate-950 dark:hover:file:bg-slate-100 cursor-pointer"
              />
              {pitchDeckFile && (
                <p className="mt-[6px] text-[13px] text-slate-500 dark:text-zinc-400">
                  {pitchDeckFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="logo"
                className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
              >
                Company Logo <span className="text-[#6b7280] dark:text-[#7c8190] font-normal text-xs">(optional, max 5MB)</span>
              </label>
              <input
                ref={logoRef}
                id="logo"
                name="logo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-[14px] text-slate-700 dark:text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-white file:transition-all hover:file:bg-slate-800 dark:file:bg-white dark:file:text-slate-950 dark:hover:file:bg-slate-100 cursor-pointer"
              />
              {logoFile && (
                <p className="mt-[6px] text-[13px] text-slate-500 dark:text-zinc-400">
                  {logoFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="media"
                className="mb-[9px] block text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white transition-colors"
              >
                Media Files <span className="text-[#6b7280] dark:text-[#7c8190] font-normal text-xs">(optional, up to 10, max 5MB each)</span>
              </label>
              <input
                ref={mediaRef}
                id="media"
                name="media"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                className="w-full text-[14px] text-slate-700 dark:text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-white file:transition-all hover:file:bg-slate-800 dark:file:bg-white dark:file:text-slate-950 dark:hover:file:bg-slate-100 cursor-pointer"
              />
              {mediaFiles.length > 0 && (
                <p className="mt-[6px] text-[13px] text-slate-500 dark:text-zinc-400">
                  {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="mx-auto mt-[20px] max-w-[700px] text-center text-[15px] text-rose-500">
              {submitError}
            </p>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="cl-btn-primary h-[48px] w-full max-w-[320px] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
