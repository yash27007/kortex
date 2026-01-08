import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Start your personalized AI learning journey</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-amber-600 hover:bg-amber-700 text-sm normal-case",
              card: "bg-gray-800/50 backdrop-blur-xl border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
              formFieldLabel: "text-gray-300",
              formFieldInput:
                "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500",
              footerActionLink: "text-amber-400 hover:text-amber-300",
              identityPreviewEditButton: "text-amber-400",
            },
          }}
        />
      </div>
    </div>
  );
}
