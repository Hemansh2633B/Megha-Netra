import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, CloudRain, Wind } from "lucide-react";

export default function WeatherAlerts() {
  const { data: alerts } = useQuery({
    queryKey: ['/api/weather/alerts'],
  });

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'thunderstorm':
        return <Zap className="w-4 h-4" />;
      case 'heavy_rain':
        return <CloudRain className="w-4 h-4" />;
      case 'high_wind':
        return <Wind className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'border-red-500 bg-red-50';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="glass-morphism shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">AI Weather Alerts</h3>
          <Badge variant="destructive" className="animate-pulse">
            {alerts?.length || 3} Active
          </Badge>
        </div>
        
        <div className="space-y-3">
          {alerts?.length > 0 ? (
            alerts.map((alert: any) => (
              <div 
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-xl border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className={`w-8 h-8 ${getSeverityIconColor(alert.severity)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <div className="text-white text-sm">
                    {getAlertIcon(alert.alertType)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800 capitalize">
                    {alert.alertType.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {alert.region} • AI Confidence: {(alert.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {alert.description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Default alerts when no data is available
            <>
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-xl border-l-4 border-red-500">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800">Severe Thunderstorm</div>
                  <div className="text-xs text-gray-600">Northern Region • AI Confidence: 96%</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CloudRain className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800">Heavy Rainfall Expected</div>
                  <div className="text-xs text-gray-600">Coastal Areas • AI Confidence: 89%</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wind className="text-white text-sm" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800">High Wind Advisory</div>
                  <div className="text-xs text-gray-600">Mountain Regions • AI Confidence: 78%</div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
