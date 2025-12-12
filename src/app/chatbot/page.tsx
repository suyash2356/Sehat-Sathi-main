import { ChatInterface } from '@/components/chatbot/ChatInterface';

export default function ChatbotPage() {
  return (
    // Use dynamic viewport height (dvh) for better mobile compatibility,
    // accounting for the header height (h-16 in the new header).
    <div className="h-[calc(100dvh-4rem)]">
      <ChatInterface />
    </div>
  );
}
