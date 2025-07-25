import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  chatSessionId: number;
  senderType: 'visitor' | 'admin';
  senderId: string;
  message: string;
  messageType: 'text' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface ChatSession {
  id: number;
  visitorSessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  status: 'waiting' | 'active' | 'closed';
  adminId?: number;
  startedAt: string;
  lastMessageAt: string;
}

export function LiveChatFixed({ visitorSessionId }: { visitorSessionId: string }) {
  const sessionId = visitorSessionId || localStorage.getItem('visitor_session_id') || `visitor_${Date.now()}`;
  const [isOpen, setIsOpen] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showContactForm, setShowContactForm] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  // Start chat session
  const startChatMutation = useMutation({
    mutationFn: async (data: { visitorSessionId: string; visitorName?: string; visitorEmail?: string; visitorPhone?: string }) => {
      return await apiRequest("POST", "/api/chat/start", data);
    },
    onSuccess: (session: ChatSession) => {
      console.log("Chat session created successfully:", session);
      setChatSession(session);
      setShowContactForm(false);
      // Connect WebSocket after successful session creation
      if (session && session.id) {
        console.log("Starting WebSocket connection for session:", session.id);
        setTimeout(() => {
          connectWebSocket(session.id);
          fetchMessages(session.id);
        }, 500);
      } else {
        console.error("Invalid session data:", session);
      }
    },
    onError: (error) => {
      console.error("Error starting chat:", error);
    }
  });

  // Fetch messages
  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // WebSocket connection
  const connectWebSocket = (chatSessionId: number) => {
    if (!chatSessionId || isNaN(chatSessionId)) {
      console.error("Invalid chat session ID for WebSocket:", chatSessionId);
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    console.log("Connecting to WebSocket with session ID:", chatSessionId);
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log("Connected to chat WebSocket");
      setIsConnected(true);
      
      // Join chat session
      wsRef.current?.send(JSON.stringify({
        type: 'join_chat',
        chatSessionId: chatSessionId,
        userType: 'visitor',
        visitorSessionId: sessionId
      }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);
      
      switch (data.type) {
        case 'new_message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'admin_joined':
          setChatSession(data.session);
          break;
        case 'chat_closed':
          setChatSession(data.session);
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log("Chat WebSocket disconnected");
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  // Send message via WebSocket
  const sendMessage = () => {
    if (!newMessage.trim() || !chatSession || !wsRef.current || !isConnected) return;
    
    console.log("Sending message:", {
      type: 'send_message',
      chatSessionId: chatSession.id,
      senderType: 'visitor',
      senderId: sessionId,
      content: newMessage
    });
    
    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      chatSessionId: chatSession.id,
      senderType: 'visitor',
      senderId: sessionId,
      content: newMessage
    }));
    
    setNewMessage("");
  };

  // Start chat with contact info
  const handleStartChat = () => {
    if (!visitorName.trim() || !visitorPhone.trim()) {
      alert("Please provide your name and phone number to start the chat.");
      return;
    }
    
    startChatMutation.mutate({
      visitorSessionId: sessionId,
      visitorName: visitorName.trim(),
      visitorEmail: visitorEmail.trim(),
      visitorPhone: visitorPhone.trim()
    });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 z-50 w-80 h-96 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-lg">Live Chat</CardTitle>
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex flex-col h-full p-0">
            {showContactForm ? (
              // Contact form
              <div className="p-4 flex flex-col gap-3">
                <p className="text-sm text-gray-600">Start a conversation with our team</p>
                <Input
                  placeholder="Your name *"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Phone number *"
                  type="tel"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  required
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                />
                <Button 
                  onClick={handleStartChat}
                  disabled={!visitorName.trim() || !visitorPhone.trim() || startChatMutation.isPending}
                  className="w-full"
                >
                  {startChatMutation.isPending ? "Starting..." : "Start Chat"}
                </Button>
              </div>
            ) : (
              // Chat interface
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
                  {chatSession?.status === 'waiting' && (
                    <div className="text-center text-sm text-gray-500 bg-yellow-50 p-2 rounded">
                      Waiting for an admin to join...
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.senderType === 'visitor'
                            ? 'bg-blue-600 text-white'
                            : message.messageType === 'system'
                            ? 'bg-gray-100 text-gray-600 text-center'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.senderType === 'admin' && message.messageType !== 'system' && (
                          <div className="flex items-center gap-1 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium">Support</span>
                          </div>
                        )}
                        {message.message}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {chatSession?.status !== 'closed' && (
                  <div className="border-t p-3 flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={!isConnected || chatSession?.status === 'waiting'}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected || chatSession?.status === 'waiting'}
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}