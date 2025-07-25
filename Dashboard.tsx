/**
 * Dashboard page with charts and alerts
 */

import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, AlertTriangle, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { items, transactions, getExpiryAlerts, getLowStockAlerts, departments } = useInventory();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');

  const expiryAlerts = getExpiryAlerts();
  const lowStockAlerts = getLowStockAlerts();

  // Generate chart data for stock movements
  const generateChartData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = monthNames.map((month, index) => {
      const monthTransactions = transactions.filter(trans => {
        const transDate = new Date(trans.date);
        return transDate.getFullYear() === parseInt(selectedYear) && 
               transDate.getMonth() === index;
      });

      const stockIn = monthTransactions
        .filter(trans => trans.type === 'in')
        .reduce((sum, trans) => sum + trans.quantity, 0);
      
      const stockOut = monthTransactions
        .filter(trans => trans.type === 'out')
        .reduce((sum, trans) => sum + trans.quantity, 0);

      return {
        month,
        stockIn,
        stockOut,
      };
    });

    return data;
  };

  // Generate pie chart data for spending by department
  const generateSpendingData = () => {
    const spendingByDept = departments.map(dept => {
      const deptItems = items.filter(item => item.department === dept.name);
      const totalSpending = deptItems.reduce((sum, item) => {
        const outTransactions = transactions.filter(trans => 
          trans.itemId === item.id && trans.type === 'out'
        );
        return sum + outTransactions.reduce((transSum, trans) => 
          transSum + (trans.quantity * item.pricePerPiece), 0
        );
      }, 0);

      return {
        name: dept.name,
        value: totalSpending,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      };
    }).filter(dept => dept.value > 0);

    return spendingByDept;
  };

  const chartData = generateChartData();
  const spendingData = generateSpendingData();

  // Calculate key metrics
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.pricePerPiece), 0);
  const criticalAlerts = expiryAlerts.filter(alert => alert.status === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement - {selectedYear}</CardTitle>
            <CardDescription>Monthly stock in and out movements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stockIn" fill="#22c55e" name="Stock In" />
                <Bar dataKey="stockOut" fill="#ef4444" name="Stock Out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Department</CardTitle>
            <CardDescription>Total spending breakdown by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: RM ${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `RM ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Expiry Alerts
            </CardTitle>
            <CardDescription>Items expiring within 60 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {expiryAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No expiry alerts</p>
              ) : (
                expiryAlerts.map((alert) => (
                  <Alert key={alert.item.id} className={
                    alert.status === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <AlertDescription className="flex items-center justify-between">
                      <span>{alert.item.name}</span>
                      <Badge variant={
                        alert.status === 'critical' ? 'destructive' :
                        alert.status === 'warning' ? 'secondary' : 'default'
                      }>
                        {alert.daysLeft} days left
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStockAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No low stock alerts</p>
              ) : (
                lowStockAlerts.map((item) => (
                  <Alert key={item.id} className="border-orange-200 bg-orange-50">
                    <AlertDescription className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <Badge variant="secondary">
                        {item.currentStock} / {item.lowStockAlert}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
