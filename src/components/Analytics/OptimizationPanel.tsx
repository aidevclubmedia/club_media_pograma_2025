import React from 'react';
import { 
  Lightbulb,
  TrendingUp,
  BarChart3,
  DollarSign,
  ChevronRight,
  Package,
  Scale
} from 'lucide-react';
import { OptimizationSuggestion, CategoryPerformance } from '../../types';
import { usePlanogram } from '../../context/PlanogramContext';

interface OptimizationPanelProps {
  suggestions: OptimizationSuggestion[];
  categoryPerformance: CategoryPerformance[];
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ 
  suggestions,
  categoryPerformance 
}) => {
  const { state } = usePlanogram();

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-4">
      {/* Optimization Suggestions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3 flex items-center">
          <Lightbulb size={18} className="mr-2 text-yellow-400" />
          Optimization Suggestions
        </h3>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="bg-gray-900 rounded p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm">{suggestion.message}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center text-xs text-gray-400">
                      <span>Current: {suggestion.currentValue.toFixed(1)}</span>
                      <ChevronRight size={14} className="mx-1" />
                      <span>Suggested: {suggestion.suggestedValue.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {suggestion.impact.sales && (
                    <div className="text-xs text-green-400 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +${suggestion.impact.sales.toFixed(2)}/day
                    </div>
                  )}
                  {suggestion.impact.profit && (
                    <div className="text-xs text-green-400 flex items-center mt-1">
                      <DollarSign size={14} className="mr-1" />
                      +${suggestion.impact.profit.toFixed(2)}/day
                    </div>
                  )}
                  {suggestion.impact.daysOfSupply && (
                    <div className="text-xs text-blue-400 flex items-center mt-1">
                      <Package size={14} className="mr-1" />
                      {suggestion.impact.daysOfSupply.toFixed(1)} days supply
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3 flex items-center">
          <BarChart3 size={18} className="mr-2 text-blue-400" />
          Category Performance
        </h3>
        <div className="space-y-3">
          {categoryPerformance.map((category, index) => (
            <div key={index} className="bg-gray-900 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">{category.category}</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400 flex items-center">
                    <TrendingUp size={12} className="mr-1 text-green-400" />
                    ${(category.salesVelocity * category.profitMargin).toFixed(2)}/day
                  </span>
                  <span className="text-gray-400 flex items-center">
                    <Scale size={12} className="mr-1" />
                    {category.inventoryTurn.toFixed(1)}x turn
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Space Share</span>
                    <span>{category.spaceShare.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${category.spaceShare}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Sales Share</span>
                    <span>{category.salesShare.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${category.salesShare}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Profit Share</span>
                    <span>{category.profitShare.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${category.profitShare}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationPanel;