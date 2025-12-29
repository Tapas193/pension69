import { useState, useRef, useEffect } from 'react';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, Send, User, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pension-chat`;

export default function UserAssistant() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get user's real-time location
  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}`
      );
      const data = await response.json();
      
      setLocation({
        lat: latitude,
        lng: longitude,
        address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      });
      
      toast({
        title: language === 'hi' ? 'स्थान प्राप्त हुआ' : 'Location Found',
        description: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: language === 'hi' ? 'स्थान त्रुटि' : 'Location Error',
        description: language === 'hi' 
          ? 'स्थान प्राप्त नहीं हो सका। कृपया अनुमति दें।'
          : 'Could not get location. Please allow permission.',
        variant: 'destructive',
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          language,
          location: location ? {
            address: location.address,
            lat: location.lat,
            lng: location.lng
          } : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      // Remove the empty assistant message if error
      if (assistantContent === '') {
        setMessages(prev => prev.filter(m => m.content !== ''));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = language === 'hi' 
    ? [
        'मेरी पेंशन की स्थिति क्या है?',
        'अगला भुगतान कब आएगा?',
        'शिकायत कैसे दर्ज करें?',
      ]
    : [
        'What is my pension status?',
        'When is my next payment?',
        'How to file a grievance?',
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <UserSidebar />
        </div>
        <main className="flex-1 flex flex-col p-4 md:p-6 pb-20 md:pb-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {language === 'hi' ? 'AI सहायक' : 'AI Assistant'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'hi' 
                    ? 'पेंशन और योजनाओं के बारे में प्रश्न पूछें'
                    : 'Ask questions about pensions and schemes'}
                </p>
              </div>
            </div>
            
            {/* Location Button */}
            <Button
              variant={location ? "secondary" : "outline"}
              size="sm"
              onClick={getLocation}
              disabled={locationLoading}
              className="gap-2"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {location 
                ? (language === 'hi' ? 'स्थान जुड़ा' : 'Located') 
                : (language === 'hi' ? 'स्थान जोड़ें' : 'Add Location')}
            </Button>
          </div>

          {/* Location Info */}
          {location && (
            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground truncate">{location.address}</span>
            </div>
          )}

          {/* Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Bot className="w-16 h-16 text-primary/40 mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {language === 'hi' ? 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?' : 'Hello! How can I help you today?'}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {language === 'hi' 
                    ? 'आप मुझसे पेंशन, योजनाओं, भुगतान या शिकायतों के बारे में पूछ सकते हैं।'
                    : 'You can ask me about pensions, schemes, payments, or grievances.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(q)}
                      className="text-sm"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-base whitespace-pre-wrap">{msg.content || '...'}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-4 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border pt-4">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'hi' ? 'अपना प्रश्न यहां लिखें...' : 'Type your question here...'}
                className="min-h-[56px] max-h-32 resize-none text-base"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-14 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
