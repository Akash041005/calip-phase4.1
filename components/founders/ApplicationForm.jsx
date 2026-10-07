"use client";

import { useState, useRef } from "react";
import { CircleCheck } from "lucide-react";
import { uploadStartup } from "../../lib/startupsUploadApi";

const fieldStyles =
  "h-[40px] w-full rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 text-[14px] sm:text-[16px] text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#6366f1] focus:bg-white dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white dark:placeholder:text-[#7c8190] dark:focus:bg-[#181c28]";

const selectStyles =
  "h-[40px] w-full rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 text-[14px] sm:text-[16px] text-[#1a1a2e] outline-none transition-colors focus:border-[#6366f1] focus:bg-white appearance-none dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white dark:focus:bg-[#181c28]";

const textAreaStyles =
  "h-[160px] w-full resize-none rounded-[10px] border border-[#e5e7eb] bg-[#f4f5f7] px-4 py-3 text-[14px] sm:text-[16px] text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#6366f1] focus:bg-white dark:border-[#2a2e3e] dark:bg-[#1c202e] dark:text-white dark:placeholder:text-[#7c8190] dark:focus:bg-[#181c28]";

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
      "Pre-revenue",
      "Revenue Generating",
      "Pre-Series A",
      "Seed",
      "Series A",
      "Series B+",
      "Growth Stage",
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

export default function ApplicationForm() {
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
        <div className="mx-auto mt-[60px] flex max-w-[700px] flex-col items-center rounded-[20px] border border-[#e5e7eb] bg-white px-8 py-[50px] text-center shadow-[0_2px_4px_0px_rgba(0,0,0,0.25)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0_2px_4px_0px_rgba(0,0,0,0.5)]">
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#d1fae5]">
            <CircleCheck
              className="h-[36px] w-[36px] text-[#10b981]"
              strokeWidth={2}
            />
          </div>
          <h3 className="mt-[20px] text-[24px] font-semibold text-[#111827] dark:text-white">
            Application submitted
          </h3>
          <p className="mt-[10px] text-[16px] leading-[22px] text-[#4b5563] dark:text-[#b0b5bf]">
            Thanks for applying. Our team will review your application within 5
            business days and reach out to you by email.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-[28px] inline-flex h-[46px] items-center justify-center rounded-[10px] border border-[#d1d5db] bg-white px-6 text-[16px] font-medium text-[#374151] transition-colors hover:bg-[#f9fafb] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:text-[#b0b5bf] dark:hover:bg-[#1c202e]"
          >
            Submit another application
          </button>
          <a
            href="/marketplace"
            className="mt-[12px] inline-flex h-[46px] items-center justify-center rounded-[10px] bg-[#6366F1] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#5558e3]"
          >
            Continue to Marketplace
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-[60px]">
          <div className="mx-auto flex max-w-[700px] flex-col gap-[36px]">
            {REQUIRED_TEXT_FIELDS.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
                >
                  {field.label} <span className="text-red-500">*</span>
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
                  <p className="mt-[6px] text-[14px] text-red-500">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {ENUM_FIELDS.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
                >
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={values[field.name] || ""}
                  onChange={handleChange}
                  className={selectStyles}
                >
                  <option value="" disabled>
                    Select {field.label.toLowerCase()}
                  </option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors[field.name] && (
                  <p className="mt-[6px] text-[14px] text-red-500">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label
                htmlFor="description"
                className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
              >
                Startup Description <span className="text-red-500">*</span>
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
                <p className="mt-[6px] text-[14px] text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pitchDeck"
                className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
              >
                Pitch Deck <span className="text-[#6b7280] dark:text-[#7c8190]">(optional, max 5MB)</span>
              </label>
              <input
                ref={pitchDeckRef}
                id="pitchDeck"
                name="pitchDeck"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setPitchDeckFile(e.target.files?.[0] || null)}
                className="w-full text-[16px] text-[#1a1a2e] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#4f46e5] file:px-4 file:py-2 file:text-[14px] file:font-medium file:text-white file:transition-colors hover:file:bg-[#4338ca] dark:text-white"
              />
              {pitchDeckFile && (
                <p className="mt-[6px] text-[14px] text-[#6b7280] dark:text-[#7c8190]">
                  {pitchDeckFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="logo"
                className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
              >
                Company Logo <span className="text-[#6b7280] dark:text-[#7c8190]">(optional, max 5MB)</span>
              </label>
              <input
                ref={logoRef}
                id="logo"
                name="logo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-[16px] text-[#1a1a2e] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#4f46e5] file:px-4 file:py-2 file:text-[14px] file:font-medium file:text-white file:transition-colors hover:file:bg-[#4338ca] dark:text-white"
              />
              {logoFile && (
                <p className="mt-[6px] text-[14px] text-[#6b7280] dark:text-[#7c8190]">
                  {logoFile.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="media"
                className="mb-[9px] block text-[14px] sm:text-[16px] font-medium leading-[normal] text-[#111827] dark:text-white"
              >
                Media Files <span className="text-[#6b7280] dark:text-[#7c8190]">(optional, up to 10, max 5MB each)</span>
              </label>
              <input
                ref={mediaRef}
                id="media"
                name="media"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                className="w-full text-[16px] text-[#1a1a2e] file:mr-4 file:rounded-[10px] file:border-0 file:bg-[#4f46e5] file:px-4 file:py-2 file:text-[14px] file:font-medium file:text-white file:transition-colors hover:file:bg-[#4338ca] dark:text-white"
              />
              {mediaFiles.length > 0 && (
                <p className="mt-[6px] text-[14px] text-[#6b7280] dark:text-[#7c8190]">
                  {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="mx-auto mt-[20px] max-w-[700px] text-center text-[16px] text-red-500">
              {submitError}
            </p>
          )}

          <div className="mt-[44px] flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="h-[50px] w-full max-w-[331px] rounded-[10px] bg-[#6366f1] text-[16px] font-semibold text-white transition-colors hover:bg-[#5346ae] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#6366f1] dark:hover:bg-[#6366f1]/30"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
