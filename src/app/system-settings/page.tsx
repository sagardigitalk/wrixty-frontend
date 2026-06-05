"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { useSettings } from "../../context/SettingsContext";
import { updateSettings } from "../../services/settingService";
import { Spa, Save, CloudUpload } from "@mui/icons-material";

export default function SystemSettingsPage() {
  const toast = useToast();
  const { settings, refreshSettings } = useSettings();
  const [appName, setAppName] = useState("");
  const [appLogo, setAppLogo] = useState("");
  const [appLogoFile, setAppLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAppName(settings.appName);
    setAppLogo(settings.appLogo);
  }, [settings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAppLogoFile(file);
      setAppLogo(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (appLogoFile) {
        const formData = new FormData();
        formData.append("appName", appName);
        formData.append("appLogo", appLogoFile); // 'appLogo' is the key we use for upload.single('appLogo')
        await updateSettings(formData);
      } else {
        await updateSettings({ appName, appLogo });
      }
      await refreshSettings();
      toast.success("System settings updated successfully!");
      setAppLogoFile(null);
    } catch (err) {
      toast.error("Failed to update system settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">System Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure your global application logo and name.</p>
        </div>
        <Button onClick={handleSave} isLoading={loading} className="gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card-bg border border-border-ui rounded-xl shadow-soft p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary border-b border-border-ui pb-3">Basic Information</h2>
          
          <Input
            label="Application Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="e.g. CRM"
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-secondary">Application Logo (Optional)</label>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 border-2 border-dashed border-border-ui rounded-xl flex items-center justify-center bg-background shrink-0 overflow-hidden relative group">
                {appLogo ? (
                  <img src={appLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <Spa className="text-text-secondary/50 w-10 h-10" />
                )}
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <CloudUpload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              
              <div className="flex-1 space-y-2">
                <Input
                  label="Logo URL"
                  value={appLogo}
                  onChange={(e) => setAppLogo(e.target.value)}
                  placeholder="Paste image URL or upload file"
                />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Upload an image from your computer by hovering over the box, or directly paste an image URL. Recommended size: 200x200px transparent PNG.
                </p>
                {appLogoFile && <p className="text-xs text-primary-teal font-bold animate-pulse">Image selected. Don't forget to save!</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card-bg border border-border-ui rounded-xl shadow-soft p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary border-b border-border-ui pb-3">Live Preview</h2>
          <p className="text-xs text-text-secondary mb-4">This is how your application header and login screen will appear to users.</p>
          
          <div className="bg-background rounded-lg border border-border-ui p-6 flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col items-center gap-3">
              {appLogo ? (
                <img src={appLogo} alt="Logo" className="w-16 h-16 object-contain drop-shadow-md" />
              ) : (
                <Spa className="text-primary-teal w-10 h-10" />
              )}
              <span className="font-extrabold text-2xl tracking-wider text-gradient-primary font-sans">
                {appName || "Your App Name"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
