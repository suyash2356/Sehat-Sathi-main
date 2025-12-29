export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName?: string; // Optional as it might not be on all docs yet
    patientDetails: {
        name: string;
        age: number;
        gender: string;
        disease: string;
        phone?: string;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'in_call' | 'completed';
    mode: 'video' | 'voice' | 'visit';
    timing: 'scheduled' | 'call_now';
    scheduledTime: any;
}
