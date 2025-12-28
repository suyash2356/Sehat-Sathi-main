'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/hooks/use-firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function DoctorLoginPage() {
  const auth = useAuth();
  const db = useFirestore();
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
      // 1. Login with SUPABASE
      const { data: { session }, error: sbError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (sbError) throw new Error(`Supabase Login Error: ${sbError.message}`);
      if (!session) throw new Error("No session returned.");

      // 2. Bridge to FIREBASE
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, role: 'doctor' })
      });
      const syncData = await syncRes.json();

      if (!syncRes.ok) throw new Error(syncData.error || 'Auth Sync Failed');

      // 3. Login to Firebase with Custom Token
      const { signInWithCustomToken } = await import("firebase/auth");
      const userCredential = await signInWithCustomToken(auth, syncData.firebaseToken);
      const user = userCredential.user;

      if (!db) throw new Error("Database connection unavailable");

      // 4. Check Doctor Profile Status
      const docRef = doc(db, "doctors", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast({ title: "Complete Registration", description: "Please complete your profile details." });
        router.push('/doctor/onboarding');
        return;
      }

      const doctorData = docSnap.data();

      if (doctorData.verificationStatus === 'rejected') {
        toast({
          variant: "destructive",
          title: "Application Rejected",
          description: "Your application has been rejected by the admin. Please contact support."
        });
        await auth.signOut();
        return;
      }

      if (!doctorData.isVerified) {
        toast({ title: "Account Under Review", description: "Your account is pending verification." });
        router.push('/doctor/pending');
        return;
      }

      toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
      router.push('/doctor/dashboard');

    } catch (error: any) {
      console.error(error);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
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
