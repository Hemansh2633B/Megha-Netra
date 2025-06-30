import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Cloud, Brain, Satellite, Shield } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', { email, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Login Successful",
        description: "Welcome to MeghaNetra AI Platform!",
      });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail("demo@megha-netra.ai");
    setPassword("demo123");
    loginMutation.mutate({ email: "demo@megha-netra.ai", password: "demo123" });
  };

  return (
    <div className="min-h-screen neural-network-bg">
      {/* Header */}
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
                  <span className="px-2 py-0.5 bg-orange-500 text-white rounded-full font-semibold">ISRO Partner</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    AI Online
                  </span>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <Satellite className="w-4 h-4 mr-2" />
                Features
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                <Brain className="w-4 h-4 mr-2" />
                AI Models
              </Button>
              <Button onClick={handleDemoLogin} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                Live Demo
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Advanced Weather Intelligence with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  Deep Learning
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                MeghaNetra harnesses the power of LSTM networks, CNN analysis, and Transformer models 
                to deliver unprecedented weather prediction accuracy and real-time climate insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-morphism rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Neural Networks</span>
                </div>
                <p className="text-sm text-gray-600">
                  LSTM, CNN, and Transformer models for comprehensive weather analysis
                </p>
              </div>

              <div className="glass-morphism rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Satellite className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">Real-time Data</span>
                </div>
                <p className="text-sm text-gray-600">
                  Live satellite feeds and IoT sensor networks for instant updates
                </p>
              </div>

              <div className="glass-morphism rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-800">94.7% Accuracy</span>
                </div>
                <p className="text-sm text-gray-600">
                  Industry-leading prediction accuracy with confidence scoring
                </p>
              </div>

              <div className="glass-morphism rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="font-semibold text-gray-800">AR Visualization</span>
                </div>
                <p className="text-sm text-gray-600">
                  3D weather models and augmented reality data previews
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleDemoLogin}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Brain className="w-5 h-5 mr-2" />
                Access AI Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 text-lg font-semibold hover:bg-blue-50"
              >
                <Satellite className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md glass-morphism shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to MeghaNetra</h2>
                  <p className="text-gray-600">AI-powered weather intelligence platform</p>
                  <div className="mt-3 flex items-center justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      ISRO Certified Partner
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Sign In to Platform
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-500 space-y-2">
                    <p>Enter any email and password to access the platform</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDemoLogin}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Or try the demo account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 glass-morphism border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Satellite className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-800">MeghaNetra AI Platform</div>
                <div className="text-sm text-gray-600">Powered by ISRO • Advanced Weather Intelligence</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Neural networks active</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Quantum-encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <span>AI-powered analytics</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
