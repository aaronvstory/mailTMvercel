import Image from "next/image"

export function EmailLayout() {
  return (
    <div className="flex-1 overflow-auto bg-muted/10">
      <div className="flex h-full flex-col items-center justify-center p-8">
        <Image
          src="https://sjc.microlink.io/4gsdtnZbhv7LCTWu3o4k6YNy-dqP8yVRYr-UVNRrQMEB6EscVr-3EKRva9tzRu2Wbq_SIcLkwH20E38h5nsvqw.jpeg"
          alt="Empty state illustration"
          width={200}
          height={200}
          className="mb-8"
        />
        <h2 className="text-2xl font-semibold tracking-tight">Temp Mail</h2>
        <p className="text-center text-muted-foreground max-w-[600px] mt-4">
          Protect your personal email address from spam, bots, phishing, and other online abuse with our free temporary
          disposable anonymous email service. No commitments, no risks—just secure, instant access to a temp email
          address.
        </p>
      </div>
    </div>
  )
}
