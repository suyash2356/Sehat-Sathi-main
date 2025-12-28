'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ShieldAlert, Trash2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import { ExternalLink, FileText } from 'lucide-react';

interface Doctor {
    uid: string;
    name: string;
    email: string;
    phoneNumber?: string;
    specialization?: string;
    licenseNumber?: string;
    isVerified: boolean;
    hospitalName?: string;
    licenseDocumentUrl?: string;
    idProofUrl?: string;
    verificationLevel?: number;
}

export default function AdminDashboard() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: authLoading } = useUser();

    // Protect Route - Custom Claims Check
    useEffect(() => {
        const checkAdminClaim = async () => {
            if (!authLoading && user) {
                // IMMEDIATE ALLOW: Hardcoded admin email check for robustness
                if (user.email === 'admin@sehatsathi.com') {
                    return; // Authorized by email whitelist
                }

                // Force refresh token to get latest claims
                const token = await user.getIdTokenResult(true);

                if (token.claims.isAdmin) {
                    // Fully authorized via custom claim
                    return;
                }

                // Not authorized
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "You are not authorized to view this page.",
                });
                router.push('/');
            } else if (!authLoading && !user) {
                router.push('/admin/login');
            }
        };

        checkAdminClaim();
    }, [user, authLoading, router, toast]);

    useEffect(() => {
        const verifyAndFetch = async () => {
            if (user) {
                // Allow fetch if email matches whitelist OR claim is present
                if (user.email === 'admin@sehatsathi.com') {
                    fetchPendingDoctors();
                    return;
                }

                const token = await user.getIdTokenResult();
                if (token.claims.isAdmin) {
                    fetchPendingDoctors();
                } else {
                    // Not authorized to fetch, stop loading
                    setLoading(false);
                }
            }
        };
        verifyAndFetch();
    }, [user]);

    const fetchPendingDoctors = async () => {
        try {
            setLoading(true);
            const doctorsRef = collection(db, 'doctors');
            const q = query(doctorsRef, where('isVerified', '==', false));
            const querySnapshot = await getDocs(q);

            const docs: Doctor[] = [];
            querySnapshot.forEach((doc) => {
                // We assume doc.id is the doctor's UID
                docs.push({ uid: doc.id, ...doc.data() } as Doctor);
            });

            setDoctors(docs);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch pending doctors.",
            });
        } finally {
            setLoading(false);
        }
    };

    const approveDoctor = async (doctorId: string) => {
        try {
            const doctorRef = doc(db, 'doctors', doctorId);
            await updateDoc(doctorRef, {
                isVerified: true,
                verificationLevel: 3 // Level 3: Fully Verified
            });

            toast({
                title: "Success",
                description: "Doctor verified successfully.",
            });

            setDoctors(prev => prev.filter(d => d.uid !== doctorId));
        } catch (error) {
            console.error("Error approving doctor:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to verify doctor.",
            });
        }
    };

    const rejectDoctor = async (doctorId: string) => {
        if (!confirm("Are you sure you want to REJECT this doctor application? They will be notified.")) return;

        try {
            const doctorRef = doc(db, 'doctors', doctorId);
            await updateDoc(doctorRef, {
                isVerified: false,
                verificationStatus: 'rejected',
                rejectedAt: new Date().toISOString()
            });

            toast({
                title: "Application Rejected",
                description: "Doctor status updated to rejected.",
            });

            setDoctors(prev => prev.filter(d => d.uid !== doctorId));
        } catch (error) {
            console.error("Error rejecting doctor:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to reject doctor.",
            });
        }
    };

    const handleLogout = async () => {
        // Sign out both client and clear any local state just in case
        try {
            await auth.signOut();
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Double check render protection
    if (!user) return null;

    // Optional: If you want to restrict by email strictly here as well
    // if (user.email !== 'admin@sehatsathi.com') return <div>Access Denied</div>;

    return (
        <div className="container mx-auto py-10">
            <Card className="w-full max-w-4xl mx-auto shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-primary" />
                            Admin Dashboard
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Review and verify doctor registrations.
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <p>Loading pending requests...</p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50/50">
                            <div className="mx-auto bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                <Check className="h-6 w-6 text-gray-400" />
                            </div>
                            <p>No pending verification requests.</p>
                            <p className="text-sm mt-1">All doctors are verified.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {doctors.map((doctor) => (
                                <Card key={doctor.uid} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{doctor.name || 'Unknown Name'}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">Pending Verification</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
                                            <p><span className="font-medium text-foreground">Email:</span> {doctor.email}</p>
                                            <p><span className="font-medium text-foreground">Phone:</span> {doctor.phoneNumber || 'Not Provided'}</p>
                                            <p><span className="font-medium text-foreground">License ID:</span> {doctor.licenseNumber || 'Not Provided'}</p>
                                            <p><span className="font-medium text-foreground">Specialization:</span> {doctor.specialization || 'Not Provided'}</p>
                                            <p><span className="font-medium text-foreground">Hospital:</span> {doctor.hospitalName || 'Not Provided'}</p>
                                            <p><span className="font-medium text-foreground">Level:</span> {doctor.verificationLevel || 2}</p>

                                            <div className="flex flex-wrap gap-4 mt-3">
                                                {doctor.licenseDocumentUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <a href={doctor.licenseDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                                                            View License
                                                        </a>
                                                    </div>
                                                )}
                                                {doctor.idProofUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <ShieldAlert className="h-4 w-4 text-primary" />
                                                        <a href={doctor.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                                                            View ID Proof
                                                        </a>
                                                    </div>
                                                )}
                                                {doctor.licenseNumber && (
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                                        <a
                                                            href={`https://www.nmc.org.in/information-desk/indian-medical-register/`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm font-medium"
                                                        >
                                                            Verify on NMC Registry
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        <Button
                                            onClick={() => approveDoctor(doctor.uid)}
                                            className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Verify
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => rejectDoctor(doctor.uid)}
                                            className="flex-1 md:flex-none"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
