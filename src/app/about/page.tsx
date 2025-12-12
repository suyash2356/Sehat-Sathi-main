'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Target, Lightbulb, Users, HeartPulse, HelpCircle } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const aboutImage = PlaceHolderImages.find(p => p.id === 'about-us');

export default function AboutPage() {
  const { language } = useChatLanguage();
  const t = translations[language].about;

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6">
          <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <Target className="h-6 w-6 text-destructive" />
                {t.problemTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {t.problemShortfall}
              </p>
              <p className="mt-2 text-muted-foreground">
                {t.problemDescription}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <Lightbulb className="h-6 w-6 text-primary" />
                {t.solutionTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {t.solutionApp}
              </p>
              <p className="mt-2 text-muted-foreground">
                {t.solutionDescription}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="relative h-80 md:h-[450px] w-full rounded-lg overflow-hidden shadow-lg">
            {aboutImage && (
              <Image
                src={aboutImage.imageUrl}
                alt={aboutImage.description}
                fill
                className="object-cover"
                data-ai-hint={aboutImage.imageHint}
              />
            )}
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-8 bg-card p-8 rounded-lg shadow-md">
        <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><Users className="text-accent"/> {t.missionTitle}</h2>
            <p className="text-muted-foreground">{t.missionDescription}</p>
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><HeartPulse className="text-accent"/> {t.visionTitle}</h2>
            <p className="text-muted-foreground">{t.visionDescription}</p>
        </div>
      </div>

      <div className="mt-16">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary"/>
              {t.faqTitle}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">{t.faqSubtitle}</p>
        </div>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {t.faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
