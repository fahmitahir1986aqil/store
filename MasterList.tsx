/**
 * Master List page for item registration and management
 */

import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Edit, Trash2, Package, Camera, Upload, Printer, Search } from 'lucide-react';

export default function MasterList() {
  const { items, itemTypes, departments, addItem, updateItem, deleteItem } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    department: '',
    hasExpiry: false,
    expiryDays: '',
    image: '',
    pricePerPiece: '',
    currentStock: '',
    lowStockAlert: '',
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle image upload
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      type: formData.type,
      department: formData.department,
      hasExpiry: formData.hasExpiry,
      expiryDays: formData.hasExpiry ? parseInt(formData.expiryDays) : undefined,
      image: formData.image,
      pricePerPiece: parseFloat(formData.pricePerPiece),
      currentStock: parseInt(formData.currentStock),
      lowStockAlert: parseInt(formData.lowStockAlert),
    };

    if (editingItem) {
      updateItem(editingItem, itemData);
    } else {
      addItem(itemData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      department: '',
      hasExpiry: false,
      expiryDays: '',
      image: '',
      pricePerPiece: '',
      currentStock: '',
      lowStockAlert: '',
    });
    setEditingItem(null);
  };

  /**
   * Handle edit item
   */
  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      type: item.type,
      department: item.department,
      hasExpiry: item.hasExpiry,
      expiryDays: item.expiryDays?.toString() || '',
      image: item.image || '',
      pricePerPiece: item.pricePerPiece.toString(),
      currentStock: item.currentStock.toString(),
      lowStockAlert: item.lowStockAlert.toString(),
    });
    setEditingItem(item.id);
    setIsDialogOpen(true);
  };

  /**
   * Handle delete item
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  /**
   * Print label function
   */
  const printLabel = (item: any) => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Item Label</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 2px solid #000; padding: 10px; width: 200px; }
            .barcode { font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="label">
            <h3>${item.name}</h3>
            <p>Type: ${item.type}</p>
            <p>Dept: ${item.department}</p>
            <p>Price: RM ${item.pricePerPiece}</p>
            <div class="barcode">||||| ${item.barcode} |||||</div>
          </div>
        </body>
      </html>
    `);
    printWindow?.print();
  };

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Master List</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Item Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map(type => (
                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Piece (RM)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.pricePerPiece}
                    onChange={(e) => handleInputChange('pricePerPiece', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExpiry"
                    checked={formData.hasExpiry}
                    onCheckedChange={(checked) => handleInputChange('hasExpiry', checked as boolean)}
                  />
                  <Label htmlFor="hasExpiry">Has Expiry Date</Label>
                </div>
                {formData.hasExpiry && (
                  <div className="ml-6">
                    <Label htmlFor="expiryDays">Expiry Days</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      value={formData.expiryDays}
                      onChange={(e) => handleInputChange('expiryDays', e.target.value)}
                      placeholder="Number of days until expiry"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={(e) => handleInputChange('lowStockAlert', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Item Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items List</CardTitle>
          <CardDescription>
            Manage all consumable items and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>RM {item.pricePerPiece.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.currentStock <= item.lowStockAlert ? "destructive" : "default"}>
                      {item.currentStock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.hasExpiry ? (
                      <Badge variant="secondary">{item.expiryDays} days</Badge>
                    ) : (
                      <Badge variant="outline">No expiry</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.barcode}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printLabel(item)}
                        title="Print Label"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
