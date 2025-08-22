import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(values.email);
      setEmailSent(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions."
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="forgot-password-page">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center" data-testid="link-home">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-xl"></i>
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">Daresni</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900" data-testid="title-forgot-password">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {emailSent 
              ? "We've sent you a reset link!" 
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {/* Form or Success Message */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {emailSent ? (
              <div className="text-center space-y-4" data-testid="email-sent-message">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <i className="fas fa-envelope text-green-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-gray-600 text-sm">
                    We've sent a password reset link to your email address. 
                    Click the link in the email to reset your password.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      form.reset();
                    }}
                    className="w-full mb-3"
                    data-testid="button-send-another"
                  >
                    Send another email
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full" data-testid="button-back-to-login">
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-forgot-password">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-reset-password"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Back to Login */}
            {!emailSent && (
              <div className="mt-6 text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-primary-600 hover:text-primary-500"
                  data-testid="link-back-to-login"
                >
                  ← Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Need help?</h3>
              <p className="text-xs text-blue-700 mb-3">
                If you don't receive an email within a few minutes, check your spam folder 
                or try again with a different email address.
              </p>
              <Link 
                href="/contact" 
                className="text-xs text-blue-600 hover:text-blue-500 underline"
                data-testid="link-contact-support"
              >
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
