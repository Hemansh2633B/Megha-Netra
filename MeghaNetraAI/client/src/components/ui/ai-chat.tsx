import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Mic, Box, Send, Activity } from "lucide-react";

interface ChatMessage {
  id: number;
  message: string;
  response?: string;
  timestamp: string;
  isUser: boolean;
}

export default function AiChat() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat/history'],
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat/message', { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceControl = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    setTimeout(() => setIsListening(false), 3000);
  };

  const suggestedQuestions = [
    "Analyze current storms",
    "7-day forecast",
    "Satellite analysis"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  return (
    <Card className="glass-morphism shadow-xl h-full">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-lg">MeghaNetra AI Assistant</h3>
              <div className="flex items-center text-sm opacity-90">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Neural Networks Online • Real-time Analysis
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleVoiceControl}
              className={`p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors ${
                isListening ? 'bg-red-500/50' : ''
              }`}
              title="Voice Control"
            >
              <Mic className={isListening ? 'text-red-200' : ''} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="AR Data Preview"
            >
              <Box />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {/* AI Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm leading-relaxed">
                  Hello! I'm your advanced weather intelligence assistant powered by deep learning models. 
                  I can analyze satellite imagery, predict weather patterns, and provide real-time insights. 
                  Try asking me about current storm systems or weather forecasts.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(question)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat History */}
          {chatHistory?.map((chat: any) => (
            <div key={chat.id} className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-4">
                  <p className="text-sm">{chat.message}</p>
                </div>
              </div>

              {/* AI Response */}
              {chat.response && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="mb-3 text-sm">
                        <Badge variant="default" className="bg-blue-600 text-white mb-2">
                          <Activity className="w-3 h-3 mr-1" />
                          Processing with neural networks...
                        </Badge>
                        <p className="leading-relaxed">{chat.response}</p>
                      </div>
                      
                      {/* AR Preview Card */}
                      <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-4 mb-3 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-600">3D Weather Visualization</span>
                          <button className="text-xs text-blue-600 hover:underline">View in AR</button>
                        </div>
                        <img 
                          src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
                          alt="Weather analysis visualization" 
                          className="w-full h-32 object-cover rounded-lg" 
                        />
                        <div className="absolute top-2 right-2 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">AR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {(isTyping || sendMessageMutation.isPending) && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain className="text-white text-sm" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">AI is analyzing</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about weather patterns, predictions, or satellite analysis..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button 
                onClick={toggleVoiceControl}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Mic className={isListening ? 'text-red-500' : ''} />
              </button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Voice Control Indicator */}
          {isListening && (
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <span>Listening...</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-4 bg-blue-600 rounded-sm animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
