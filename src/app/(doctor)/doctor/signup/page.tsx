'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";
import { useState } from "react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phoneNumber: z.string().min(10, "Valid phone number is required."),
});

export default function DoctorSignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // 1. Sign Up in SUPABASE
      const { data: { session, user: sbUser }, error: sbError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: 'doctor',
            phone_number: values.phoneNumber
          }
        }
      });

      if (sbError) throw new Error(`Supabase Signup Error: ${sbError.message}`);
      if (!sbUser) throw new Error("Account created but no user returned.");

      // 2. Check Session (Email Confirmation)
      if (!session) {
        toast({
          title: "Verify Your Email",
          description: "Please check your email to confirm your account. You will be able to complete your profile after logging in.",
          duration: 10000
        });
        router.push('/doctor/login');
        return;
      }

      // If we somehow have a session (auto-confirm enabled?), we redirect to login anyway to force the "Onboarding Check" flow
      // or we could redirect directly to onboarding if we handled the auth state sync here.
      // For consistency, let's send them to login or onboarding.
      toast({ title: "Account Created", description: "Registration successful! Please complete your profile." });
      router.push('/doctor/onboarding');

    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <Link href="/" className="mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="Sehat Sathi" className="h-24 w-24 sm:h-32 sm:w-32 object-contain mb-4" />
        <h1 className="text-3xl font-bold font-headline text-primary">Sehat Sathi</h1>
        <p className="text-muted-foreground font-medium mt-1">Doctor Registration</p>
      </Link>
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Create Doctor Account</CardTitle>
          <CardDescription>Get started by creating your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Dr. John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+91 9876543210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Next: Verify Email"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/doctor/login" className="underline">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
