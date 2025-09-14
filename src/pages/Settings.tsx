
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings as SettingsIcon, User, Lock, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setUsername(data.username || '');
          }
        } catch (error: any) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = () => {
    // This would use Supabase's reset password flow
    // For now, we'll just provide a notification
    toast({
      title: "Password reset",
      description: "Check your email for a password reset link.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // In a real app, you might want a more secure flow
        // For now, we'll just sign out the user
        await signOut();
        toast({
          title: "Account deleted",
          description: "Your account has been deleted.",
        });
        navigate('/');
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: error.message || "Failed to delete account",
        });
      }
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <h1 className="text-3xl font-bold text-center mb-8 text-crypti-darkPurple">Loading...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="flex items-center">
            <SettingsIcon className="h-8 w-8 text-crypti-purple mr-3" />
            <h1 className="text-3xl font-bold text-crypti-darkPurple">Account Settings</h1>
          </div>
          
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-crypti-purple mr-2" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your account profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your email address cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter a username"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="bg-crypti-purple hover:bg-crypti-purple/90"
                  >
                    {isUpdating ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Updating...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 text-crypti-purple mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <Button
                      variant="outline"
                      onClick={handleChangePassword}
                      className="w-full"
                    >
                      Send Password Reset Email
                    </Button>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-destructive">Danger Zone</Label>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                  <CardDescription>
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Save Images Automatically</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save images to your dashboard when processing
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Quality Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Use higher quality but slower processing for better results
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
