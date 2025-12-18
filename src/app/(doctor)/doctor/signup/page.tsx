'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/hooks/use-firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  licenseNumber: z.string().min(4, "Medical License Number is required."),
  specialization: z.string().min(2, "Specialization is required."),
  hospitalName: z.string().min(2, "Hospital/Clinic name is required."),
  phoneNumber: z.string().min(10, "Valid phone number is required."),
});

export default function DoctorSignUpPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      licenseNumber: "",
      specialization: "",
      hospitalName: "",
      phoneNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !db) {
      toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create a document in the 'doctors' collection
      await setDoc(doc(db, "doctors", user.uid), {
        uid: user.uid,
        email: user.email,
        name: values.fullName,
        licenseNumber: values.licenseNumber,
        specialization: values.specialization,
        hospitalName: values.hospitalName,
        phoneNumber: values.phoneNumber,
        isVerified: false,
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Account Created", description: "Welcome! Please log in to continue." });
      router.push('/doctor/login');

    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please try another.";
      }
      toast({ title: "Sign Up Failed", description: errorMessage, variant: "destructive" });
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
          <CardDescription>Sign up to manage your schedule and consultations.</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical License No.</FormLabel>
                      <FormControl><Input placeholder="REG-123456" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl><Input placeholder="Cardiologist, General..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital / Clinic Name</FormLabel>
                    <FormControl><Input placeholder="City General Hospital" {...field} /></FormControl>
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
                {form.formState.isSubmitting ? "Creating Account..." : "Sign Up"}
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
