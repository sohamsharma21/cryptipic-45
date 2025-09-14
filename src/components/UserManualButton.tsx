
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import UserManual from './UserManual';

interface UserManualButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const UserManualButton: React.FC<UserManualButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  className = ''
}) => {
  const [isManualOpen, setIsManualOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsManualOpen(true)}
      >
        <Book className="h-4 w-4 mr-2" />
        User Manual
      </Button>
      
      <UserManual
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </>
  );
};

export default UserManualButton;
