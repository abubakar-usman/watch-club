import type { Metadata } from "next";
import ForgotPassword from "@/components/forgot-password";

export const metadata: Metadata = {
    title: "Forgot Password | Netflix Discussion",
    description: "Reset your Netflix Discussion account password.",
};

export default function ForgotPasswordPage() {
    return <ForgotPassword />;
}   