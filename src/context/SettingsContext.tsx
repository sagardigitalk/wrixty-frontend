"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { fetchSettings } from "../services/settingService";

interface Settings {
  appName: string;
  appLogo: string;
  appIcon: string;
}

interface SettingsContextType {
  settings: Settings;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  appName: "CRM",
  appLogo: "",
  appIcon: "Spa"
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  refreshSettings: async () => {},
  isLoading: true
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      if (data) {
        setSettings({
          appName: data.appName || "CRM",
          appLogo: data.appLogo || "",
          appIcon: data.appIcon || "Spa"
        });
      }
    } catch (error) {
      console.error("Failed to load global settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Dynamically update document title
    if (settings.appName) {
      document.title = settings.appName;
    }
    
    // Dynamically update favicon
    if (settings.appLogo) {
      // Find all existing icon links and update their href instead of removing them.
      // Removing elements managed by Next.js/React causes unmount errors.
      const existingIcons = document.querySelectorAll("link[rel~='icon']");
      
      if (existingIcons.length > 0) {
        existingIcons.forEach(icon => {
          (icon as HTMLLinkElement).href = settings.appLogo;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = settings.appLogo;
        document.head.appendChild(link);
      }
    }
  }, [settings, pathname]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: loadSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
