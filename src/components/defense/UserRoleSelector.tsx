import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole, ClassificationLevel } from '@/types/defense';
import { useDefenseAuth } from '@/hooks/useDefenseAuth';
import { Shield, Users, Eye, Settings } from 'lucide-react';

interface UserProfile {
  role: UserRole;
  clearance: ClassificationLevel;
  department: string;
  email: string;
  description: string;
  icon: React.ComponentType<any>;
}

const userProfiles: UserProfile[] = [
  {
    role: 'admin',
    clearance: 'TOP_SECRET',
    department: 'Information Systems',
    email: 'admin@defense.gov',
    description: 'Full system access, can manage all operations and users',
    icon: Settings,
  },
  {
    role: 'supervisor',
    clearance: 'SECRET',
    department: 'Operations',
    email: 'supervisor@defense.gov',
    description: 'Supervises operations, can approve classified materials',
    icon: Shield,
  },
  {
    role: 'operator',
    clearance: 'CUI',
    department: 'Field Operations',
    email: 'operator@defense.gov',
    description: 'Standard operator access for daily operations',
    icon: Users,
  },
  {
    role: 'viewer',
    clearance: 'UNCLASSIFIED',
    department: 'Public Affairs',
    email: 'viewer@defense.gov',
    description: 'Read-only access to unclassified materials',
    icon: Eye,
  },
];

const getClearanceBadgeColor = (clearance: ClassificationLevel) => {
  switch (clearance) {
    case 'TOP_SECRET': return 'bg-red-600 text-white';
    case 'SECRET': return 'bg-orange-600 text-white';
    case 'CONFIDENTIAL': return 'bg-yellow-600 text-white';
    case 'CUI': return 'bg-blue-600 text-white';
    case 'UNCLASSIFIED': return 'bg-green-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
};

const UserRoleSelector: React.FC = () => {
  const { currentUser, loginAsUser, logout } = useDefenseAuth();

  if (currentUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Session
          </CardTitle>
          <CardDescription>Authenticated User Profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role.toUpperCase()}</p>
            <p><strong>Department:</strong> {currentUser.department}</p>
            <div className="flex items-center gap-2">
              <strong>Clearance:</strong>
              <Badge className={getClearanceBadgeColor(currentUser.clearanceLevel)}>
                {currentUser.clearanceLevel}
              </Badge>
            </div>
            <p><strong>MFA:</strong> {currentUser.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <Button 
            onClick={logout} 
            variant="destructive" 
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Defense System Login</h2>
        <p className="text-muted-foreground">
          Select a user profile to simulate different access levels
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userProfiles.map((profile) => {
          const IconComponent = profile.icon;
          return (
            <Card 
              key={profile.role} 
              className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary"
              onClick={() => loginAsUser({
                email: profile.email,
                role: profile.role,
                clearanceLevel: profile.clearance,
                department: profile.department,
              })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {profile.role.toUpperCase()}
                </CardTitle>
                <CardDescription>{profile.department}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{profile.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={getClearanceBadgeColor(profile.clearance)}>
                    {profile.clearance}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {profile.email}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserRoleSelector;