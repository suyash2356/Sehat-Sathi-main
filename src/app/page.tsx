'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { ShieldCheck, Zap, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

export default function LandingPage() {
  const { language } = useChatLanguage();
  const t = translations[language].landing;

  const features = [
    {
      title: t.features[0].title,
      description: t.features[0].description,
      icon: <Bot className="h-10 w-10 text-primary" />,
    },
    {
      title: t.features[1].title,
      description: t.features[1].description,
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    },
    {
      title: t.features[2].title,
      description: t.features[2].description,
      icon: <Zap className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <>
      <section className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover object-center"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-4 text-white max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-md font-headline">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/login">{t.signIn}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/chatbot">{t.startChatting}</Link>
            </Button>
          </div>
        </div>
      </section>

       <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.featuresTitle}</h2>
                <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.featuresSubtitle}
                </p>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
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
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card text-center">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.ctaTitle}</h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.ctaSubtitle}
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full px-8 py-6 text-lg">
            <Link href="/health-guide">{t.ctaButton}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
