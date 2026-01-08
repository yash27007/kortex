"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { HiCog, HiArrowLeft, HiShieldCheck, HiGlobeAlt, HiBell, HiKey } from "react-icons/hi2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center">
            <HiCog className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
            <p className="text-slate-400">
              Configure platform-wide settings and preferences
            </p>
          </div>
        </div>
      </motion.header>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HiGlobeAlt className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-white">General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform-name" className="text-slate-300">
                Platform Name
              </Label>
              <Input
                id="platform-name"
                defaultValue="Kortex"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-url" className="text-slate-300">
                Platform URL
              </Label>
              <Input
                id="platform-url"
                type="url"
                defaultValue="https://kortex.ai"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email" className="text-slate-300">
                Support Email
              </Label>
              <Input
                id="support-email"
                type="email"
                defaultValue="support@kortex.ai"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Save General Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HiShieldCheck className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-white">Security Settings</CardTitle>
            </div>
            <CardDescription>Configure security and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Require Email Verification</Label>
                <p className="text-sm text-slate-500">
                  Users must verify their email before accessing courses
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Two-Factor Authentication</Label>
                <p className="text-sm text-slate-500">
                  Enable 2FA for admin accounts
                </p>
              </div>
              <Switch />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Session Timeout</Label>
                <p className="text-sm text-slate-500">
                  Automatically log out inactive users after 24 hours
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HiBell className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-white">Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure email and push notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Email Notifications</Label>
                <p className="text-sm text-slate-500">
                  Send email notifications for important events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Course Completion Emails</Label>
                <p className="text-sm text-slate-500">
                  Send emails when users complete courses
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Weekly Progress Reports</Label>
                <p className="text-sm text-slate-500">
                  Send weekly learning progress summaries
                </p>
              </div>
              <Switch />
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HiKey className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-white">API Configuration</CardTitle>
            </div>
            <CardDescription>Manage API keys and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-slate-300">
                OpenAI API Key
              </Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                className="bg-slate-800 border-white/10 text-white"
              />
              <p className="text-sm text-slate-500">
                Used for AI-powered course generation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-slate-300">
                Google Gemini API Key
              </Label>
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIza..."
                className="bg-slate-800 border-white/10 text-white"
              />
              <p className="text-sm text-slate-500">
                Used for AI-powered course generation
              </p>
            </div>

            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Save API Keys
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-950/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-red-400">Reset All Data</Label>
              <p className="text-sm text-slate-400">
                This will delete all users, courses, and progress data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="mt-2"
                onClick={() => {
                  if (confirm("Are you absolutely sure? This will delete ALL data.")) {
                    toast.error("This feature is not implemented yet");
                  }
                }}
              >
                Reset All Data
              </Button>
            </div>

            <Separator className="bg-red-500/20" />

            <div className="space-y-2">
              <Label className="text-red-400">Delete Platform</Label>
              <p className="text-sm text-slate-400">
                Permanently delete the entire platform. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="mt-2"
                onClick={() => {
                  if (confirm("Are you absolutely sure? This will DELETE EVERYTHING.")) {
                    toast.error("This feature is not implemented yet");
                  }
                }}
              >
                Delete Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




