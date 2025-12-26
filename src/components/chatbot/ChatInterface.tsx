'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SendHorizonal, Bot, User, Languages, Mic, MicOff, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { personalizedHealthGuidance } from '@/ai/flows/personalized-health-guidance';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { ScrollArea } from '@/components/ui/scroll-area';
import { translations } from '@/lib/translations';
import { useChatLanguage, setChatLanguage as setGlobalLanguage } from '@/hooks/use-chat-language';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: number;
  text: string | React.ReactNode;
  sender: 'bot' | 'user';
  audioUrl?: string;
  imageUrl?: string;
};

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

const dummyHospitals = (lang: 'en' | 'hi' | 'mr') => `
${translations[lang].hospitals.title}
1. **Community Health Center, Ramgarh** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
2. **District Hospital, Sitapur** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
3. **Primary Health Sub-center, Devipur** - [${translations[lang].hospitals.mapLink}](https://www.google.com/maps)
`;

const bookingConfirmation = (lang: 'en' | 'hi' | 'mr') => translations[lang].bookingConfirmation;

const emergencyMessage = (lang: 'en' | 'hi' | 'mr') => `
<div class="flex items-start gap-2">
  <div class="text-destructive pt-1"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
  <div>
    <h4 class="font-bold text-destructive">${translations[lang].emergency.title}</h4>
    <p>${translations[lang].emergency.message}</p>
  </div>
</div>
`;

function parseMarkdownLinks(text: string) {
  const lines = text.trim().split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const match = line.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const preText = line.substring(0, match.index);
          return (
            <p key={index}>
              {preText}
              <a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                {match[1]}
              </a>
            </p>
          );
        }
        const boldMatch = line.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const preText = line.substring(0, boldMatch.index);
          const postText = line.substring(boldMatch.index! + boldMatch[0].length);
          return <p key={index}>{preText}<strong className="font-semibold">{boldMatch[1]}</strong>{postText}</p>
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

export function ChatInterface() {
  const { language, setLanguage } = useChatLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const t = translations[language];

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: t.greeting,
        sender: 'bot',
      },
    ]);
  }, [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'bot' && lastMessage.audioUrl) {
      const audio = new Audio(lastMessage.audioUrl);
      audio.play();
    }
  }, [messages]);

  const addMessage = (text: string | React.ReactNode, sender: 'bot' | 'user', options?: { audioUrl?: string, imageUrl?: string }) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender, ...options }]);
  };

  const processUserMessage = async (userMessage: string, photoDataUri?: string) => {
    addMessage(userMessage, 'user', { imageUrl: photoDataUri });
    setIsTyping(true);
    if (photoDataUri) setUploadedImage(null);

    const lowerCaseMessage = userMessage.toLowerCase();
    let botResponseText: string;
    let botResponse: string | React.ReactNode;

    if (lowerCaseMessage.includes('chest pain') || lowerCaseMessage.includes('emergency')) {
      botResponseText = translations[language].emergency.title + " " + translations[language].emergency.message;
      botResponse = <div dangerouslySetInnerHTML={{ __html: emergencyMessage(language) }} />;
    } else if (lowerCaseMessage.includes('hospital') || lowerCaseMessage.includes('clinic')) {
      botResponseText = dummyHospitals(language).replace(/\[.*?\]\(.*?\)/g, '');
      botResponse = parseMarkdownLinks(dummyHospitals(language));
    } else if (lowerCaseMessage.includes('book') || lowerCaseMessage.includes('consultation')) {
      botResponseText = bookingConfirmation(language);
      botResponse = bookingConfirmation(language);
    } else {
      try {
        const result = await personalizedHealthGuidance({
          symptoms: userMessage,
          medicalHistory: 'none provided',
          language: language,
          photoDataUri: photoDataUri,
        });
        botResponseText = result.advice;
        botResponse = result.advice;
      } catch (error) {
        console.error(error);
        botResponseText = "I'm having trouble connecting right now. Please try again later.";
        botResponse = botResponseText;
      }
    }

    try {
      const ttsResult = await textToSpeech(botResponseText);
      addMessage(botResponse, 'bot', { audioUrl: ttsResult.audio });
    } catch (error) {
      console.error('TTS Error:', error);
      addMessage(botResponse, 'bot');
    }

    setIsTyping(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser does not support Speech Recognition. Please try Chrome or Firefox.",
          variant: "destructive",
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        form.setValue('message', transcript);
        processUserMessage(transcript, uploadedImage ?? undefined);
        form.reset();
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let title = "Speech Recognition Error";
        let description = "An unknown error occurred.";

        if (event.error === 'not-allowed') {
          title = "Microphone Access Denied";
          description = "To use voice input, please allow microphone access in your browser settings and refresh the page.";
        } else if (event.error === 'no-speech') {
          title = "No Speech Detected";
          description = "Please try speaking again.";
        } else if (event.error === 'network') {
          title = "Network Error";
          description = "A network error occurred with the speech recognition service. Please check your connection.";
        }

        toast({ title, description, variant: 'destructive' });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    processUserMessage(values.message, uploadedImage ?? undefined);
    form.reset();
  }

  const toggleLanguage = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    setGlobalLanguage(lang);
    addMessage(translations[lang].languageSet, 'bot');
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-card rounded-t-lg shadow-2xl border border-border">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-bold text-lg font-headline">{t.appName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t.online}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex items-end gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.sender === 'bot' && <Bot className="h-6 w-6 shrink-0 text-primary" />}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3 text-sm break-words shadow-sm',
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary rounded-bl-none'
                )}
              >
                {msg.imageUrl && (
                  <Image
                    src={msg.imageUrl}
                    alt="Uploaded content"
                    width={200}
                    height={200}
                    className="rounded-md mb-2"
                  />
                )}
                {typeof msg.text === 'string' ? parseMarkdownLinks(msg.text) : msg.text}
              </div>
              {msg.sender === 'user' && <User className="h-6 w-6 shrink-0 text-muted-foreground" />}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <Bot className="h-6 w-6 shrink-0 text-primary" />
              <div className="bg-secondary rounded-xl p-3 rounded-bl-none shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background rounded-b-lg">
        {uploadedImage && (
          <div className="relative mb-2 w-24 h-24">
            <Image src={uploadedImage} alt="Preview" layout="fill" objectFit="cover" className="rounded-md" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => setUploadedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder={t.inputPlaceholder} {...field} autoComplete="off" className="rounded-full px-4" />
                  </FormControl>
                </FormItem>
              )}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} className="rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button type="button" size="icon" onClick={toggleRecording} className={cn("rounded-full", isRecording ? "bg-red-500 hover:bg-red-600" : "")}>
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit" size="icon" disabled={isTyping} className="rounded-full">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
