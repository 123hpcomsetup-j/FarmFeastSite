import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, User, Clock, Mail, X, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getAdminQueryFn } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  chatSessionId: number;
  senderType: 'visitor' | 'admin';
  senderId: string;
  message: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatSession {
  id: number;
  visitorSessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  status: 'waiting' | 'active' | 'closed';
  adminId?: number;
  startedAt: string;
  lastMessageAt: string;
  closedAt?: string;
}

export function LiveChatDashboard() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  // Fetch all chat sessions with auth token - reduced frequency to reduce console spam
  const { data: allSessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ["/api/admin/chat/sessions"],
    queryFn: () => getAdminQueryFn({ queryKey: ["/api/admin/chat/sessions"] }),
    refetchInterval: 30000, // Refetch every 30 seconds instead of 5
  }) as { data: ChatSession[], refetch: () => void };

  // Fetch active chat sessions with auth token - reduced frequency to reduce console spam
  const { data: activeSessions = [], refetch: refetchActiveSessions } = useQuery({
    queryKey: ["/api/admin/chat/active"],
    queryFn: () => getAdminQueryFn({ queryKey: ["/api/admin/chat/active"] }),
    refetchInterval: 30000, // Refetch every 30 seconds instead of 3
  }) as { data: ChatSession[], refetch: () => void };

  // Assign admin to chat session
  const assignMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest("PUT", `/api/admin/chat/${sessionId}/assign`, {});
      return await response.json();
    },
    onSuccess: (updatedSession: ChatSession) => {
      setSelectedSession(updatedSession);
      refetchSessions();
      refetchActiveSessions();
    }
  });

  // Close chat session
  const closeMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest("PUT", `/api/admin/chat/${sessionId}/close`, {});
    },
    onSuccess: () => {
      refetchSessions();
      refetchActiveSessions();
      setSelectedSession(null);
    }
  });

  // Mark messages as read
  const markReadMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest("PUT", `/api/admin/chat/${sessionId}/read`, {});
    }
  });

  // WebSocket connection
  const connectWebSocket = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log("Connected to admin chat WebSocket");
      setIsConnected(true);
      
      if (selectedSession) {
        // Join the selected chat session
        wsRef.current?.send(JSON.stringify({
          type: 'join_chat',
          chatSessionId: selectedSession.id,
          userType: 'admin',
          adminId: 1 // Get from auth context
        }));
      }
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          setMessages(prev => {
            // Prevent duplicates by checking if message ID already exists
            const exists = prev.find(m => m.id === data.message.id);
            if (exists) return prev;
            return [...prev, data.message];
          });
          // Refetch sessions to update last message time
          refetchSessions();
          refetchActiveSessions();
          break;
      }
    };
    
    wsRef.current.onclose = () => {
      console.log("Admin chat WebSocket disconnected");
      setIsConnected(false);
    };
  };

  // Send message via WebSocket
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'send_message',
      chatSessionId: selectedSession.id,
      senderType: 'admin',
      senderId: 'admin',
      content: newMessage
    }));
    
    setNewMessage("");
  };

  // Fetch messages for selected session
  const fetchMessages = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/chat/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
        
        // Mark messages as read
        markReadMutation.mutate(sessionId);
      } else {
        console.error("Failed to fetch messages:", response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  // Handle session selection
  const handleSessionSelect = (session: ChatSession) => {
    setSelectedSession(session);
    fetchMessages(session.id);
    
    // Join WebSocket for this session
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_chat',
        chatSessionId: session.id,
        userType: 'admin',
        adminId: 1
      }));
    }
  };

  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Only run once on mount

  // Join session when session changes (don't send multiple join messages)
  useEffect(() => {
    if (selectedSession && wsRef.current?.readyState === WebSocket.OPEN) {
      // Clear previous messages when switching sessions
      setMessages([]);
      
      wsRef.current.send(JSON.stringify({
        type: 'join_chat',
        chatSessionId: selectedSession.id,
        userType: 'admin',
        adminId: 1
      }));
    }
  }, [selectedSession]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Waiting</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Chat Dashboard</h1>
          <p className="text-gray-600">Manage customer conversations in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat Sessions List */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="active" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active ({activeSessions.filter((s) => s.status !== 'closed').length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({allSessions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4 h-full">
              <div className="space-y-2 overflow-y-auto h-full">
                {activeSessions.filter((session) => session.status !== 'closed').map((session) => (
                  <Card
                    key={`active-session-${session.id}`}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {session.visitorName || 'Anonymous Visitor'}
                          </span>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      {session.visitorEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Mail className="h-3 w-3" />
                          {session.visitorEmail}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Started: {formatDate(session.startedAt)}
                      </div>
                      
                      {session.status === 'waiting' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            assignMutation.mutate(session.id);
                          }}
                          className="w-full mt-3"
                          size="sm"
                          disabled={assignMutation.isPending}
                        >
                          {assignMutation.isPending ? "Assigning..." : "Take Chat"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {activeSessions.filter((s) => s.status !== 'closed').length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No active chat sessions</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="mt-4 h-full">
              <div className="space-y-2 overflow-y-auto h-full">
                {allSessions.map((session) => (
                  <Card
                    key={`all-session-${session.id}`}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {session.visitorName || 'Anonymous Visitor'}
                          </span>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.startedAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedSession.visitorName || 'Anonymous Visitor'}
                    {getStatusBadge(selectedSession.status)}
                  </CardTitle>
                  {selectedSession.visitorEmail && (
                    <p className="text-sm text-gray-600">{selectedSession.visitorEmail}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {selectedSession.status === 'active' && (
                    <Button
                      onClick={() => closeMutation.mutate(selectedSession.id)}
                      variant="outline"
                      size="sm"
                      disabled={closeMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close Chat
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={`message-${message.id}-${message.chatSessionId}-${index}`}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.senderType === 'admin'
                            ? 'bg-blue-600 text-white'
                            : message.messageType === 'system'
                            ? 'bg-gray-100 text-gray-600 text-center'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="break-words">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {selectedSession.status === 'active' && (
                  <div className="border-t p-4 flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {selectedSession.status === 'waiting' && (
                  <div className="border-t p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      This visitor is waiting for assistance
                    </p>
                    <Button
                      onClick={() => assignMutation.mutate(selectedSession.id)}
                      disabled={assignMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {assignMutation.isPending ? "Taking chat..." : "Take this chat"}
                    </Button>
                  </div>
                )}
                
                {selectedSession.status === 'closed' && (
                  <div className="border-t p-4 text-center text-sm text-gray-500">
                    This chat session has been closed
                    {selectedSession.closedAt && (
                      <div className="mt-1">
                        Closed on {formatDate(selectedSession.closedAt)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a chat session</h3>
                <p>Choose a conversation from the list to start chatting with visitors</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}