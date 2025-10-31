
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Existing Sonner
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"; // Existing Shadcn Toaster

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        Hustlr CRM © {new Date().getFullYear()} - Get that bread 🍞
      </footer>
      <ShadcnToaster />
      <SonnerToaster />
    </div>
  );
}
