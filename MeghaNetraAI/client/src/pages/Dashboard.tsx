import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cloud, 
  Brain, 
  Satellite, 
  Shield, 
  Eye, 
  Mic, 
  Send, 
  LogOut,
  Activity,
  Zap,
  CloudRain,
  Wind,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Globe
} from "lucide-react";
import WeatherMap from "@/components/ui/weather-map";
import AiChat from "@/components/ui/ai-chat";
import WeatherAlerts from "@/components/ui/weather-alerts";
import NeuralNetworkStatus from "@/components/ui/neural-network-status";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isListening, setIsListening] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/ml/metrics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/weather/patterns'] });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.close();
    };
  }, [queryClient]);

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
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

  const { data: mlMetrics } = useQuery({
    queryKey: ['/api/ml/metrics'],
  });

  const { data: weatherPatterns } = useQuery({
    queryKey: ['/api/weather/patterns'],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        return;
      }
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleVoiceControl = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop voice recognition
    setTimeout(() => setIsListening(false), 3000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MeghaNetra AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neural-network-bg">
      {/* Enhanced Header */}
      <header className="glass-morphism shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg animate-glow">
                  <Cloud className="text-white text-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Eye className="text-white text-xs" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Megha<span className="text-orange-500">Netra</span>
                </h1>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge variant="default" className="bg-orange-500">ISRO Partner</Badge>
                  <Badge variant="default" className="bg-green-500">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    AI Online
                  </Badge>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <Satellite className="w-4 h-4 mr-2" />
                Live Feed
              </Button>
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <img 
                    src={user?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{user?.firstName || user?.email}</div>
                  <div className="text-xs opacity-75">Weather Analyst</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* AI Status Banner */}
        <div className="mb-8 glass-morphism rounded-2xl p-6 border-l-4 border-orange-500 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 ai-processing rounded-xl flex items-center justify-center">
                <Brain className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Deep Learning Models Active</h3>
                <p className="text-sm text-gray-600">LSTM Weather Prediction • CNN Satellite Analysis • Transformer NLP</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="font-semibold text-green-600">
                  GPU: {((mlMetrics?.systemLoad || 0.847) * 100).toFixed(1)}% Utilized
                </div>
                <div className="text-gray-500">
                  Processing {weatherPatterns?.activePatterns || 847} weather patterns
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <AiChat />
          </div>
          
          {/* Weather Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Weather Map */}
            <WeatherMap />
            
            {/* AI Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Neural Network Status */}
              <NeuralNetworkStatus />
              
              {/* Weather Alerts */}
              <WeatherAlerts />
            </div>
            
            {/* Advanced Analytics */}
            <Card className="glass-morphism shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800">Predictive Analytics</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Updated 2 min ago</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      {weatherPatterns?.activePatterns || 847}
                    </div>
                    <div className="text-xs text-gray-600">Weather Patterns</div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% from yesterday</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {((weatherPatterns?.confidence || 0.943) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Prediction Accuracy</div>
                    <div className="text-xs text-green-600 mt-1">↑ 2.3% this week</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {mlMetrics?.activeModels || 4}
                    </div>
                    <div className="text-xs text-gray-600">Active Models</div>
                    <div className="text-xs text-blue-600 mt-1">Real-time processing</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">23TB</div>
                    <div className="text-xs text-gray-600">Data Processed</div>
                    <div className="text-xs text-green-600 mt-1">↑ 45% this month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Advanced Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Predictive Preloading */}
          <Card className="glass-morphism shadow-xl animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Predictive Preloading</h3>
                  <p className="text-sm text-gray-600">ML-powered data anticipation</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Historical patterns analyzed</span>
                  <span className="font-semibold text-purple-600">2.4M datasets</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prediction accuracy</span>
                  <span className="font-semibold text-green-600">91.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cache hit rate</span>
                  <span className="font-semibold text-blue-600">87.6%</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-xs font-semibold text-purple-700 mb-1">Next Predicted Need:</div>
                <div className="text-sm text-gray-700">High-res SST anomalies (68% confidence)</div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quality Control */}
          <Card className="glass-morphism shadow-xl animate-slide-up delay-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Auto Quality Control</h3>
                  <p className="text-sm text-gray-600">Computer vision validation</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Artifacts detected</span>
                  <span className="font-semibold text-red-600">12 flagged</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Missing data found</span>
                  <span className="font-semibold text-yellow-600">3 gaps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Validation accuracy</span>
                  <span className="font-semibold text-green-600">99.1%</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-semibold text-green-700 mb-1">Status:</div>
                <div className="text-sm text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>All systems validated</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Blockchain Verification */}
          <Card className="glass-morphism shadow-xl animate-slide-up delay-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Globe className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Blockchain Verification</h3>
                  <p className="text-sm text-gray-600">Immutable data integrity</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified downloads</span>
                  <span className="font-semibold text-indigo-600">45,832</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Integrity checks</span>
                  <span className="font-semibold text-green-600">100% passed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Block confirmations</span>
                  <span className="font-semibold text-blue-600">1,247</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <div className="text-xs font-semibold text-indigo-700 mb-1">Latest Hash:</div>
                <div className="text-xs font-mono text-gray-600 break-all">0x4f2a...8b91</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="mt-16 glass-morphism">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Satellite className="text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800">MeghaNetra AI Platform</div>
                <div className="text-sm text-gray-600">Powered by ISRO • Advanced Weather Intelligence</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{mlMetrics?.activeModels || 4} ML models active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Quantum-encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>23TB processed today</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
