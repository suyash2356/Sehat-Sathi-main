'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            try {
                // Standard Firebase Login
                await signInWithEmailAndPassword(auth, email, password);

                toast({
                    title: "Login Successful",
                    description: "Redirecting to admin dashboard...",
                });
                router.push('/admin');
            } catch (error: any) {
                console.error("Login error:", error);

                let errorMessage = "Invalid email or password.";
                if (error.code === 'auth/invalid-credential') errorMessage = "Invalid credentials.";

                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: errorMessage,
                });
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="Sehat Sathi" className="h-24 w-24 object-contain" />
                    </div>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <ShieldAlert className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                    <CardDescription>
                        Restricted area. Please log in to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@sehatsathi.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Login to Dashboard"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
