"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { createMailTmAccount, getAvailableDomains, loginMailTm, type Domain } from "@/lib/mail-tm/client"

const registerSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only contain letters, numbers, underscores, and hyphens.",
    }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

interface AuthFormProps {
  type: "login" | "register"
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [domains, setDomains] = React.useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = React.useState<Domain | null>(null)

  React.useEffect(() => {
    async function fetchDomains() {
      try {
        const availableDomains = await getAvailableDomains()
        setDomains(availableDomains)
        if (availableDomains.length > 0) {
          setSelectedDomain(availableDomains[0])
        }
      } catch (error) {
        console.error("Failed to fetch domains:", error)
        toast.error("Failed to fetch available domains")
      }
    }

    if (type === "register") {
      fetchDomains()
    }
  }, [type])

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onRegister(values: z.infer<typeof registerSchema>) {
    try {
      setIsLoading(true)

      if (!selectedDomain) {
        throw new Error("No domain selected")
      }

      const email = `${values.username}@${selectedDomain.domain}`

      // Create Mail.tm account first
      let mailTmAccount
      try {
        mailTmAccount = await createMailTmAccount(values.username, values.password, selectedDomain.domain)
        console.log("Mail.tm account created:", mailTmAccount)
      } catch (error) {
        console.error("Mail.tm account creation failed:", error)
        throw new Error(error instanceof Error ? error.message : "Failed to create Mail.tm account")
      }

      // Create Supabase account with the full email address
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error("Supabase auth error:", authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("No user data returned from Supabase")
      }

      // Store Mail.tm account details in Supabase
      const { error: dbError } = await supabase.from("email_accounts").insert({
        user_id: authData.user.id,
        mail_tm_id: mailTmAccount.id,
        email_address: email,
      })

      if (dbError) {
        console.error("Supabase DB error:", dbError)
        throw new Error(dbError.message)
      }

      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true)

      // First, try to login to Mail.tm
      try {
        const mailTmLoginData = await loginMailTm(values.email, values.password)
        console.log("Mail.tm login successful:", mailTmLoginData)
      } catch (error) {
        console.error("Mail.tm login failed:", error)
        throw new Error("Invalid email or password")
      }

      // If Mail.tm login is successful, proceed with Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        console.error("Supabase login error:", error)
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error("No user data returned from Supabase")
      }

      toast.success("Logged in successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  if (type === "register") {
    return (
      <Form {...registerForm}>
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
          <FormField
            control={registerForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="username" {...field} />
                    {selectedDomain && (
                      <span className="text-muted-foreground whitespace-nowrap">@{selectedDomain.domain}</span>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    )
  }

  return (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  )
}
