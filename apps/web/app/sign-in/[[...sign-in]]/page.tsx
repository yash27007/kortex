import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to continue your learning journey</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-violet-600 hover:bg-violet-700 text-sm normal-case",
              card: "bg-gray-800/50 backdrop-blur-xl border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton:
                "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
              formFieldLabel: "text-gray-300",
              formFieldInput:
                "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500",
              footerActionLink: "text-violet-400 hover:text-violet-300",
              identityPreviewEditButton: "text-violet-400",
            },
          }}
        />
      </div>
    </div>
  );
}
