"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface Profile {
    id: string;
    display_name: string | null;
    phone: string | null;
    date_of_birth: string | null;
    hobbies: string | null;
    bio: string | null;
}

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const supabase = getSupabaseBrowserClient();

    const [profile, setProfile] = useState<Profile | null>(null);

    const [displayName, setDisplayName] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [hobbies, setHobbies] = useState("");
    const [bio, setBio] = useState("");

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Redirect unauthenticated users
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Load profile
    useEffect(() => {
        if (!user?.id) return;

        const loadProfile = async () => {
            setLoadingProfile(true);
            setError("");

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select(
                        "id, display_name, phone, date_of_birth, hobbies, bio"
                    )
                    .eq("id", user.id)
                    .maybeSingle();

                if (error) {
                    throw error;
                }

                setProfile(data);

                setDisplayName(
                    data?.display_name ||
                    user.name ||
                    user.email.split("@")[0]
                );

                setPhone(data?.phone || "");
                setDateOfBirth(data?.date_of_birth || "");
                setHobbies(data?.hobbies || "");
                setBio(data?.bio || "");
            } catch (err) {
                console.error("Profile loading error:", err);

                setError("Unable to load your profile.");
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, [user?.id, user?.name, user?.email, supabase]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            /*
             * Update profile table
             */
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert(
                    {
                        id: user.id,
                        display_name: displayName.trim(),
                        phone: phone.trim() || null,
                        date_of_birth: dateOfBirth || null,
                        hobbies: hobbies.trim() || null,
                        bio: bio.trim() || null,
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "id",
                    }
                );

            if (profileError) {
                throw profileError;
            }

            /*
             * Also update Supabase Auth metadata.
             *
             * This makes the username used by your navbar
             * and portal update as well.
             */
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    name: displayName.trim(),
                },
            });

            if (authError) {
                throw authError;
            }

            setProfile({
                id: user.id,
                display_name: displayName.trim(),
                phone: phone.trim() || null,
                date_of_birth: dateOfBirth || null,
                hobbies: hobbies.trim() || null,
                bio: bio.trim() || null,
            });

            setSuccess("Profile updated successfully.");

            // Remove success message after 3 seconds
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err: unknown) {
            console.error("Profile update error:", err);

            const message =
                err &&
                    typeof err === "object" &&
                    "message" in err
                    ? String((err as { message: unknown }).message)
                    : "Unable to update your profile.";

            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || loadingProfile) {
        return (
            <div className="max-w-4xl mx-auto py-12 space-y-6">
                <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-[500px] bg-black/40 border border-white/8 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!user || !isAuthenticated) {
        return null;
    }

    const initials = (
        displayName ||
        user.email
    )
        .slice(0, 1)
        .toUpperCase();

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-[10px] text-brand-red uppercase tracking-widest">
                        Account
                    </p>

                    <h1 className="font-heading text-3xl text-white mt-1">
                        My Profile
                    </h1>

                    <p className="text-gray text-sm mt-1">
                        Manage your personal information and preferences.
                    </p>
                </div>

                <Link
                    href="/portal"
                    className="text-sm text-gray hover:text-white transition-colors"
                >
                    ← Back to Portal
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-black/60 border border-white/8 rounded-2xl shadow-xl backdrop-blur overflow-hidden">

                {/* Top profile section */}
                <div className="p-6 md:p-8 border-b border-white/10">

                    <div className="flex items-center gap-5">

                        {/* Avatar */}
                        <div
                            className="w-20 h-20 rounded-full
                         bg-gradient-to-br from-brand-red to-brand-red-dark
                         flex items-center justify-center
                         text-white font-mono text-3xl font-bold
                         shadow-lg shadow-brand-red/20
                         border border-white/20"
                        >
                            {initials}
                        </div>

                        <div>
                            <h2 className="font-heading text-2xl text-white">
                                {displayName}
                            </h2>

                            <p className="font-mono text-xs text-gray mt-1">
                                {user.email}
                            </p>

                            <p className="font-mono text-[10px] text-gray/40 mt-1">
                                Account ID: {user.id}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSave}
                    className="p-6 md:p-8 space-y-6"
                >

                    {/* Personal Information */}
                    <div className="space-y-1">
                        <p className="font-mono text-[10px] text-brand-red uppercase tracking-widest">
                            Personal Information
                        </p>

                        <h2 className="font-heading text-xl text-white">
                            Your Details
                        </h2>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <label
                            htmlFor="display-name"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Display Name
                        </label>

                        <input
                            id="display-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            required
                            className="w-full bg-black/40 border border-white/10
                         rounded-xl px-4 py-3 text-white
                         placeholder-gray/30 text-sm
                         focus:outline-none focus:border-brand-red/50
                         transition-colors"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full bg-white/[0.03]
                         border border-white/10
                         rounded-xl px-4 py-3
                         text-gray/50 text-sm
                         cursor-not-allowed"
                        />

                        <p className="font-mono text-[10px] text-gray/40">
                            Email changes can be managed from Account Settings.
                        </p>
                    </div>

                    {/* Phone + DOB */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Phone */}
                        <div className="space-y-2">
                            <label
                                htmlFor="phone"
                                className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                            >
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+92 300 1234567"
                                autoComplete="tel"
                                className="w-full bg-black/40
                           border border-white/10
                           rounded-xl px-4 py-3
                           text-white
                           placeholder-gray/30
                           text-sm
                           focus:outline-none
                           focus:border-brand-red/50
                           transition-colors"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <label
                                htmlFor="date-of-birth"
                                className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                            >
                                Date of Birth
                            </label>

                            <input
                                id="date-of-birth"
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full bg-black/40
                           border border-white/10
                           rounded-xl px-4 py-3
                           text-white
                           text-sm
                           focus:outline-none
                           focus:border-brand-red/50
                           transition-colors
                           [color-scheme:dark]"
                            />
                        </div>

                    </div>

                    {/* Hobbies */}
                    <div className="space-y-2">
                        <label
                            htmlFor="hobbies"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Hobbies
                        </label>

                        <input
                            id="hobbies"
                            type="text"
                            value={hobbies}
                            onChange={(e) => setHobbies(e.target.value)}
                            placeholder="Movies, football, gaming, coding..."
                            className="w-full bg-black/40
                         border border-white/10
                         rounded-xl px-4 py-3
                         text-white
                         placeholder-gray/30
                         text-sm
                         focus:outline-none
                         focus:border-brand-red/50
                         transition-colors"
                        />

                        <p className="font-mono text-[10px] text-gray/40">
                            Separate multiple hobbies with commas.
                        </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label
                            htmlFor="bio"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            About You
                        </label>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell other movie fans something about yourself..."
                            rows={4}
                            className="w-full bg-black/40
                         border border-white/10
                         rounded-xl px-4 py-3
                         text-white
                         placeholder-gray/30
                         text-sm
                         resize-none
                         focus:outline-none
                         focus:border-brand-red/50
                         transition-colors"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-brand-red/10
                            border border-brand-red/30
                            rounded-xl px-4 py-3">
                            <p className="text-brand-red text-sm">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="bg-emerald-500/10
                            border border-emerald-500/30
                            rounded-xl px-4 py-3">
                            <p className="text-emerald-400 text-sm">
                                ✓ {success}
                            </p>
                        </div>
                    )}

                    {/* Save */}
                    <div className="flex justify-end pt-2">

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-brand-red
                         hover:bg-brand-red-dark
                         disabled:opacity-50
                         disabled:cursor-not-allowed
                         text-white
                         font-semibold
                         px-8 py-3
                         rounded-xl
                         transition-all
                         shadow-lg
                         shadow-brand-red/20
                         hover:shadow-brand-red/30"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}