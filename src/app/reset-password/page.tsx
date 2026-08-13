import type { Metadata } from "next";
import ResetPassword from "@/components/reset-password";

export const metadata: Metadata = {
    title: "Reset Password | Netflix Discussion",
    description: "Create a new password for your Netflix Discussion account.",
};

export default function ResetPasswordPage() {
    return <ResetPassword />;
}