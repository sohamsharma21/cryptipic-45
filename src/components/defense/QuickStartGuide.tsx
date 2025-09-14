
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen, Shield, AlertTriangle, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuickStartGuideProps {
  title: string;
  steps: string[];
  securityTips: string[];
  warnings?: string[];
  className?: string;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  title,
  steps,
  securityTips,
  warnings = [],
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={`mb-4 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <CardDescription>
              Click to {isOpen ? 'hide' : 'show'} quick start guide and security tips
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Start Steps */}
              <div className="quick-start-guide">
                <h4 className="font-semibold mb-3 text-foreground flex items-center">
                  <Info className="h-4 w-4 mr-2 text-primary" />
                  Quick Start Steps
                </h4>
                <ol className="space-y-2">
                  {steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Security Tips */}
              <div className="space-y-4">
                <div className="security-tip">
                  <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Best Practices
                  </h4>
                  <ul className="space-y-2">
                    {securityTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></span>
                        <span className="text-sm text-blue-800 dark:text-blue-200">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
                    <h4 className="font-semibold mb-3 text-red-800 dark:text-red-200 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Important Warnings
                    </h4>
                    <ul className="space-y-2">
                      {warnings.map((warning, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mt-2"></span>
                          <span className="text-sm text-red-800 dark:text-red-200">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default QuickStartGuide;
