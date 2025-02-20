import { Sidebar } from "@/components/sidebar"
import { EmailLayout } from "@/components/email-layout"

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <EmailLayout />
    </div>
  )
}
