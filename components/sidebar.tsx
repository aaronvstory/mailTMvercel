"use client"

import { Mail, RefreshCcw, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AccountSwitcher } from "@/components/account-switcher"
import { Logo } from "@/components/logo"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

export function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    }
  }

  return (
    <div className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <Logo />
        </div>
        <div className="px-4 py-2">
          <AccountSwitcher />
        </div>

        <nav className="space-y-1 px-2">
          <Button variant="ghost" className="w-full justify-start">
            <Mail className="mr-2 h-4 w-4" />
            Inbox
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </nav>

        <div className="mt-4 px-4 py-2">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Support us by disabling ad blockers on our site 🙏</p>
          </div>
        </div>

        <div className="mt-auto p-4">
          <nav className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
