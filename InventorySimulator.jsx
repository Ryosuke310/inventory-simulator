import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InventorySimulator = () => {
  const [salesData, setSalesData] = useState([
    { month: '6ヶ月前', amount: 1000000 },
    { month: '5ヶ月前', amount: 1200000 },
    { month: '4ヶ月前', amount: 950000 },
    { month: '3ヶ月前', amount: 1100000 },
    { month: '2ヶ月前', amount: 1300000 },
    { month: '1ヶ月前', amount: 1150000 },
  ]);
  
  const [currentInventory, setCurrentInventory] = useState(1500000);
  const [costRatio, setCostRatio] = useState(70);
  const [leadTime, setLeadTime] = useState(0.5);
  const [safetyStock, setSafetyStock] = useState(1.0);
  
  const [results, setResults] = useState(null);

  const calculateOptimalInventory = () => {
    // 売上を原価に変換
    const costs = salesData.map(d => d.amount * (costRatio / 100));
    const averageCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const costStd = Math.sqrt(
      costs.reduce((sum, x) => sum + Math.pow(x - averageCost, 2), 0) / costs.length
    );
    
    const baseStock = averageCost * leadTime;
    const safetyCoefficient = 1.645;
    const safetyStockAmount = costStd * safetyCoefficient * Math.sqrt(leadTime) * safetyStock;
    const optimalInventory = baseStock + safetyStockAmount;
    
    let evaluation = "適正な在庫水準です";
    if (currentInventory > optimalInventory * 1.2) {
      evaluation = "過剰在庫の可能性があります";
    } else if (currentInventory < optimalInventory * 0.8) {
      evaluation = "在庫不足の可能性があります";
    }
    
    setResults({
      averageCost,
      optimalInventory,
      evaluation
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>適正在庫シミュレーター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">原価率（%）</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={costRatio}
                onChange={(e) => setCostRatio(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">現在の在庫金額（原価）</label>
              <Input
                type="number"
                value={currentInventory}
                onChange={(e) => setCurrentInventory(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">リードタイム（月）</label>
              <Input
                type="number"
                step="0.1"
                value={leadTime}
                onChange={(e) => setLeadTime(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">安全在庫係数</label>
              <Input
                type="number"
                step="0.1"
                value={safetyStock}
                onChange={(e) => setSafetyStock(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 売上データ入力 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">月次売上データ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {salesData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium block">{data.month}</label>
                  <Input
                    type="number"
                    value={data.amount}
                    onChange={(e) => {
                      const newData = [...salesData];
                      newData[index].amount = Number(e.target.value);
                      setSalesData(newData);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={calculateOptimalInventory} className="w-full">
            計算する
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>計算結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>{results.evaluation}</AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">平均月間原価：</span>
                <span className="text-lg font-semibold">{formatCurrency(results.averageCost)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">適正在庫金額（原価）：</span>
                <span className="text-lg font-semibold">{formatCurrency(results.optimalInventory)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventorySimulator;