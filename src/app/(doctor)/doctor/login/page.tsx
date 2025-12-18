'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function DoctorLoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
      router.push('/doctor/dashboard');

    } catch (error: any) {
      let errorMessage = "An unknown error occurred. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      }
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Link href="/" className="mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="Sehat Sathi" className="h-24 w-24 sm:h-32 sm:w-32 object-contain mb-4" />
        <h1 className="text-3xl font-bold font-headline text-primary">Sehat Sathi</h1>
        <p className="text-muted-foreground font-medium mt-1">Doctor Portal</p>
      </Link>
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Doctor Login</CardTitle>
          <CardDescription>Log in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="******" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging In..." : "Log In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/doctor/signup" className="underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
