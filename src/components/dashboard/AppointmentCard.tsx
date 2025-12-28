import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, Phone, Video, MapPin, FileText } from "lucide-react";

interface Appointment {
    id: string;
    patientDetails: { name: string; age: number; gender: string; disease: string; };
    status: 'pending' | 'accepted' | 'rejected' | 'in_call' | 'completed';
    mode: 'video' | 'voice' | 'visit';
    timing: 'scheduled' | 'call_now';
    scheduledTime: any;
}

interface AppointmentCardProps {
    appointment: Appointment;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onStartCall?: (app: Appointment) => void;
    onComplete?: (id: string) => void;
    onPrescribe?: (app: Appointment) => void;
    showActions?: boolean;
}

export function AppointmentCard({ appointment: app, onAccept, onReject, onStartCall, onComplete, onPrescribe, showActions = true }: AppointmentCardProps) {

    // Helper to format date safely
    const formatDate = (time: any) => {
        if (!time) return 'N/A';
        if (time === 'call_now') return 'Immediate';
        if (typeof time === 'string') return time; // Already string 'call_now' or similar
        try {
            return time.toDate ? time.toDate().toLocaleString() : new Date(time).toLocaleString();
        } catch (e) {
            return String(time);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
            case 'accepted': return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
            case 'in_call': return 'bg-red-100 text-red-800 hover:bg-red-100/80 animate-pulse';
            case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-100/80';
            case 'rejected': return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'visit': return <MapPin className="h-4 w-4 mr-1" />;
            case 'voice': return <Phone className="h-4 w-4 mr-1" />;
            default: return <Video className="h-4 w-4 mr-1" />;
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{app.patientDetails.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            {getModeIcon(app.mode)}
                            {(app.mode || 'video').toUpperCase()}
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(app.status)}>
                        {app.status.toUpperCase().replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center"><User className="h-3 w-3 mr-2" /> {app.patientDetails.age} Y / {app.patientDetails.gender}</div>
                    <div className="flex items-center"><Clock className="h-3 w-3 mr-2" /> {app.timing === 'call_now' ? 'Now' : 'Scheduled'}</div>
                    <div className="col-span-2 flex items-center font-medium">
                        <Calendar className="h-3 w-3 mr-2" /> {formatDate(app.scheduledTime)}
                    </div>
                </div>

                <div className="p-2 bg-gray-50 rounded text-sm mb-4">
                    <span className="font-semibold text-gray-700">Reason:</span> {app.patientDetails.disease}
                </div>

                {showActions && (
                    <div className="flex gap-2 mt-auto">
                        {app.status === 'pending' && (
                            <>
                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onAccept?.(app.id)}>Accept</Button>
                                <Button size="sm" variant="destructive" className="w-full" onClick={() => onReject?.(app.id)}>Reject</Button>
                            </>
                        )}

                        {(app.status === 'accepted' || app.status === 'in_call') && app.mode !== 'visit' && (
                            <Button onClick={() => onStartCall?.(app)} className={`w-full ${app.status === 'in_call' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {app.status === 'in_call' ? 'RESUME CALL' : 'START CALL'}
                            </Button>
                        )}

                        {(app.status === 'accepted' || app.status === 'in_call') && app.mode === 'visit' && (
                            <Button className="w-full" variant="outline" onClick={() => onComplete?.(app.id)}>Mark Complete</Button>
                        )}

                        {app.status === 'completed' && (
                            <Button variant="outline" className="w-full" onClick={() => onPrescribe?.(app)}>
                                <FileText className="mr-2 h-4 w-4" /> Prescription
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
