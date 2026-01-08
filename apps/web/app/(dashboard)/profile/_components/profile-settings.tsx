"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HiBell, HiEnvelope, HiMoon, HiGlobeAlt } from "react-icons/hi2";
import { useTRPC, useMutation } from "@/server/trpc/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProfileSettings() {
  const api = useTRPC();
  const [settings, setSettings] = useState({
    studyReminders: true,
    weeklyDigest: true,
    courseUpdates: true,
    darkMode: true,
    language: "en",
  });

  const updatePreferences = useMutation(api.user.updateEmailPreferences.mutationOptions({
    onSuccess: () => {
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  }));

  const handleToggle = (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    };
    setSettings(newSettings);

    // Update on server if email preference
    if (["studyReminders", "weeklyDigest", "courseUpdates"].includes(key)) {
      updatePreferences.mutate({
        [key]: newSettings[key as keyof typeof newSettings],
      });
    }
  };

  const settingsSections = [
    {
      title: "Notifications",
      icon: HiBell,
      items: [
        {
          key: "studyReminders",
          label: "Study Reminders",
          description: "Daily reminders to keep your streak alive",
        },
        {
          key: "weeklyDigest",
          label: "Weekly Digest",
          description: "Summary of your learning progress each week",
        },
        {
          key: "courseUpdates",
          label: "Course Updates",
          description: "Notifications about new lessons and content",
        },
      ],
    },
    {
      title: "Appearance",
      icon: HiMoon,
      items: [
        {
          key: "darkMode",
          label: "Dark Mode",
          description: "Use dark theme (recommended)",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {settingsSections.map((section) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <section.icon className="w-5 h-5 text-amber-400" />
            {section.title}
          </h3>

          <div className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">{item.label}</div>
                  <div className="text-sm text-slate-400">{item.description}</div>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
      >
        <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
          <div>
            <div className="font-medium text-white">Delete Account</div>
            <div className="text-sm text-slate-400">
              Permanently delete your account and all data
            </div>
          </div>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}





