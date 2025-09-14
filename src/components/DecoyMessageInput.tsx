
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { DecoyMessage } from '@/utils/steganographyAlgorithms';

interface DecoyMessageInputProps {
  index: number;
  totalDecoys: number;
  value: DecoyMessage;
  onChange: (index: number, message: DecoyMessage) => void;
  onRemove: (index: number) => void;
}

const DecoyMessageInput: React.FC<DecoyMessageInputProps> = ({
  index,
  totalDecoys,
  value,
  onChange,
  onRemove
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof DecoyMessage, newValue: string | number) => {
    onChange(index, { ...value, [field]: newValue });
  };

  return (
    <Card className="relative border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20 mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Decoy Message {index + 1}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-orange-700 dark:text-orange-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <Label htmlFor={`decoy-message-${index}`} className="text-sm text-orange-800 dark:text-orange-300">
            Decoy Message Content
          </Label>
          <Textarea
            id={`decoy-message-${index}`}
            placeholder="Enter a decoy message..."
            value={value.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="resize-none h-20 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`decoy-password-${index}`} className="text-sm text-orange-800 dark:text-orange-300">
            Decoy Password
          </Label>
          <div className="relative">
            <Input
              id={`decoy-password-${index}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password for this decoy"
              value={value.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="pr-10 dark:bg-gray-800 dark:border-gray-700"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="pt-1">
          <Label className="text-xs text-orange-800 dark:text-orange-300 mb-1 block">
            Priority Level
          </Label>
          <input
            type="range"
            min="1"
            max={totalDecoys}
            value={value.index}
            onChange={(e) => handleChange('index', parseInt(e.target.value))}
            className="w-full h-2 bg-orange-200 dark:bg-orange-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-orange-700 dark:text-orange-500 mt-1">
            <span>Lower Priority</span>
            <span>Higher Priority</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DecoyMessageInput;
