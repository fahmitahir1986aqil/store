/**
 * Options page for managing item types and departments
 */

import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Edit, Trash2, Settings, Package, Building } from 'lucide-react';

export default function Options() {
  const { itemTypes, departments, setItemTypes, setDepartments } = useInventory();
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [typeName, setTypeName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [error, setError] = useState('');

  /**
   * Handle add/edit item type
   */
  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!typeName.trim()) {
      setError('Type name is required');
      return;
    }

    if (editingType) {
      // Edit existing type
      setItemTypes(prev => 
        prev.map(type => 
          type.id === editingType 
            ? { ...type, name: typeName.trim() }
            : type
        )
      );
    } else {
      // Add new type
      const newType = {
        id: Date.now().toString(),
        name: typeName.trim(),
      };
      setItemTypes(prev => [...prev, newType]);
    }

    setTypeName('');
    setEditingType(null);
    setIsTypeDialogOpen(false);
  };

  /**
   * Handle add/edit department
   */
  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deptName.trim()) {
      setError('Department name is required');
      return;
    }

    if (editingDept) {
      // Edit existing department
      setDepartments(prev => 
        prev.map(dept => 
          dept.id === editingDept 
            ? { ...dept, name: deptName.trim() }
            : dept
        )
      );
    } else {
      // Add new department
      const newDept = {
        id: Date.now().toString(),
        name: deptName.trim(),
      };
      setDepartments(prev => [...prev, newDept]);
    }

    setDeptName('');
    setEditingDept(null);
    setIsDeptDialogOpen(false);
  };

  /**
   * Handle edit type
   */
  const handleEditType = (type: any) => {
    setTypeName(type.name);
    setEditingType(type.id);
    setIsTypeDialogOpen(true);
  };

  /**
   * Handle edit department
   */
  const handleEditDept = (dept: any) => {
    setDeptName(dept.name);
    setEditingDept(dept.id);
    setIsDeptDialogOpen(true);
  };

  /**
   * Handle delete type
   */
  const handleDeleteType = (id: string) => {
    if (confirm('Are you sure you want to delete this item type?')) {
      setItemTypes(prev => prev.filter(type => type.id !== id));
    }
  };

  /**
   * Handle delete department
   */
  const handleDeleteDept = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    }
  };

  /**
   * Reset form
   */
  const resetForm = () => {
    setTypeName('');
    setDeptName('');
    setEditingType(null);
    setEditingDept(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Options</h1>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-gray-600" />
          <span className="text-sm text-gray-600">System Configuration</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Item Types Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Types
            </CardTitle>
            <CardDescription>
              Manage item types for consumable categorization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? 'Edit Item Type' : 'Add New Item Type'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveType} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="typeName">Type Name</Label>
                      <Input
                        id="typeName"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                        placeholder="Enter item type name"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingType ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemTypes.map(type => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditType(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteType(type.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {itemTypes.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No item types configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Departments Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Departments
            </CardTitle>
            <CardDescription>
              Manage departments for inventory allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingDept ? 'Edit Department' : 'Add New Department'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveDept} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="deptName">Department Name</Label>
                      <Input
                        id="deptName"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDept ? 'Update' : 'Add'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDept(dept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDept(dept.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {departments.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No departments configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Current system configuration and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Item Types</div>
              <div className="text-2xl font-bold text-blue-800">{itemTypes.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Departments</div>
              <div className="text-2xl font-bold text-green-800">{departments.length}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">System Version</div>
              <div className="text-2xl font-bold text-purple-800">v1.0.0</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
