"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { loginUser } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import { isAuthenticated } from "../../utils/authUtils";
import { useSettings } from "../../context/SettingsContext";
import { Spa } from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await loginUser({ email, password });
      localStorage.setItem("wrixty_authenticated", "true");
      localStorage.setItem("wrixty_token", user.token); // Save JWT token!
      localStorage.setItem("wrixty_authenticated_user", JSON.stringify({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      }));
      toast.success("Login Successful! Welcome back.");
      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Invalid email address or password. Please try again.";
      toast.error(errorMsg);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-teal/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary-cyan/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card-bg border border-border-ui p-10 rounded-lg shadow-soft text-center space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3">
              {settings.appLogo ? (
                <img src={settings.appLogo} alt="Logo" className="w-20 h-20 object-contain drop-shadow-md" />
              ) : (
                <Spa className="text-primary-teal w-12 h-12" />
              )}
              <span className="font-extrabold text-3xl tracking-wider text-gradient-primary font-sans">
                {settings.appName}
              </span>
            </div>
            <p className="text-sm text-text-secondary font-semibold tracking-wider uppercase">
              Sign In to Your Account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card-bg border-border-ui text-text-primary placeholder:text-text-secondary/50 focus:border-primary-teal"
            />

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card-bg border-border-ui text-text-primary placeholder:text-text-secondary/50 focus:border-primary-teal"
              />
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-bold text-primary-teal hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              className="py-3"
            >
              Sign In
            </Button>
          </form>

          
        </div>
      </div>
    </div>
  );
}
