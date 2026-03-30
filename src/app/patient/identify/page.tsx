'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { identifyStrings, type Language } from '@/locales/identify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, ScanLine, Shield } from 'lucide-react';
import PredictDiseaseTab from '@/components/identify/PredictDiseaseTab';
import SkinDiseaseTab from '@/components/identify/SkinDiseaseTab';

export default function IdentifyPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { language } = useChatLanguage();
  const lang = language as Language;
  const t = identifyStrings[lang] || identifyStrings.en;

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in — redirect to login
      router.push('/patient/login');
      return;
    }

    // User is logged in — allow access
    setAuthChecked(true);
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">{t.loadingPatient}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">{t.pageSubtitle}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 sm:hidden">{t.pageSubtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="predict" className="w-full">
          <TabsList className="w-full h-auto p-1.5 bg-gray-100 rounded-xl mb-6 grid grid-cols-2 gap-1">
            <TabsTrigger
              value="predict"
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-6 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 transition-all duration-200"
            >
              <Stethoscope className="h-4 w-4" />
              <span>{t.tabPredict}</span>
            </TabsTrigger>
            <TabsTrigger
              value="skin"
              className="flex items-center justify-center gap-2 py-3 px-3 sm:px-6 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-700 transition-all duration-200"
            >
              <ScanLine className="h-4 w-4" />
              <span>{t.tabSkin}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict">
            <PredictDiseaseTab />
          </TabsContent>

          <TabsContent value="skin">
            <SkinDiseaseTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
