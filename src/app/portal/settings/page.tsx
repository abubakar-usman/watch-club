"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountSettingsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const supabase = getSupabaseBrowserClient();

    // Change password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Transfer account
    const [transferEmail, setTransferEmail] = useState("");
    const [transferPassword, setTransferPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showTransferPassword, setShowTransferPassword] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);
    const [transferring, setTransferring] = useState(false);

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [transferError, setTransferError] = useState("");
    const [transferSuccess, setTransferSuccess] = useState("");

    const [showTransferConfirm, setShowTransferConfirm] = useState(false);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    // Change password
    const handleChangePassword = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword) {
            setPasswordError("Enter your current password.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                "New passwords do not match."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                "New password must be different from your current password."
            );
            return;
        }

        setChangingPassword(true);

        try {
            /*
             * First verify the current password.
             */
            const { error: verifyError } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword,
                });

            if (verifyError) {
                throw new Error("Current password is incorrect.");
            }

            /*
             * Update password.
             */
            const { error } =
                await supabase.auth.updateUser({
                    password: newPassword,
                });

            if (error) {
                throw error;
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setPasswordSuccess(
                "Your password has been changed successfully."
            );
        } catch (err: unknown) {
            const message =
                err &&
                    typeof err === "object" &&
                    "message" in err
                    ? String(
                        (err as { message: unknown }).message
                    )
                    : "Unable to change password.";

            setPasswordError(message);
        } finally {
            setChangingPassword(false);
        }
    };

    // Open transfer confirmation
    const handleTransferStart = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setTransferError("");
        setTransferSuccess("");

        if (!transferEmail.trim()) {
            setTransferError(
                "Enter the new owner's email address."
            );
            return;
        }

        if (
            transferEmail.trim().toLowerCase() ===
            user.email.toLowerCase()
        ) {
            setTransferError(
                "The new email must be different from your current email."
            );
            return;
        }

        if (!transferPassword) {
            setTransferError(
                "Enter your current password to continue."
            );
            return;
        }

        setShowTransferConfirm(true);
    };

    // Transfer account
    const handleTransferAccount = async () => {
        setShowTransferConfirm(false);
        setTransferring(true);
        setTransferError("");
        setTransferSuccess("");

        try {
            /*
             * Verify the current password before
             * allowing the transfer.
             */
            const { error: verifyError } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: transferPassword,
                });

            if (verifyError) {
                throw new Error(
                    "Current password is incorrect."
                );
            }

            /*
             * Change the email of the existing
             * Supabase account.
             *
             * The user UUID stays the same, so
             * comments, watchlist, profile, etc.
             * remain attached to the account.
             */
            const { error } =
                await supabase.auth.updateUser({
                    email: transferEmail.trim().toLowerCase(),
                });

            if (error) {
                throw error;
            }

            setTransferPassword("");

            setTransferSuccess(
                `A confirmation email has been sent to ${transferEmail.trim().toLowerCase()}. The account transfer will complete after the email change is confirmed.`
            );
        } catch (err: unknown) {
            const message =
                err &&
                    typeof err === "object" &&
                    "message" in err
                    ? String(
                        (err as { message: unknown }).message
                    )
                    : "Unable to transfer the account.";

            setTransferError(message);
        } finally {
            setTransferring(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-[10px] text-brand-red uppercase tracking-widest">
                        Account
                    </p>

                    <h1 className="font-heading text-3xl text-white mt-1">
                        Account Settings
                    </h1>

                    <p className="text-gray text-sm mt-1">
                        Manage your account security and ownership.
                    </p>
                </div>

                <Link
                    href="/portal"
                    className="text-sm text-gray hover:text-white transition-colors"
                >
                    ← Back to Portal
                </Link>
            </div>

            {/* Security */}
            <section className="bg-black/60 border border-white/8 rounded-2xl overflow-hidden">

                <div className="px-6 py-5 border-b border-white/10">
                    <p className="font-mono text-[10px] text-brand-red uppercase tracking-widest">
                        Security
                    </p>

                    <h2 className="font-heading text-xl text-white mt-1">
                        Change Password
                    </h2>

                    <p className="text-gray text-sm mt-1">
                        Update the password used to sign in to your account.
                    </p>
                </div>

                <form
                    onSubmit={handleChangePassword}
                    className="p-6 space-y-5"
                >

                    {/* Current Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="current-password"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Current Password
                        </label>

                        <div className="relative">
                            <input
                                id="current-password"
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className="w-full bg-black/40 border border-white/10
                           rounded-xl px-4 py-3 pr-12
                           text-white text-sm
                           focus:outline-none
                           focus:border-brand-red/50"
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        (v) => !v
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-gray hover:text-white"
                            >
                                {showCurrentPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="new-password"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                id="new-password"
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                className="w-full bg-black/40 border border-white/10
                           rounded-xl px-4 py-3 pr-12
                           text-white text-sm
                           focus:outline-none
                           focus:border-brand-red/50"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(
                                        (v) => !v
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-gray hover:text-white"
                            >
                                {showNewPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <p className="font-mono text-[10px] text-gray/40">
                            Use at least 8 characters.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="confirm-password"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Confirm New Password
                        </label>

                        <div className="relative">
                            <input
                                id="confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                className="w-full bg-black/40 border border-white/10
                           rounded-xl px-4 py-3 pr-12
                           text-white text-sm
                           focus:outline-none
                           focus:border-brand-red/50"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (v) => !v
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-gray hover:text-white"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {passwordError && (
                        <div className="bg-brand-red/10 border border-brand-red/30
                            rounded-xl px-4 py-3">
                            <p className="text-brand-red text-sm">
                                {passwordError}
                            </p>
                        </div>
                    )}

                    {/* Success */}
                    {passwordSuccess && (
                        <div className="bg-emerald-500/10
                            border border-emerald-500/30
                            rounded-xl px-4 py-3">
                            <p className="text-emerald-400 text-sm">
                                ✓ {passwordSuccess}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-brand-red hover:bg-brand-red-dark
                         disabled:opacity-50
                         text-white font-semibold
                         px-6 py-3 rounded-xl
                         transition-all"
                        >
                            {changingPassword
                                ? "Changing..."
                                : "Change Password"}
                        </button>
                    </div>

                </form>
            </section>

            {/* Transfer Account */}
            <section className="bg-black/60 border border-red-500/20
                          rounded-2xl overflow-hidden">

                <div className="px-6 py-5 border-b border-white/10">
                    <p className="font-mono text-[10px] text-brand-red uppercase tracking-widest">
                        Ownership
                    </p>

                    <h2 className="font-heading text-xl text-white mt-1">
                        Transfer Account
                    </h2>

                    <p className="text-gray text-sm mt-1">
                        Transfer control of this account to another person.
                    </p>
                </div>

                <form
                    onSubmit={handleTransferStart}
                    className="p-6 space-y-5"
                >

                    {/* Warning */}
                    <div className="bg-brand-red/10
                          border border-brand-red/30
                          rounded-xl p-4">

                        <p className="text-brand-red font-semibold text-sm">
                            ⚠ Account transfer
                        </p>

                        <p className="text-gray text-sm leading-relaxed mt-2">
                            This transfers ownership of your account.
                            Your comments, replies, watchlist, profile,
                            and account history remain attached to the
                            same account.
                        </p>

                    </div>

                    {/* New owner's email */}
                    <div className="space-y-2">
                        <label
                            htmlFor="transfer-email"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            New Owner's Email
                        </label>

                        <input
                            id="transfer-email"
                            type="email"
                            value={transferEmail}
                            onChange={(e) =>
                                setTransferEmail(e.target.value)
                            }
                            placeholder="newowner@example.com"
                            autoComplete="email"
                            required
                            className="w-full bg-black/40
                         border border-white/10
                         rounded-xl px-4 py-3
                         text-white text-sm
                         placeholder-gray/30
                         focus:outline-none
                         focus:border-brand-red/50"
                        />
                    </div>

                    {/* Current password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="transfer-password"
                            className="font-mono text-[11px] text-gray/70 tracking-widest uppercase"
                        >
                            Your Current Password
                        </label>

                        <div className="relative">
                            <input
                                id="transfer-password"
                                type={
                                    showTransferPassword
                                        ? "text"
                                        : "password"
                                }
                                value={transferPassword}
                                onChange={(e) =>
                                    setTransferPassword(
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full bg-black/40
                           border border-white/10
                           rounded-xl px-4 py-3 pr-16
                           text-white text-sm
                           focus:outline-none
                           focus:border-brand-red/50"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTransferPassword(
                                        (v) => !v
                                    )
                                }
                                className="absolute right-4 top-1/2
                           -translate-y-1/2
                           text-gray hover:text-white"
                            >
                                {showTransferPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Transfer error */}
                    {transferError && (
                        <div className="bg-brand-red/10
                            border border-brand-red/30
                            rounded-xl px-4 py-3">
                            <p className="text-brand-red text-sm">
                                {transferError}
                            </p>
                        </div>
                    )}

                    {/* Transfer success */}
                    {transferSuccess && (
                        <div className="bg-emerald-500/10
                            border border-emerald-500/30
                            rounded-xl px-4 py-3">
                            <p className="text-emerald-400 text-sm leading-relaxed">
                                ✓ {transferSuccess}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={transferring}
                            className="bg-brand-red hover:bg-brand-red-dark
                         disabled:opacity-50
                         text-white font-semibold
                         px-6 py-3 rounded-xl
                         transition-all"
                        >
                            {transferring
                                ? "Transferring..."
                                : "Transfer Account"}
                        </button>
                    </div>

                </form>
            </section>

            {/* Confirmation Modal */}
            {showTransferConfirm && (
                <div className="fixed inset-0 z-[200]
                        flex items-center justify-center
                        bg-black/80 backdrop-blur-sm
                        px-4">

                    <div className="w-full max-w-md
                          bg-[#0a0a0a]
                          border border-white/10
                          rounded-2xl
                          shadow-2xl
                          p-6">

                        <div className="w-12 h-12 rounded-full
                            bg-brand-red/10
                            border border-brand-red/30
                            flex items-center justify-center
                            text-brand-red text-xl">
                            !
                        </div>

                        <h3 className="font-heading text-xl text-white mt-5">
                            Transfer this account?
                        </h3>

                        <p className="text-gray text-sm leading-relaxed mt-3">
                            You are about to transfer this account to:
                        </p>

                        <p className="text-white font-mono text-sm mt-2 break-all">
                            {transferEmail}
                        </p>

                        <p className="text-gray text-sm leading-relaxed mt-4">
                            Your comments, replies, watchlist, profile,
                            and account history will remain on this account.
                            The new owner will gain control after the
                            email change is confirmed.
                        </p>

                        <div className="flex gap-3 mt-6">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTransferConfirm(false)
                                }
                                className="flex-1 border border-white/10
                           text-white/70 hover:text-white
                           hover:bg-white/5
                           py-3 rounded-xl
                           transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleTransferAccount}
                                className="flex-1 bg-brand-red
                           hover:bg-brand-red-dark
                           text-white font-semibold
                           py-3 rounded-xl
                           transition-colors"
                            >
                                Confirm Transfer
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}