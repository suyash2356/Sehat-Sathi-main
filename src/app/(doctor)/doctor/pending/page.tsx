'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-firebase";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PendingApprovalPage() {
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await auth?.signOut(); // Firebase
        await supabase.auth.signOut(); // Supabase
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl text-yellow-800">Account Under Review</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your profile is currently pending verification by our administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <p className="text-muted-foreground">
                        We are verifying your medical license and documents. This process usually takes 24-48 hours.
                        You will not be able to access the dashboard until your account is approved.
                    </p>
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
