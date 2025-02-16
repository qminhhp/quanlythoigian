import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function SuccessSignup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We've sent you a confirmation link. Please check your email to
          activate your account.
        </p>
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/auth")}
        >
          Back to Sign In
        </Button>
      </Card>
    </div>
  );
}
