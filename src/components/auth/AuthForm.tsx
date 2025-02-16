import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, UserMetadata } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface AuthFormData extends UserMetadata {
  email: string;
  password: string;
}

const TIMEZONES = [
  { value: "Etc/GMT+12", label: "UTC -12 Baker Island, Howland Island" },
  { value: "Etc/GMT+11", label: "UTC -11 American Samoa, Niue" },
  { value: "Etc/GMT+10", label: "UTC -10 Hawaii, French Polynesia" },
  { value: "Etc/GMT+9", label: "UTC -9 Alaska" },
  { value: "Etc/GMT+8", label: "UTC -8 Pacific Time (US & Canada)" },
  { value: "Etc/GMT+7", label: "UTC -7 Mountain Time (US & Canada)" },
  { value: "Etc/GMT+6", label: "UTC -6 Central Time (US & Canada)" },
  { value: "Etc/GMT+5", label: "UTC -5 Eastern Time (US & Canada)" },
  { value: "Etc/GMT+4", label: "UTC -4 Atlantic Time (Canada)" },
  { value: "Etc/GMT+3", label: "UTC -3 Buenos Aires, Sao Paulo" },
  { value: "Etc/GMT+2", label: "UTC -2 Fernando de Noronha" },
  { value: "Etc/GMT+1", label: "UTC -1 Cape Verde Islands" },
  { value: "Etc/GMT+0", label: "UTC +0 London, Dublin, Lisbon" },
  { value: "Etc/GMT-1", label: "UTC +1 Berlin, Paris, Rome" },
  { value: "Etc/GMT-2", label: "UTC +2 Cairo, Jerusalem, Athens" },
  { value: "Etc/GMT-3", label: "UTC +3 Moscow, Baghdad, Kuwait" },
  { value: "Etc/GMT-4", label: "UTC +4 Dubai, Baku, Tbilisi" },
  { value: "Etc/GMT-5", label: "UTC +5 Karachi, Tashkent" },
  { value: "Etc/GMT-6", label: "UTC +6 Dhaka, Almaty" },
  { value: "Etc/GMT-7", label: "UTC +7 Bangkok, Hanoi, Jakarta" },
  { value: "Etc/GMT-8", label: "UTC +8 Singapore, Hong Kong, Taipei" },
  { value: "Etc/GMT-9", label: "UTC +9 Tokyo, Seoul, Osaka" },
  { value: "Etc/GMT-10", label: "UTC +10 Sydney, Melbourne, Brisbane" },
  { value: "Etc/GMT-11", label: "UTC +11 Solomon Islands, New Caledonia" },
  { value: "Etc/GMT-12", label: "UTC +12 Auckland, Wellington, Fiji" },
];

export function AuthForm() {
  console.log("AuthForm rendering");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const form = useForm<AuthFormData>();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: AuthFormData) => {
    try {
      setError("");
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          data.email,
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          },
        );
        if (error) throw error;
        alert("Check your email for the password reset link");
        setIsResetPassword(false);
        return;
      }

      if (isSignUp) {
        const { email, password, ...metadata } = data;
        await signUp(email, password, metadata);
        navigate("/auth/success");
        return;
      } else {
        await signIn(data.email, data.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isResetPassword
              ? "Reset Password"
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </h2>
          {!isResetPassword && (
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp
                ? "Create your account to get started"
                : "Welcome back! Please sign in to continue"}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2"
              required
            />

            {!isResetPassword && (
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2"
                required
              />
            )}

            {isSignUp && (
              <>
                <Input
                  {...register("username")}
                  placeholder="Username"
                  className="w-full px-4 py-2"
                  required
                />
                <Input
                  {...register("displayName")}
                  placeholder="Display Name"
                  className="w-full px-4 py-2"
                  required
                />
                <div className="space-y-2">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { ref, ...field } }) => (
                      <PhoneInput
                        {...field}
                        country="us"
                        enableSearch
                        inputClass="!w-full !h-10 !text-base !px-4 !py-2 !border-input !bg-background"
                        buttonClass="!border-input !bg-background"
                        containerClass="!w-full"
                        searchClass="!w-full"
                        dropdownClass="!bg-background !border-input"
                      />
                    )}
                  />
                </div>
                <Select
                  onValueChange={(value) => setValue("timezone", value)}
                  defaultValue={watch("timezone")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isResetPassword
              ? "Send Reset Link"
              : isSignUp
                ? "Sign Up"
                : "Sign In"}
          </Button>
        </form>

        <div className="space-y-2">
          {!isSignUp && !isResetPassword && (
            <button
              type="button"
              onClick={() => setIsResetPassword(true)}
              className="text-sm text-primary hover:underline w-full text-center"
            >
              Forgot your password?
            </button>
          )}

          <p className="text-center text-sm text-gray-600">
            {isResetPassword ? (
              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="text-primary hover:underline"
              >
                Back to sign in
              </button>
            ) : (
              <>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
}
