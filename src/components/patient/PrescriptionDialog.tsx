'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface PrescriptionDialogProps {
  prescription: any | null; // using any for simplicity, as per project standards or inferred types
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionDialog({
  prescription,
  isOpen,
  onOpenChange,
}: PrescriptionDialogProps) {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!prescriptionRef.current || !prescription) return;

    try {
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`prescription-${prescription.appointmentId || 'download'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl">Prescription Details</DialogTitle>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </DialogHeader>

        <div ref={prescriptionRef} className="p-6 bg-white shrink-0">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Sehat Sathi - E-Prescription
            </h2>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Dr. {prescription.doctorName}</p>
                <p className="text-slate-600 text-sm">
                  {new Date(prescription.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{prescription.patientName}</p>
                <p className="text-slate-600 text-sm">
                  {prescription.patientAge}y · {prescription.patientGender}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Medications</h3>
            {prescription.medications && prescription.medications.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="py-2 pl-2">Name</th>
                    <th className="py-2">Strength</th>
                    <th className="py-2">Dose</th>
                    <th className="py-2">Freq</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {prescription.medications.map((med: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 pl-2 font-medium">{med.name}</td>
                      <td className="py-2">{med.strength || '-'}</td>
                      <td className="py-2">{med.dosage || '-'}</td>
                      <td className="py-2">{med.frequency || '-'}</td>
                      <td className="py-2">{med.duration || '-'}</td>
                      <td className="py-2 text-xs">{med.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 italic text-sm">No medications prescribed.</p>
            )}
          </div>

          {prescription.generalNotes && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2 border-b pb-2">Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-700 p-3 bg-slate-50 rounded">
                {prescription.generalNotes}
              </p>
            </div>
          )}
          
          <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
            This is an electronically generated prescription.
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t px-6">
           <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
