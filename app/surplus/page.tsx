"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  Zap,
  BarChart3,
  Target,
  PiggyBank,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock data - replace with real data from your backend
const generateMockGrowthData = () => {
  const data = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let baseAmount = 5000;
  
  for (let i = 0; i < 12; i++) {
    const growth = baseAmount * 0.07; // 7% monthly growth (annualized ~10%)
    baseAmount += growth;
    data.push({
      month: months[i],
      invested: Math.round(baseAmount),
      growth: Math.round(growth),
    });
  }
  
  return data;
};

const MOCK_DATA = {
  excessMoney: 8500,
  investedAmount: 53600,
  monthlyInvestment: 1200,
  growthRate: 7.2, // Annual percentage
  autoInvestEnabled: true,
  growthData: generateMockGrowthData(),
};

export default function SurplusPage() {
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(
    MOCK_DATA.autoInvestEnabled
  );
  const [excessMoney] = useState(MOCK_DATA.excessMoney);
  const [investedAmount] = useState(MOCK_DATA.investedAmount);
  const growthData = MOCK_DATA.growthData;

  const totalValue = excessMoney + investedAmount;
  const projectedGrowth = investedAmount * (MOCK_DATA.growthRate / 100 / 12);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <PiggyBank className="h-8 w-8 text-primary" />
            Surplus Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Automatically invest your excess money into index funds
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Excess Money Card */}
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Excess Money Available
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(excessMoney)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to invest
              </p>
            </CardContent>
          </Card>

          {/* Total Invested Card */}
          <Card className="border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invested
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(investedAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In index funds
              </p>
            </CardContent>
          </Card>

          {/* Growth Rate Card */}
          <Card className="border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Annual Growth Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {MOCK_DATA.growthRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Historical average
              </p>
            </CardContent>
          </Card>

          {/* Monthly Investment Card */}
          <Card className="border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Auto-Invest
              </CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(MOCK_DATA.monthlyInvestment)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {autoInvestEnabled ? "Active" : "Disabled"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Auto Investment Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Auto Investment Toggle Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Auto-Investment Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic index fund investments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Auto-Invest Status</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically invest excess money
                    </p>
                  </div>
                  <Button
                    variant={autoInvestEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoInvestEnabled(!autoInvestEnabled)}
                  >
                    {autoInvestEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                {autoInvestEnabled && (
                  <>
                    <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Investment Strategy</span>
                        <Badge variant="secondary">Index Funds</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Diversified portfolio of low-cost index funds
                      </p>
                    </div>

                    <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Monthly Amount</span>
                        <span className="text-sm font-bold">
                          {formatCurrency(MOCK_DATA.monthlyInvestment)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically invested each month
                      </p>
                    </div>

                    <div className="space-y-2 rounded-lg border p-4 bg-green-500/10 border-green-500/20">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Next Investment
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {excessMoney >= MOCK_DATA.monthlyInvestment
                          ? `$${MOCK_DATA.monthlyInvestment.toLocaleString()} will be invested automatically`
                          : `Waiting for ${formatCurrency(MOCK_DATA.monthlyInvestment - excessMoney)} more`}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investment Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Portfolio Value</span>
                  <span className="font-semibold">{formatCurrency(totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Projected Monthly Growth</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(projectedGrowth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Annual Return</span>
                  <span className="font-semibold">
                    {formatCurrency(investedAmount * (MOCK_DATA.growthRate / 100))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Growth Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investment Growth Progress
                </CardTitle>
                <CardDescription>
                  Track your investment growth over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={growthData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorInvested"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorInvested)"
                        name="Total Invested"
                      />
                      <Line
                        type="monotone"
                        dataKey="growth"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Monthly Growth"
                        dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
