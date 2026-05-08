import { Suspense } from "react";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <main className=" items-center justify-center bg-brand-canvas px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-card bg-white p-8 text-center text-sm text-slate-600 shadow-card">
            Loading sign-up...
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </main>
  );
}
