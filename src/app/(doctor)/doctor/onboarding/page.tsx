'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/hooks/use-firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { uploadToSupabase, supabase } from "@/lib/supabase"; // Reuse helper
import { useState, useEffect } from "react";
import { FileUp, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUser } from "@/hooks/use-user"; // Sync hook

const formSchema = z.object({
    licenseNumber: z.string().min(4, "Medical License Number is required."),
    specialization: z.string().min(2, "Specialization is required."),
    hospitalName: z.string().min(2, "Hospital/Clinic name is required."),
    phoneNumber: z.string().min(10, "Valid phone number is required."), // Collect again or pre-fill
});

export default function DoctorOnboardingPage() {
    const { user, loading: authLoading } = useUser(); // Ensures Firebase Sync
    const db = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idProofFile, setIdProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            licenseNumber: "",
            specialization: "",
            hospitalName: "",
            phoneNumber: "",
        },
    });

    // Pre-fill phone if available in connection
    // (We'll skip complex pre-fill for now to ensure robustness)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user || !db) {
            toast({ title: "Session Invalid", description: "Please login again.", variant: "destructive" });
            return;
        }

        try {
            if (!licenseFile || !idProofFile) {
                toast({ title: "Documents Required", description: "Please upload both your medical license and ID proof.", variant: "destructive" });
                return;
            }

            setUploading(true);

            // Upload Files
            let licenseUrl = "";
            let idProofUrl = "";
            try {
                const fileExt = licenseFile.name.split('.').pop();
                const idExt = idProofFile.name.split('.').pop();
                const timestamp = Date.now();
                // Unique names
                const licenseFileName = `${user.uid}-license-${timestamp}.${fileExt}`;
                const idProofFileName = `${user.uid}-idproof-${timestamp}.${idExt}`;

                licenseUrl = await uploadToSupabase(licenseFile, `doctor-licenses/${licenseFileName}`, 'uploads');
                idProofUrl = await uploadToSupabase(idProofFile, `doctor-ids/${idProofFileName}`, 'uploads');
            } catch (uploadError) {
                console.error("Supabase Upload Error:", uploadError);
                throw new Error("Failed to upload documents. Please try again.");
            }

            // Create/Update Doctor Document in Firestore
            await setDoc(doc(db, "doctors", user.uid), {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'Doctor', // Fallback name
                licenseNumber: values.licenseNumber,
                specialization: values.specialization,
                hospitalName: values.hospitalName,
                phoneNumber: values.phoneNumber,
                licenseDocumentUrl: licenseUrl,
                idProofUrl: idProofUrl,
                isVerified: false,       // CRITICAL: Set to false
                verificationLevel: 2,    // Level 2: Docs Uploaded
                isProfileComplete: true, // Mark profile as done
                authProvider: 'supabase',
                createdAt: new Date().toISOString(),
            }, { merge: true });

            toast({ title: "Profile Submitted", description: "Your details have been sent for verification." });
            router.push('/doctor/pending'); // Will be intercepted by Pending check if strictly enforced, or we can route to Pending page.

        } catch (error: any) {
            console.error("Onboarding Error:", error);
            toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    }

    if (authLoading) return <div className="flex justify-center p-10">Loading...</div>;
    if (!user) {
        router.push('/doctor/login');
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
            <Card className="w-full max-w-lg mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Complete Your Profile
                    </CardTitle>
                    <CardDescription>
                        We need a few more details to verify your medical credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="hospitalName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hospital / Clinic</FormLabel>
                                            <FormControl><Input placeholder="City Hospital" {...field} /></FormControl>
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
                                            <FormControl><Input placeholder="+91..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <FormLabel className="flex items-center gap-2 mb-2">
                                        <FileUp className="h-4 w-4 text-primary" />
                                        Medical Registration Certificate
                                    </FormLabel>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer file:bg-primary file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-primary/90"
                                        />
                                        {licenseFile && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    </div>
                                </div>

                                <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <FormLabel className="flex items-center gap-2 mb-2">
                                        <FileUp className="h-4 w-4 text-primary" />
                                        Identity Proof (Aadhar/Passport/PAN)
                                    </FormLabel>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer file:bg-primary file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-primary/90"
                                        />
                                        {idProofFile && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={form.formState.isSubmitting || uploading}>
                                {form.formState.isSubmitting || uploading ? "Submitting for Verification..." : "Submit Profile"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
