
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';

const ProfileButton = () => {
  const { user, signOut } = useAuth();
  
  // If no user, show login button
  if (!user) {
    return (
      <Button asChild variant="outline" className="border-crypti-purple text-crypti-purple hover:bg-crypti-purple/10 dark:text-white dark:border-crypti-purple/50">
        <Link to="/auth">Login</Link>
      </Button>
    );
  }
  
  // Create initials from email for avatar
  const getInitials = () => {
    if (!user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback className="bg-crypti-purple text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm dark:text-white">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer dark:text-gray-200">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer dark:text-gray-200">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="dark:bg-gray-700" />
        <DropdownMenuItem 
          className="text-red-600 cursor-pointer dark:text-red-400" 
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
