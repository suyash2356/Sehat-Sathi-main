
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Waves, Utensils, PersonStanding, Sun, Zap, ShieldAlert, Syringe, Baby, HeartPulse, X } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';

const precautionIcons = [
  <Waves key="water" className="h-10 w-10 text-primary" />,
  <Utensils key="food" className="h-10 w-10 text-primary" />,
  <PersonStanding key="hygiene" className="h-10 w-10 text-primary" />,
]

const healthyHabitIcons = [
  <Utensils key="diet" className="h-10 w-10 text-primary" />,
  <Zap key="exercise" className="h-10 w-10 text-primary" />,
  <Sun key="sleep" className="h-10 w-10 text-primary" />,
]

const govIcons = [
    <ShieldAlert key="disease" className="h-10 w-10 text-primary" />,
    <Syringe key="vaccination" className="h-10 w-10 text-primary" />,
    <Baby key="maternal" className="h-10 w-10 text-primary" />,
]

type DetailCard = {
    title: string;
    description: string;
    icon: React.ReactNode;
    details: {
        title: string;
        content: string[];
    }[];
}

const DetailDialog = ({ item, open, onOpenChange }: { item: DetailCard, open: boolean, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
                 <DialogHeader>
                    <DialogTitle className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-full shrink-0">
                           {item.icon}
                        </div>
                        <span className="pt-3 font-headline text-2xl">{item.title}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                    <div className="space-y-4 text-muted-foreground">
                        {item.details.map((detail, index) => (
                            <div key={index}>
                                <h4 className="font-semibold text-lg text-foreground mb-2">{detail.title}</h4>
                                <ul className="space-y-2 list-disc pl-5">
                                    {detail.content.map((point, pIndex) => <li key={pIndex}>{point}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function HealthGuidePage() {
  const { language } = useChatLanguage();
  const t = translations[language].healthGuide;
  const [selectedItem, setSelectedItem] = useState<DetailCard | null>(null);

  const precautions = t.precautions.map((p, i) => ({ ...p, icon: precautionIcons[i] }));
  const healthyHabits = t.healthyHabits.map((h, i) => ({ ...h, icon: healthyHabitIcons[i] }));
  const govGuidelines = t.govGuidelines.map((g, i) => ({ ...g, icon: govIcons[i] }));

  const handleCardClick = (item: DetailCard) => {
    setSelectedItem(item);
  };

  const handleDialogClose = () => {
    setSelectedItem(null);
  };

  const renderCards = (items: DetailCard[]) => {
    return items.map((item, index) => (
      <Card 
        key={index} 
        className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer"
        onClick={() => handleCardClick(item)}
      >
        <CardHeader className="items-center p-6">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            {item.icon}
          </div>
          <CardTitle className="font-headline">{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    ));
  }

  return (
    <div className="container py-12 md:py-16">
        {selectedItem && (
            <DetailDialog 
                item={selectedItem} 
                open={!!selectedItem}
                onOpenChange={(open) => { if (!open) handleDialogClose()}}
            />
        )}

        <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        <section id="precautions" className="mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.precautionsTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.precautionsSubtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {renderCards(precautions)}
            </div>
        </section>
      
        <section id="healthy-habits" className="mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.healthyHabitsTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.healthyHabitsSubtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {renderCards(healthyHabits)}
            </div>
        </section>

        <section id="guidelines">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.govGuidelinesTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.govGuidelinesSubtitle}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {renderCards(govGuidelines)}
            </div>
            <div className="mt-12 text-center">
                 <a href="https://www.who.int/india" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                    {t.whoLink}
                </a>
                <span className="mx-4 text-muted-foreground">|</span>
                <a href="https://www.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                    {t.mohfwLink}
                </a>
            </div>
      </section>
    </div>
  );
}
