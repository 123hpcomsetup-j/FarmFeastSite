import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSiteSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Edit, RefreshCw, Settings, Phone, Mail, MapPin, Clock } from "lucide-react";

type SiteSettingsForm = z.infer<typeof insertSiteSettingsSchema>;

export default function SiteSettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/site-settings"],
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const form = useForm<SiteSettingsForm>({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SiteSettingsForm) => {
      return apiRequest("POST", "/api/admin/site-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Success", description: "Setting created successfully" });
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create setting",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SiteSettingsForm }) => {
      return apiRequest("PUT", `/api/admin/site-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-settings"] });
      toast({ title: "Success", description: "Setting updated successfully" });
      setEditingSetting(null);
      setShowForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SiteSettingsForm) => {
    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (setting: any) => {
    setEditingSetting(setting);
    form.reset({
      key: setting.key,
      value: setting.value,
      description: setting.description,
    });
    setShowForm(true);
  };

  const predefinedSettings = [
    { key: "site_name", placeholder: "Farm Feast Farmhouse", icon: Settings },
    { key: "site_description", placeholder: "Luxury farmhouse rental for unforgettable experiences", icon: Settings },
    { key: "contact_phone", placeholder: "+91 9876543210", icon: Phone },
    { key: "contact_email", placeholder: "info@farmfeastfarmhouse.com", icon: Mail },
    { key: "contact_address", placeholder: "123 Rural Road, Village Name, State 12345", icon: MapPin },
    { key: "whatsapp_number", placeholder: "+91 9876543210", icon: Phone },
    { key: "upi_id", placeholder: "ybl@ybl", icon: Settings },
    { key: "business_hours", placeholder: "24/7 Available", icon: Clock },
    { key: "booking_email", placeholder: "bookings@farmfeastfarmhouse.com", icon: Mail },
    { key: "emergency_contact", placeholder: "+91 9876543210", icon: Phone },
    { key: "social_facebook", placeholder: "https://facebook.com/farmfeastfarmhouse", icon: Settings },
    { key: "social_instagram", placeholder: "https://instagram.com/farmfeastfarmhouse", icon: Settings },
    { key: "social_twitter", placeholder: "https://twitter.com/farmfeastfarmhouse", icon: Settings },
  ];

  const getIcon = (key: string) => {
    const setting = predefinedSettings.find(s => s.key === key);
    const IconComponent = setting?.icon || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPlaceholder = (key: string) => {
    const setting = predefinedSettings.find(s => s.key === key);
    return setting?.placeholder || "Enter value";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading site settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>
          <p className="text-gray-600">Manage global site configuration and contact information</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSetting(null);
            form.reset();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Setting
        </Button>
      </div>

      {/* Quick Setup for Common Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedSettings.map((setting) => {
              const existingSetting = settings?.find((s: any) => s.key === setting.key);
              return (
                <Button
                  key={setting.key}
                  variant={existingSetting ? "secondary" : "outline"}
                  className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                  onClick={() => {
                    if (existingSetting) {
                      handleEdit(existingSetting);
                    } else {
                      form.reset({
                        key: setting.key,
                        value: "",
                        description: setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                      });
                      setEditingSetting(null);
                      setShowForm(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <setting.icon className="h-4 w-4" />
                    <span className="font-medium">{setting.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full">
                    {existingSetting ? existingSetting.value : "Not configured"}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSetting ? "Edit Setting" : "Add New Setting"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setting Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., contact_phone, site_name" 
                          {...field} 
                          disabled={!!editingSetting}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Use lowercase letters, numbers, and underscores only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={getPlaceholder(form.watch("key"))}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of this setting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSetting ? "Update Setting" : "Create Setting"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingSetting(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings?.map((setting: any) => (
                <TableRow key={setting.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIcon(setting.key)}
                      <span className="font-mono text-sm">{setting.key}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={setting.value}>
                      {setting.value || <span className="text-gray-400">No value</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={setting.description}>
                      {setting.description || <span className="text-gray-400">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(setting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No settings found. Use the quick setup above to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}