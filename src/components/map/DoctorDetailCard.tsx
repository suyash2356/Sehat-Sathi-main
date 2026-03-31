'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Star,
  Building2,
  Clock,
  IndianRupee,
  Stethoscope,
  CheckCircle,
  User,
  Info,
  Users,
  Phone,
} from 'lucide-react';

// Availability structure for day-level schedule
interface DaySchedule {
  start: string;
  end: string;
  isOpen: boolean;
}

interface DayAvailability {
  [key: string]: DaySchedule;
}

// Props representing a doctor from Firestore
interface DoctorData {
  id: string;
  name: string;
  fullName?: string;
  specialization?: string;
  qualification?: string;
  hospitalName?: string;
  clinicAddress?: string;
  hospitalAddress?: string;
  address?: string;
  consultationFee?: number;
  experience?: number | string;
  bio?: string;
  profilePicture?: string;
  isVerified: boolean;
  availability?: DayAvailability | { dates: string[]; timeSlots: string[] };
  state?: string;
  district?: string;
  village?: string;
  type?: string;
  contact?: string;
  notableDoctors?: { name: string; role: string }[];
}

interface DoctorDetailCardProps {
  selectedDoctor: DoctorData | null;
  allDoctors?: DoctorData[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getTodayDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

// ─── Placeholder Card ──────────────────────────────────────
function PlaceholderCard() {
  return (
    <Card className="rounded-xl border shadow-sm h-full">
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-1">
          Select a doctor or hospital
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          from the map to view details before booking
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Doctor Detail Card ────────────────────────────────────
function DoctorCard({ doctor }: { doctor: DoctorData }) {
  const today = getTodayDayName();
  const displayName = doctor.fullName || doctor.name || 'Unknown Doctor';
  const firstInitial = displayName.charAt(0).toUpperCase();

  // Extract availability map (day-based schedule)
  const availability: DayAvailability | null = (() => {
    if (!doctor.availability) return null;
    if ('dates' in doctor.availability) return null; // legacy format
    return doctor.availability as DayAvailability;
  })();

  const fee = doctor.consultationFee;
  const feeDisplay = (!fee || fee === 0) ? 'Free Consultation' : `₹${fee}`;

  const clinicAddr = doctor.clinicAddress || doctor.hospitalAddress || doctor.address || '';

  return (
    <Card className="rounded-xl border shadow-sm max-h-[600px] overflow-y-auto">
      <CardContent className="p-5 space-y-4">
        {/* ── Header: Avatar + Name + Verification ── */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 shrink-0">
            {doctor.profilePicture ? (
              <AvatarImage src={doctor.profilePicture} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-2xl font-bold text-gray-600 dark:text-gray-300">
              {firstInitial}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">Dr. {displayName}</h3>
              {doctor.isVerified && (
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 shrink-0" />
              )}
            </div>
            {doctor.isVerified && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" /> Verified Doctor
              </Badge>
            )}
            {doctor.specialization && (
              <p className="text-sm text-muted-foreground mt-1">{doctor.specialization}</p>
            )}
            {doctor.qualification && (
              <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
            )}
          </div>
        </div>

        {/* ── Hospital & Address ── */}
        <div className="border-t pt-3 space-y-1.5">
          {doctor.hospitalName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{doctor.hospitalName}</span>
            </div>
          )}
          {clinicAddr && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{clinicAddr}</span>
            </div>
          )}
        </div>

        {/* ── Fee & Experience ── */}
        <div className="border-t pt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Consultation Fee</p>
              <p className="font-semibold">{feeDisplay}</p>
            </div>
          </div>
          {doctor.experience && (
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="font-semibold">{doctor.experience} yrs</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Availability ── */}
        {availability && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Availability</p>
            </div>
            <div className="space-y-1">
              {DAYS_OF_WEEK.map((day) => {
                const schedule = availability[day];
                const isToday = day === today;
                const isOpen = schedule?.isOpen === true;

                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between text-sm py-1 ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/20 rounded px-2 font-medium' : 'px-2'
                    }`}
                  >
                    <span className="w-24">{day.slice(0, 3)}</span>
                    {isOpen ? (
                      <>
                        <span className="flex-1 text-center">
                          {schedule.start} - {schedule.end}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1" />
                          Open
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-center text-gray-400">—</span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block mr-1" />
                          Closed
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bio ── */}
        {doctor.bio && (
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-1">📝 About</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{doctor.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Hospital Detail Card ──────────────────────────────────
function HospitalCard({
  hospital,
  affiliatedDoctors,
}: {
  hospital: DoctorData;
  affiliatedDoctors: DoctorData[];
}) {
  return (
    <Card className="rounded-xl border shadow-sm max-h-[600px] overflow-y-auto">
      <CardContent className="p-5 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">{hospital.name}</h3>
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 shrink-0" />
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" /> Government Verified Hospital
            </Badge>
          </div>
        </div>

        {/* ── Location Details ── */}
        <div className="border-t pt-3 space-y-1.5">
          {hospital.hospitalName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{hospital.hospitalName}</span>
            </div>
          )}
          {(hospital.hospitalAddress || hospital.address) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {hospital.hospitalAddress || hospital.address}
              </span>
            </div>
          )}
          {(hospital.district || hospital.state) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {[hospital.district, hospital.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* ── Specialization, Fee, Type ── */}
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Specialization</p>
              <p className="font-semibold">{hospital.specialization || 'General'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Consultation</p>
              <p className={`font-semibold ${hospital.consultationFee === 0 ? 'text-green-600' : ''}`}>
                {hospital.consultationFee === 0 ? 'Free (Government)' : `₹${hospital.consultationFee}`}
              </p>
            </div>
          </div>
          {hospital.contact && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Contact Number</p>
                <p className="font-semibold">{hospital.contact}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-semibold">Government Hospital</p>
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        {hospital.bio && (
          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-1">📝 About Hospital</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{hospital.bio}</p>
          </div>
        )}

        {/* ── Notable Staff (Static Data) ── */}
        {hospital.notableDoctors && hospital.notableDoctors.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Notable Staff</p>
            </div>
            <div className="space-y-2">
              {hospital.notableDoctors.map((staff, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{staff.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Doctors at this Hospital ── */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">
              Doctors at this Hospital ({affiliatedDoctors.length})
            </p>
          </div>
          {affiliatedDoctors.length > 0 ? (
            <div className="space-y-2">
              {affiliatedDoctors.map((doc) => {
                const docName = doc.fullName || doc.name || 'Unknown Doctor';
                const initial = docName.charAt(0).toUpperCase();
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    {doc.profilePicture ? (
                      <img
                        src={doc.profilePicture}
                        alt={docName}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 text-sm font-bold text-gray-600 dark:text-gray-300">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">Dr. {docName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.specialization || 'General Physician'}
                      </p>
                    </div>
                    {doc.isVerified && (
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No registered doctors found at this hospital yet.
            </p>
          )}
        </div>

        {/* ── Info Note ── */}
        <div className="border-t pt-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Appointment type for government hospitals is In-Person visit only.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Exported Component ───────────────────────────────
export function DoctorDetailCard({ selectedDoctor, allDoctors = [] }: DoctorDetailCardProps) {
  if (!selectedDoctor) {
    return <PlaceholderCard />;
  }

  if (selectedDoctor.type === 'Government') {
    // Find doctors affiliated with this hospital by matching hospitalName
    const hospitalFullName = selectedDoctor.hospitalName || selectedDoctor.name;
    const affiliatedDoctors = allDoctors.filter(
      (doc) =>
        doc.type === 'Doctor' &&
        doc.hospitalName &&
        (doc.hospitalName.toLowerCase() === hospitalFullName?.toLowerCase() ||
         doc.hospitalName.toLowerCase().includes(selectedDoctor.name.toLowerCase()) ||
         selectedDoctor.name.toLowerCase().includes(doc.hospitalName.toLowerCase()))
    );
    return <HospitalCard hospital={selectedDoctor} affiliatedDoctors={affiliatedDoctors} />;
  }

  return <DoctorCard doctor={selectedDoctor} />;
}
