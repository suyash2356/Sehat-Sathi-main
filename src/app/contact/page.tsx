'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MessageSquare, Siren } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].contact;

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    const subject = `New Feedback from ${values.name} - Sehat Sathi`;
    const body = `Name: ${values.name}\nEmail: ${values.email}\n\nMessage:\n${values.message}`;
    const mailtoLink = `mailto:shriharikrishna2356@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;

    form.reset();
    toast({
      title: t.successToastTitle,
      description: t.successToastDescription,
    });
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline">
              <MessageSquare className="h-6 w-6 text-primary" />
              {t.formTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.formNamePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formEmailLabel}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t.formEmailPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.formMessageLabel}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t.formMessagePlaceholder} {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{t.sendButton}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-8 mt-4 md:mt-0">
            <h3 className="text-xl font-semibold font-headline">{t.contactInfoTitle}</h3>
            <p className="text-muted-foreground">
              {t.contactInfoDescription}
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary"/>
                </div>
                <div>
                  <h4 className="font-semibold">{t.supportEmail}</h4>
                  <a href="mailto:shriharikrishna2356@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">shriharikrishna2356@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <Siren className="h-6 w-6 text-destructive"/>
                </div>
                <div>
                  <h4 className="font-semibold">{t.emergencyHelpline}</h4>
                  <a href="tel:112" className="text-muted-foreground font-bold text-lg hover:text-destructive transition-colors">{t.emergencyNumber}</a>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
