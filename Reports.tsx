/**
 * Reports page for generating and downloading reports
 */

import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { FileText, Download, AlertTriangle, TrendingDown, TrendingUp, Calendar } from 'lucide-react';

export default function Reports() {
  const { items, transactions, getExpiryAlerts, getLowStockAlerts } = useInventory();
  const [reportType, setReportType] = useState('low-stock');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  /**
   * Generate CSV content
   */
  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    return csvContent;
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Generate Low Stock Report
   */
  const generateLowStockReport = () => {
    const lowStockItems = getLowStockAlerts();
    const headers = ['name', 'type', 'department', 'currentStock', 'lowStockAlert', 'pricePerPiece'];
    const csvContent = generateCSV(lowStockItems, headers);
    downloadCSV(csvContent, 'low-stock-report.csv');
  };

  /**
   * Generate Expiry Report
   */
  const generateExpiryReport = () => {
    const expiryAlerts = getExpiryAlerts();
    const data = expiryAlerts.map(alert => ({
      name: alert.item.name,
      type: alert.item.type,
      department: alert.item.department,
      daysLeft: alert.daysLeft,
      status: alert.status,
      expiryDays: alert.item.expiryDays,
      currentStock: alert.item.currentStock,
    }));
    const headers = ['name', 'type', 'department', 'daysLeft', 'status', 'expiryDays', 'currentStock'];
    const csvContent = generateCSV(data, headers);
    downloadCSV(csvContent, 'expiry-report.csv');
  };

  /**
   * Generate Stock In Report
   */
  const generateStockInReport = () => {
    const stockInTransactions = transactions.filter(t => t.type === 'in').map(trans => {
      const item = items.find(i => i.id === trans.itemId);
      return {
        itemName: item?.name || 'Unknown',
        itemType: item?.type || 'Unknown',
        department: item?.department || 'Unknown',
        quantity: trans.quantity,
        date: new Date(trans.date).toLocaleDateString(),
        notes: trans.notes || '',
      };
    });
    const headers = ['itemName', 'itemType', 'department', 'quantity', 'date', 'notes'];
    const csvContent = generateCSV(stockInTransactions, headers);
    downloadCSV(csvContent, 'stock-in-report.csv');
  };

  /**
   * Generate Stock Out Report
   */
  const generateStockOutReport = () => {
    const stockOutTransactions = transactions.filter(t => t.type === 'out').map(trans => {
      const item = items.find(i => i.id === trans.itemId);
      return {
        itemName: item?.name || 'Unknown',
        itemType: item?.type || 'Unknown',
        department: item?.department || 'Unknown',
        quantity: trans.quantity,
        picName: trans.picName || '',
        date: new Date(trans.date).toLocaleDateString(),
        notes: trans.notes || '',
      };
    });
    const headers = ['itemName', 'itemType', 'department', 'quantity', 'picName', 'date', 'notes'];
    const csvContent = generateCSV(stockOutTransactions, headers);
    downloadCSV(csvContent, 'stock-out-report.csv');
  };

  const lowStockItems = getLowStockAlerts();
  const expiryAlerts = getExpiryAlerts();
  const stockInTransactions = transactions.filter(t => t.type === 'in').slice(0, 10);
  const stockOutTransactions = transactions.filter(t => t.type === 'out').slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <Button onClick={generateLowStockReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Low Stock
          </Button>
          <Button onClick={generateExpiryReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Expiry
          </Button>
          <Button onClick={generateStockInReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Stock In
          </Button>
          <Button onClick={generateStockOutReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={generateLowStockReport}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiry Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiryAlerts.length}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={generateExpiryReport}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.type === 'in').length}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={generateStockInReport}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out Count</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.type === 'out').length}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={generateStockOutReport}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Low Stock Report
            </CardTitle>
            <CardDescription>Items below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.slice(0, 5).map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{item.currentStock}</Badge>
                    </TableCell>
                    <TableCell>{item.lowStockAlert}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Low Stock</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {lowStockItems.length === 0 && (
              <div className="text-center py-4 text-gray-500">No low stock items</div>
            )}
          </CardContent>
        </Card>

        {/* Expiry Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Expiry Report
            </CardTitle>
            <CardDescription>Items expiring within 60 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiryAlerts.slice(0, 5).map(alert => (
                  <TableRow key={alert.item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.item.name}</div>
                        <div className="text-sm text-gray-600">{alert.item.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>{alert.daysLeft}</TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.status === 'critical' ? 'destructive' :
                        alert.status === 'warning' ? 'secondary' : 'default'
                      }>
                        {alert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {expiryAlerts.length === 0 && (
              <div className="text-center py-4 text-gray-500">No expiry alerts</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock In */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Recent Stock In
            </CardTitle>
            <CardDescription>Latest stock in transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockInTransactions.map(trans => {
                  const item = items.find(i => i.id === trans.itemId);
                  return (
                    <TableRow key={trans.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item?.name}</div>
                          <div className="text-sm text-gray-600">{item?.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">+{trans.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(trans.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {stockInTransactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">No stock in transactions</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Out */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Recent Stock Out
            </CardTitle>
            <CardDescription>Latest stock out transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockOutTransactions.map(trans => {
                  const item = items.find(i => i.id === trans.itemId);
                  return (
                    <TableRow key={trans.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item?.name}</div>
                          <div className="text-sm text-gray-600">{item?.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">-{trans.quantity}</Badge>
                      </TableCell>
                      <TableCell>{trans.picName}</TableCell>
                      <TableCell>
                        {new Date(trans.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {stockOutTransactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">No stock out transactions</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
