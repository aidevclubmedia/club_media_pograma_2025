import React from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  Scale,
  Maximize,
  ThermometerSun,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { ShelfAnalytics as ShelfAnalyticsType, ComplianceIssue } from '../../types';
import { usePlanogram } from '../../context/PlanogramContext';

interface ShelfAnalyticsProps {
  analytics: ShelfAnalyticsType;
}

const ShelfAnalytics: React.FC<ShelfAnalyticsProps> = ({ analytics }) => {
  if (!analytics || !analytics.performance) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <p className="text-gray-400 text-center">No analytics data available</p>
      </div>
    );
  }

  const {
    facingCount,
    totalProducts,
    weightLoad,
    complianceIssues,
    performance
  } = analytics;

  const getSeverityColor = (severity: ComplianceIssue['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getIssueIcon = (type: ComplianceIssue['type']) => {
    switch (type) {
      case 'spacing': return <Maximize size={16} />;
      case 'weight': return <Scale size={16} />;
      case 'temperature': return <ThermometerSun size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Daily Sales</span>
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div className="text-xl font-semibold text-white">
            ${performance.totalSales.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1 flex items-center">
            <DollarSign size={14} className="mr-1 text-green-400" />
            ${performance.salesPerCm.toFixed(2)}/cm
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Daily Profit</span>
            <DollarSign size={18} className="text-green-400" />
          </div>
          <div className="text-xl font-semibold text-white">
            ${performance.totalProfit.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1 flex items-center">
            <DollarSign size={14} className="mr-1 text-green-400" />
            ${performance.profitPerCm.toFixed(2)}/cm
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Inventory Turn</span>
            <BarChart3 size={18} className="text-blue-400" />
          </div>
          <div className="text-xl font-semibold text-white">
            {performance.averageInventoryTurn.toFixed(1)}x
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {performance.daysOfSupply.toFixed(1)} days of supply
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Weight Load</span>
            <Scale size={18} className="text-blue-400" />
          </div>
          <div className="text-xl font-semibold text-white">
            {weightLoad.toFixed(1)} kg
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {facingCount} facings ({totalProducts} products)
          </div>
        </div>
      </div>

      {/* Compliance Issues */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3 flex items-center">
          <AlertTriangle size={18} className="mr-2 text-yellow-500" />
          Compliance Issues
        </h3>
        {complianceIssues.length > 0 ? (
          <div className="space-y-2">
            {complianceIssues.map((issue, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded p-3 flex items-start"
              >
                <div className={`mr-3 ${getSeverityColor(issue.severity)}`}>
                  {getIssueIcon(issue.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{issue.message}</p>
                  {issue.recommendation && (
                    <p className="text-gray-400 text-xs mt-1">
                      Recommendation: {issue.recommendation}
                    </p>
                  )}
                  {issue.impact && (
                    <div className="mt-2 flex items-center space-x-4 text-xs">
                      {issue.impact.sales && (
                        <span className="text-green-400 flex items-center">
                          <TrendingUp size={12} className="mr-1" />
                          +${issue.impact.sales.toFixed(2)}/day
                        </span>
                      )}
                      {issue.impact.profit && (
                        <span className="text-green-400 flex items-center">
                          <DollarSign size={12} className="mr-1" />
                          +${issue.impact.profit.toFixed(2)}/day
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No compliance issues detected</p>
        )}
      </div>
    </div>
  );
};

export default ShelfAnalytics;