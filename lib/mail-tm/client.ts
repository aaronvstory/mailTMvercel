const MAIL_TM_API = "https://api.mail.tm"

export interface Domain {
  id: string
  domain: string
  isActive: boolean
  isPrivate: boolean
}

export interface MailTmAccount {
  id: string
  address: string
  quota: number
  used: number
  isDisabled: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface MailTmError {
  type: string
  title: string
  detail: string
  "hydra:description"?: string
}

export async function getAvailableDomains(): Promise<Domain[]> {
  try {
    const response = await fetch(`${MAIL_TM_API}/domains`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error["hydra:description"] || "Failed to fetch available domains")
    }
    const data = await response.json()
    return data["hydra:member"]
  } catch (error) {
    console.error("Error fetching domains:", error)
    throw error
  }
}

export async function createMailTmAccount(username: string, password: string, domain: string) {
  try {
    const response = await fetch(`${MAIL_TM_API}/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: `${username}@${domain}`,
        password: password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data["hydra:description"] || data.message || "Failed to create account")
    }

    return data
  } catch (error) {
    console.error("Error creating Mail.tm account:", error)
    throw error
  }
}

export async function loginMailTm(address: string, password: string) {
  try {
    const response = await fetch(`${MAIL_TM_API}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data["hydra:description"] || data.message || "Failed to login")
    }

    return data
  } catch (error) {
    console.error("Error logging in to Mail.tm:", error)
    throw error
  }
}
