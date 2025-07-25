/**
 * Stock In page for adding stock to inventory
 */

import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Scan, Plus, Package, Calendar } from 'lucide-react';

export default function StockIn() {
  const { items, transactions, addTransaction, findItemByBarcode } = useInventory();
  const [barcode, setBarcode] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle barcode scan/input
   */
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    
    const item = findItemByBarcode(barcode.trim());
    if (item) {
      setSelectedItem(item);
      setError('');
    } else {
      setError(`Item not found with barcode: ${barcode}. Please check the barcode and try again.`);
    }
  };

  /**
   * Handle stock in submission
   */
  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity) {
      setError('Please select an item and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    addTransaction({
      itemId: selectedItem.id,
      type: 'in',
      quantity: qty,
      notes: notes || undefined,
    });

    // Reset form
    setSelectedItem(null);
    setQuantity('');
    setNotes('');
    setBarcode('');
    setError('');
    
    alert('Stock added successfully!');
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setSelectedItem(null);
    setQuantity('');
    setNotes('');
    setBarcode('');
    setError('');
  };

  // Get recent stock in transactions
  const recentTransactions = transactions
    .filter(t => t.type === 'in')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Stock In</h1>
        <Button
          variant="outline"
          onClick={() => setIsManualMode(!isManualMode)}
        >
          {isManualMode ? 'Scanner Mode' : 'Manual Mode'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock In Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Stock
            </CardTitle>
            <CardDescription>
              {isManualMode ? 'Enter barcode manually' : 'Scan barcode to add stock'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Barcode Input */}
            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder={isManualMode ? 'Enter barcode manually' : 'Scan barcode...'}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline">
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Select - Development Helper */}
            {items.length > 0 && (
              <div className="space-y-2">
                <Label>Quick Select (for testing)</Label>
                <div className="flex flex-wrap gap-2">
                  {items.slice(0, 5).map(item => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBarcode(item.barcode)}
                      className="text-xs"
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Info */}
            <div className="bg-gray-100 p-2 rounded text-xs">
              <div>Total items: {items.length}</div>
              <div>Current barcode: "{barcode}"</div>
              {items.length > 0 && (
                <div>Sample barcodes: {items.slice(0, 3).map(item => item.barcode).join(', ')}</div>
              )}
            </div>

            {/* Selected Item Info */}
            {selectedItem && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold">Selected Item</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      {selectedItem.image ? (
                        <img 
                          src={selectedItem.image} 
                          alt={selectedItem.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{selectedItem.name}</h4>
                        <p className="text-sm text-gray-600">{selectedItem.type}</p>
                        <p className="text-sm text-gray-600">{selectedItem.department}</p>
                        <Badge variant="outline">
                          Current Stock: {selectedItem.currentStock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock In Form */}
                <form onSubmit={handleStockIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Add</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this stock in"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Add Stock
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Stock In
            </CardTitle>
            <CardDescription>
              Latest stock in transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map(transaction => {
                  const item = items.find(i => i.id === transaction.itemId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item?.name}</div>
                          <div className="text-sm text-gray-600">{item?.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">+{transaction.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {transaction.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent stock in transactions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
