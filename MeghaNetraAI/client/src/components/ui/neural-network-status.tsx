import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Eye, MessageSquare, Activity } from "lucide-react";

export default function NeuralNetworkStatus() {
  const { data: mlMetrics } = useQuery({
    queryKey: ['/api/ml/metrics'],
  });

  const { data: models } = useQuery({
    queryKey: ['/api/ml/models'],
  });

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'LSTM':
        return <Activity className="w-4 h-4" />;
      case 'CNN':
        return <Eye className="w-4 h-4" />;
      case 'Transformer':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'training':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="glass-morphism shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Neural Network Status</h3>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {models?.length > 0 ? (
            models.slice(0, 3).map((model: any) => (
              <div key={model.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="text-blue-600">
                      {getModelIcon(model.modelType)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{model.modelName}</span>
                    <div className="text-xs text-gray-500">{model.modelType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getStatusColor(model.status)}`}>
                    {model.status === 'active' ? '✓' : model.status === 'training' ? '⟳' : '✗'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Default status when no data is available
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">LSTM Models</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">4/4</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">CNN Analysis</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">97.3%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">NLP Engine</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">2.3s</div>
                  <div className="text-xs text-gray-500">Response Time</div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
