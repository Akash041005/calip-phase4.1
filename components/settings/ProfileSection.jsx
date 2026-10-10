"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { useAuth } from "../auth/AuthProvider";
import { truncateAddress } from "../../lib/format";
import { updateUserProfile } from "../../lib/authApi";

const editableInputClass =
  "h-[42px] w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[13.5px] leading-none text-[#f4f5fb] placeholder-[#737d91] outline-none transition focus:border-[#8174ff]/60 focus:bg-white/[0.06]";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function ProfileCard({ user, updateUser }) {
  const signedIn = Boolean(user);
  const displayName = signedIn
    ? user.username || truncateAddress(user.walletAddress)
    : "Guest";
  const displayHandle = signedIn ? truncateAddress(user.walletAddress) : "";
  const serverPhoto = signedIn ? user.profilePhoto || null : null;

  const draftUsername = user?.username || "";
  const [firstName, setFirstName] = useState(() => user?.firstName || "");
  const [lastName, setLastName] = useState(() => user?.lastName || "");
  const [email, setEmail] = useState(() => user?.email || "");
  const [phone, setPhone] = useState(() => user?.phone || "");
  const [country, setCountry] = useState(() => user?.country || "");
  const [city, setCity] = useState(() => user?.city || "");
  const [bio, setBio] = useState(() => user?.bio || "");
  const [website, setWebsite] = useState(() => user?.website || "");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const fileInputRef = useRef(null);

  const serverUsername = (user?.username || "").trim();
  const dirty =
    draftUsername.trim() !== serverUsername ||
    photo !== null ||
    firstName !== (user?.firstName || "") ||
    lastName !== (user?.lastName || "") ||
    email !== (user?.email || "") ||
    phone !== (user?.phone || "") ||
    country !== (user?.country || "") ||
    city !== (user?.city || "") ||
    bio !== (user?.bio || "") ||
    website !== (user?.website || "");

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setNotice(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setNotice({ type: "error", text: "Only JPG, PNG, or WEBP images are allowed." });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setNotice({ type: "error", text: "Image must be 5MB or smaller." });
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!signedIn || saving || !dirty) return;
    setSaving(true);
    setNotice(null);
    try {
      const formData = new FormData();
      if (draftUsername.trim()) formData.append("username", draftUsername.trim());
      if (firstName) formData.append("firstName", firstName);
      if (lastName) formData.append("lastName", lastName);
      if (email) formData.append("email", email);
      if (phone) formData.append("phone", phone);
      if (country) formData.append("country", country);
      if (city) formData.append("city", city);
      if (bio) formData.append("bio", bio);
      if (website) formData.append("website", website);
      if (photo) formData.append("profilePhoto", photo);
      const res = await updateUserProfile(formData);
      const updated = res?.user ?? res ?? null;
      if (updated) updateUser(updated);
      setPhoto(null);
      setPhotoPreview(null);
      setNotice({ type: "success", text: res?.message || "Profile updated." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err?.message || "Could not update your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard className="border-[#242730] dark:border-[#2a2e3e] bg-[rgba(255,255,255,0.3)] dark:bg-[rgba(30,34,48,0.5)]">
      <div className="px-[35px] pt-[15px] pb-[4px]">
        <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
          Profile
        </h2>
      </div>

      {notice && (
        <p
          className={`px-[35px] text-[13px] leading-none ${
            notice.type === "error" ? "text-[#F0395A]" : "text-[#0e8a4d]"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="flex items-center gap-[20px] px-[35px] py-[18px]">
        <div className="relative shrink-0">
          <div className="flex h-[81px] w-[81px] items-center justify-center overflow-hidden rounded-full bg-white dark:bg-[#1c202e]">
            {photoPreview || serverPhoto ? (
              <Image
                src={photoPreview || serverPhoto}
                alt={displayName}
                width={81}
                height={81}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-[36px] w-[36px] text-black dark:text-white" strokeWidth={1.5} />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoSelect}
            disabled={!signedIn}
          />
          {signedIn ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              aria-label="Upload profile photo"
              className="absolute -bottom-[2px] -right-[2px] flex h-[34.8px] w-[34.8px] items-center justify-center rounded-full bg-[#6551EE] transition-colors hover:bg-[#5741dc] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="h-[16px] w-[16px] animate-spin text-white" strokeWidth={2} />
              ) : (
                <Camera className="h-[16px] w-[16px] text-white" strokeWidth={2} />
              )}
            </button>
          ) : (
            <div className="absolute -bottom-[2px] -right-[2px] flex h-[34.8px] w-[34.8px] items-center justify-center rounded-full bg-[#6551EE]">
              <Camera className="h-[16px] w-[16px] text-white" strokeWidth={2} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-none text-[#9ca3af] dark:text-[#7c8190]">
            {displayName}
          </p>
          <p className="mt-[4px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
            {displayHandle}
          </p>
        </div>

        {signedIn && (
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="ml-auto cl-btn-primary h-[38px] px-6 text-[13.5px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-[20px] px-[35px] pb-[24px] sm:grid-cols-2">
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter country"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div>
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Bio</label>
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className={`${editableInputClass} mt-[16px]`}
          />
        </div>
      </div>
    </SettingsCard>
  );
}

export default function ProfileSection() {
  const { user, updateUser } = useAuth();

  return (
    <ProfileCard
      key={user?.walletAddress || "signed-out"}
      user={user}
      updateUser={updateUser}
    />
  );
}
