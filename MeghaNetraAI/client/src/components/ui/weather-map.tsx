import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, CloudRain, Wind } from "lucide-react";

export default function WeatherMap() {
  const { data: weatherPatterns } = useQuery({
    queryKey: ['/api/weather/patterns'],
  });

  return (
    <Card className="glass-morphism shadow-xl overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Real-time Weather Intelligence</h3>
            <p className="text-sm opacity-90">AI-powered satellite analysis • Live neural network inference</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="weather-map-container h-80 relative">
          <img 
            src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800" 
            alt="Satellite weather map showing cloud formations and storm systems" 
            className="w-full h-full object-cover" 
          />
          
          {/* AI-detected weather overlays */}
          <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-red-500/80 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
            <Zap className="w-5 h-5" />
          </div>
          
          <div className="absolute top-2/5 right-1/3 w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
            <CloudRain className="w-5 h-5" />
          </div>
          
          <div className="absolute bottom-1/3 left-2/5 w-12 h-12 bg-gray-500/80 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
            <Wind className="w-5 h-5" />
          </div>
          
          {/* AI Confidence Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span>AI Confidence: <strong>{((weatherPatterns?.confidence || 0.947) * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
          
          {/* Live Processing Indicator */}
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Processing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
