"use client";

import { useState, useEffect } from "react";
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
  PieChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import { getUserGoals } from "@/services/goals";
import { getUserInvestments } from "@/services/investments";
import { getTransactionSummary } from "@/services/transactions";
import { getUserCategories } from "@/services/categories";
import type { UserGoal, UserInvestment } from "@/types";

// Investment growth rates (annual)
const EQUITY_ANNUAL_RATE = 0.12; // 12% annual for equity
const DEBT_ANNUAL_RATE = 0.07; // 7% annual for debt

interface GoalWithInvestment extends UserGoal {
  investment?: UserInvestment;
}

const COLORS = {
  equity: "#10b981", // green
  debt: "#3b82f6", // blue
};

export default function SurplusPage() {
  const [goals, setGoals] = useState<GoalWithInvestment[]>([]);
  const [excessMoney, setExcessMoney] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch goals
      const userGoals = await getUserGoals();
      
      // Fetch investments
      const investments = await getUserInvestments();
      
      // Combine goals with their investments
      const goalsWithInvestments: GoalWithInvestment[] = userGoals.map((goal) => ({
        ...goal,
        investment: investments.find((inv) => inv.goal_id === goal.id),
      }));

      setGoals(goalsWithInvestments);

      // Calculate total invested (sum of current_amount for all goals)
      const invested = goalsWithInvestments.reduce(
        (sum, goal) => sum + (goal.current_amount || 0),
        0
      );
      setTotalInvested(invested);

      // Calculate excess money
      // Excess = Total Income - Total Expenses - Budgeted Categories
      const transactionSummary = await getTransactionSummary();
      const categories = await getUserCategories();
      
      const totalIncome = transactionSummary.totalInflow;
      const totalExpenses = transactionSummary.totalOutflow;
      const budgetedAmount = categories.reduce((sum, cat) => sum + (cat.size || 0), 0);
      
      const excess = totalIncome - totalExpenses - budgetedAmount;
      setExcessMoney(Math.max(0, excess));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate forecast data for a goal
  const calculateForecast = (goal: GoalWithInvestment, months: number = 12) => {
    if (!goal.investment) return [];

    const monthlyEquityRate = EQUITY_ANNUAL_RATE / 12;
    const monthlyDebtRate = DEBT_ANNUAL_RATE / 12;

    const equityPercentage = goal.investment.percentage_equity / 100;
    const debtPercentage = goal.investment.percentage_debt / 100;

    // Weighted average monthly return
    const monthlyReturnRate = (equityPercentage * monthlyEquityRate) + (debtPercentage * monthlyDebtRate);

    const data = [];
    let currentValue = goal.current_amount;
    const monthlyContribution = excessMoney > 0 ? excessMoney / goals.length : 0;

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    for (let i = 0; i < months; i++) {
      const growth = currentValue * monthlyReturnRate;
      currentValue += growth + monthlyContribution;
      
      data.push({
        month: monthNames[i % 12],
        value: Math.round(currentValue),
        equity: Math.round(currentValue * equityPercentage),
        debt: Math.round(currentValue * debtPercentage),
      });
    }

    return data;
  };

  // Calculate total forecast across all goals
  const calculateTotalForecast = (months: number = 12) => {
    const data = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    for (let i = 0; i < months; i++) {
      let totalValue = 0;
      let totalEquity = 0;
      let totalDebt = 0;

      goals.forEach((goal) => {
        if (!goal.investment) return;

        const forecast = calculateForecast(goal, i + 1);
        if (forecast.length > 0) {
          const lastPoint = forecast[forecast.length - 1];
          totalValue += lastPoint.value;
          totalEquity += lastPoint.equity;
          totalDebt += lastPoint.debt;
        }
      });

      data.push({
        month: monthNames[i % 12],
        value: Math.round(totalValue),
        equity: Math.round(totalEquity),
        debt: Math.round(totalDebt),
      });
    }

    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate investment allocation pie chart data
  const getInvestmentAllocation = () => {
    let totalEquity = 0;
    let totalDebt = 0;

    goals.forEach((goal) => {
      if (!goal.investment) return;
      
      const equityAmount = goal.current_amount * (goal.investment.percentage_equity / 100);
      const debtAmount = goal.current_amount * (goal.investment.percentage_debt / 100);
      
      totalEquity += equityAmount;
      totalDebt += debtAmount;
    });

    return [
      { name: "Equity", value: Math.round(totalEquity), color: COLORS.equity },
      { name: "Debt", value: Math.round(totalDebt), color: COLORS.debt },
    ];
  };

  // Calculate weighted average growth rate
  const getWeightedGrowthRate = () => {
    if (goals.length === 0 || totalInvested === 0) return 7.2;

    let weightedRate = 0;

    goals.forEach((goal) => {
      if (!goal.investment || goal.current_amount === 0) return;

      const equityRate = EQUITY_ANNUAL_RATE * (goal.investment.percentage_equity / 100);
      const debtRate = DEBT_ANNUAL_RATE * (goal.investment.percentage_debt / 100);
      const combinedRate = equityRate + debtRate;

      const weight = goal.current_amount / totalInvested;
      weightedRate += combinedRate * weight;
    });

    return weightedRate * 100; // Convert to percentage
  };

  const forecastData = calculateTotalForecast(12);
  const allocationData = getInvestmentAllocation();
  const growthRate = getWeightedGrowthRate();
  const monthlyContribution = goals.length > 0 ? excessMoney / goals.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investment data...</p>
        </div>
      </div>
    );
  }

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
            Track your investments and forecast growth across all goals
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
                {formatCurrency(totalInvested)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {goals.length} goal{goals.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Growth Rate Card */}
          <Card className="border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weighted Growth Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {growthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Annual (weighted)
              </p>
            </CardContent>
          </Card>

          {/* Monthly Investment Card */}
          <Card className="border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Per Goal Investment
              </CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(monthlyContribution)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly per goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Investment Allocations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Investment Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Investment Allocation
                </CardTitle>
                <CardDescription>
                  Overall equity vs debt split
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goals with Investments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goals & Investments</CardTitle>
                <CardDescription>
                  Investment allocation per goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No goals with investments yet
                  </p>
                ) : (
                  goals.map((goal) => {
                    if (!goal.investment) return null;
                    
                    return (
                      <div key={goal.id} className="space-y-2 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{goal.name}</h4>
                          <Badge variant="secondary">
                            {formatCurrency(goal.current_amount)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Equity</span>
                            <span className="font-medium text-green-600">
                              {goal.investment.percentage_equity}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Debt</span>
                            <span className="font-medium text-blue-600">
                              {goal.investment.percentage_debt}%
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                          <div
                            className="bg-green-600"
                            style={{ width: `${goal.investment.percentage_equity}%` }}
                          />
                          <div
                            className="bg-blue-600"
                            style={{ width: `${goal.investment.percentage_debt}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forecast Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investment Forecast
                </CardTitle>
                <CardDescription>
                  12-month projection across all goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={forecastData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.equity} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.equity} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.debt} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.debt} stopOpacity={0} />
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
                        dataKey="equity"
                        stackId="1"
                        stroke={COLORS.equity}
                        fill="url(#colorEquity)"
                        name="Equity"
                      />
                      <Area
                        type="monotone"
                        dataKey="debt"
                        stackId="1"
                        stroke={COLORS.debt}
                        fill="url(#colorDebt)"
                        name="Debt"
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
