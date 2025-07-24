import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getAdminQueryFn } from "@/lib/queryClient";
import { Code, Save, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CustomScript {
  id: number;
  name: string;
  description: string;
  script: string;
  location: 'head' | 'body_start' | 'body_end';
  isActive: boolean;
  createdAt: string;
}

export default function CustomScriptsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingScript, setEditingScript] = useState<CustomScript | null>(null);
  const [previewScript, setPreviewScript] = useState<CustomScript | null>(null);

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/custom-scripts"],
    queryFn: getAdminQueryFn,
  }) as { data: CustomScript[]; isLoading: boolean };

  const createScriptMutation = useMutation({
    mutationFn: async (data: Omit<CustomScript, 'id' | 'createdAt'>) => {
      return apiRequest("POST", "/api/admin/custom-scripts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-scripts"] });
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Custom script created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create custom script",
        variant: "destructive",
      });
    },
  });

  const updateScriptMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CustomScript> & { id: number }) => {
      return apiRequest("PUT", `/api/admin/custom-scripts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-scripts"] });
      setEditingScript(null);
      toast({
        title: "Success",
        description: "Custom script updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update custom script",
        variant: "destructive",
      });
    },
  });

  const deleteScriptMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/custom-scripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-scripts"] });
      toast({
        title: "Success",
        description: "Custom script deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete custom script",
        variant: "destructive",
      });
    },
  });

  const toggleScriptStatus = (script: CustomScript) => {
    updateScriptMutation.mutate({
      id: script.id,
      isActive: !script.isActive
    });
  };

  const getLocationBadge = (location: string) => {
    const variants = {
      'head': 'bg-blue-100 text-blue-800',
      'body_start': 'bg-green-100 text-green-800',
      'body_end': 'bg-purple-100 text-purple-800'
    };
    const labels = {
      'head': 'Head',
      'body_start': 'Body Start',
      'body_end': 'Body End'
    };
    return (
      <Badge className={variants[location as keyof typeof variants]}>
        {labels[location as keyof typeof labels]}
      </Badge>
    );
  };

  const ScriptForm = ({ script, onSubmit, onCancel }: {
    script?: CustomScript;
    onSubmit: (data: Omit<CustomScript, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: script?.name || '',
      description: script?.description || '',
      script: script?.script || '',
      location: script?.location || 'head' as 'head' | 'body_start' | 'body_end',
      isActive: script?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {script ? 'Edit Custom Script' : 'Add New Custom Script'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Script Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Google Analytics, Chatbot Widget"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="head">Head Section</option>
                  <option value="body_start">Body Start</option>
                  <option value="body_end">Body End</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this script does"
              />
            </div>

            <div>
              <Label htmlFor="script">Script Code</Label>
              <Textarea
                id="script"
                value={formData.script}
                onChange={(e) => setFormData(prev => ({ ...prev, script: e.target.value }))}
                placeholder="Paste your HTML, CSS, or JavaScript code here..."
                rows={8}
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Include full script tags (e.g., &lt;script&gt;...&lt;/script&gt;, &lt;style&gt;...&lt;/style&gt;)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Enable this script</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {script ? 'Update Script' : 'Create Script'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (isCreating || editingScript) {
    return (
      <div className="space-y-6">
        <ScriptForm
          script={editingScript || undefined}
          onSubmit={(data) => {
            if (editingScript) {
              updateScriptMutation.mutate({ id: editingScript.id, ...data });
            } else {
              createScriptMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingScript(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Scripts Management</h2>
          <p className="text-gray-600">Manage chatbot widgets, analytics codes, and custom scripts</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Script
        </Button>
      </div>

      <div className="grid gap-4">
        {scripts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No custom scripts configured yet.</p>
              <p className="text-sm text-gray-400 mb-4">Add chatbot widgets, analytics codes, or custom scripts.</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Script
              </Button>
            </CardContent>
          </Card>
        ) : (
          scripts.map((script) => (
            <Card key={script.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {script.name}
                      {script.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                      {getLocationBadge(script.location)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{script.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewScript(script)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleScriptStatus(script)}
                    >
                      {script.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingScript(script)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Custom Script</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{script.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteScriptMutation.mutate(script.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Script Preview Dialog */}
      {previewScript && (
        <AlertDialog open={!!previewScript} onOpenChange={() => setPreviewScript(null)}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Script Preview: {previewScript.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Location: {previewScript.location} | Status: {previewScript.isActive ? 'Active' : 'Inactive'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96 font-mono">
                {previewScript.script}
              </pre>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPreviewScript(null)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}