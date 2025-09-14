
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Book, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { getTranslation, setLanguage, Language, translations } from '@/utils/i18n';
import { useToast } from '@/hooks/use-toast';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  const [language, setSelectedLanguage] = useState<Language>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSection, setCurrentSection] = useState('introduction');
  const [searchResults, setSearchResults] = useState<Array<{section: string, title: string, content: string}>>([]);
  const { toast } = useToast();

  // Change language handler
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as Language);
    setLanguage(value as Language);
    toast({
      title: getTranslation('languages.' + value),
      description: getTranslation('userManual.title'),
    });
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const results: Array<{section: string, title: string, content: string}> = [];
    const searchLower = searchTerm.toLowerCase();

    // Helper function to recursively search through translation object
    const searchInObject = (obj: any, section: string, parentKey: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentKey = parentKey ? `${parentKey}.${key}` : key;
        
        if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
          const sectionTitle = getTranslation(`userManual.${section}.title`);
          results.push({
            section: section,
            title: sectionTitle,
            content: value
          });
        } else if (typeof value === 'object') {
          searchInObject(value, section, currentKey);
        }
      }
    };

    // Search in each section
    const userManual = translations[language].userManual as any;
    for (const section in userManual) {
      if (section !== 'title' && typeof userManual[section] === 'object') {
        searchInObject(userManual[section], section);
      }
    }

    setSearchResults(results);
  }, [searchTerm, language]);

  // Navigation buttons
  const sections = [
    'introduction', 
    'gettingStarted', 
    'hidingMessages', 
    'revealingMessages', 
    'metadata', 
    'advancedFeatures',
    'securityBestPractices'
  ];
  
  const currentIndex = sections.indexOf(currentSection);
  
  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-crypti-darkPurple dark:text-white">
              {getTranslation('userManual.title')}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex mt-4 gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input 
                placeholder={getTranslation('common.search')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getTranslation('common.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{getTranslation('languages.en')}</SelectItem>
                  <SelectItem value="hi">{getTranslation('languages.hi')}</SelectItem>
                  <SelectItem value="es">{getTranslation('languages.es')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogDescription className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {getTranslation('userManual.introduction.content')}
          </DialogDescription>
        </DialogHeader>

        {searchTerm.length >= 2 && searchResults.length > 0 ? (
          <div className="py-4">
            <h3 className="text-lg font-medium mb-2 text-crypti-purple">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            </h3>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" 
                      onClick={() => {
                        setCurrentSection(result.section);
                        setSearchTerm('');
                      }}>
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-crypti-darkPurple dark:text-crypti-softBlue">
                      {result.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {result.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : searchTerm.length >= 2 ? (
          <div className="py-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No results found for "{searchTerm}"
            </p>
          </div>
        ) : (
          <Tabs defaultValue={currentSection} value={currentSection} className="py-4" onValueChange={setCurrentSection}>
            <TabsList className="grid grid-cols-4 md:grid-cols-7">
              <TabsTrigger value="introduction" className="text-xs md:text-sm">
                {getTranslation('userManual.introduction.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="gettingStarted" className="text-xs md:text-sm">
                {getTranslation('userManual.gettingStarted.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="hidingMessages" className="text-xs md:text-sm">
                {getTranslation('userManual.hidingMessages.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="revealingMessages" className="text-xs md:text-sm">
                {getTranslation('userManual.revealingMessages.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="metadata" className="text-xs md:text-sm">
                {getTranslation('userManual.metadata.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="advancedFeatures" className="text-xs md:text-sm">
                {getTranslation('userManual.advancedFeatures.title').split(' ')[0]}
              </TabsTrigger>
              <TabsTrigger value="securityBestPractices" className="text-xs md:text-sm">
                {getTranslation('userManual.securityBestPractices.title').split(' ')[0]}
              </TabsTrigger>
            </TabsList>

            {/* Introduction */}
            <TabsContent value="introduction" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.introduction.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getTranslation('userManual.introduction.content')}
              </p>
            </TabsContent>

            {/* Getting Started */}
            <TabsContent value="gettingStarted" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.gettingStarted.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getTranslation('userManual.gettingStarted.content')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <p className="font-medium mb-2 text-crypti-darkPurple dark:text-white">
                  {getTranslation('userManual.gettingStarted.steps.step1')}
                </p>
                <p className="font-medium mb-2 text-crypti-darkPurple dark:text-white">
                  {getTranslation('userManual.gettingStarted.steps.step2')}
                </p>
                <p className="font-medium mb-2 text-crypti-darkPurple dark:text-white">
                  {getTranslation('userManual.gettingStarted.steps.step3')}
                </p>
              </div>
            </TabsContent>

            {/* Hiding Messages */}
            <TabsContent value="hidingMessages" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.hidingMessages.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getTranslation('userManual.hidingMessages.content')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2 text-crypti-darkPurple dark:text-white">Step-by-Step Guide</h3>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>{getTranslation('userManual.hidingMessages.steps.step1')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step2')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step3')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step4')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step5')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step6')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step7')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step8')}</li>
                  <li>{getTranslation('userManual.hidingMessages.steps.step9')}</li>
                </ol>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="tips">
                  <AccordionTrigger>
                    {getTranslation('userManual.hidingMessages.tips.title')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc pl-5">
                      <li>{getTranslation('userManual.hidingMessages.tips.tip1')}</li>
                      <li>{getTranslation('userManual.hidingMessages.tips.tip2')}</li>
                      <li>{getTranslation('userManual.hidingMessages.tips.tip3')}</li>
                      <li>{getTranslation('userManual.hidingMessages.tips.tip4')}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Revealing Messages */}
            <TabsContent value="revealingMessages" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.revealingMessages.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getTranslation('userManual.revealingMessages.content')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2 text-crypti-darkPurple dark:text-white">Step-by-Step Guide</h3>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>{getTranslation('userManual.revealingMessages.steps.step1')}</li>
                  <li>{getTranslation('userManual.revealingMessages.steps.step2')}</li>
                  <li>{getTranslation('userManual.revealingMessages.steps.step3')}</li>
                  <li>{getTranslation('userManual.revealingMessages.steps.step4')}</li>
                  <li>{getTranslation('userManual.revealingMessages.steps.step5')}</li>
                </ol>
              </div>
            </TabsContent>

            {/* Metadata */}
            <TabsContent value="metadata" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.metadata.title')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getTranslation('userManual.metadata.content')}
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <h3 className="font-medium mb-2 text-crypti-darkPurple dark:text-white">Step-by-Step Guide</h3>
                <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>{getTranslation('userManual.metadata.steps.step1')}</li>
                  <li>{getTranslation('userManual.metadata.steps.step2')}</li>
                  <li>{getTranslation('userManual.metadata.steps.step3')}</li>
                  <li>{getTranslation('userManual.metadata.steps.step4')}</li>
                </ol>
              </div>
            </TabsContent>

            {/* Advanced Features */}
            <TabsContent value="advancedFeatures" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.advancedFeatures.title')}
              </h2>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="encryption">
                  <AccordionTrigger>
                    {getTranslation('userManual.advancedFeatures.encryptionAlgorithms.title')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2 text-gray-700 dark:text-gray-300">
                      {getTranslation('userManual.advancedFeatures.encryptionAlgorithms.content')}
                    </p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc pl-5">
                      <li><strong>AES-256:</strong> {getTranslation('userManual.advancedFeatures.encryptionAlgorithms.aes')}</li>
                      <li><strong>ChaCha20:</strong> {getTranslation('userManual.advancedFeatures.encryptionAlgorithms.chacha')}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="steganography">
                  <AccordionTrigger>
                    {getTranslation('userManual.advancedFeatures.steganographyMethods.title')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2 text-gray-700 dark:text-gray-300">
                      {getTranslation('userManual.advancedFeatures.steganographyMethods.content')}
                    </p>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc pl-5">
                      <li><strong>LSB:</strong> {getTranslation('userManual.advancedFeatures.steganographyMethods.lsb')}</li>
                      <li><strong>DCT:</strong> {getTranslation('userManual.advancedFeatures.steganographyMethods.dct')}</li>
                      <li><strong>DWT:</strong> {getTranslation('userManual.advancedFeatures.steganographyMethods.dwt')}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="decoy">
                  <AccordionTrigger>
                    {getTranslation('userManual.advancedFeatures.decoyMessages.title')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2 text-gray-700 dark:text-gray-300">
                      {getTranslation('userManual.advancedFeatures.decoyMessages.content')}
                    </p>
                    <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>{getTranslation('userManual.advancedFeatures.decoyMessages.step1')}</li>
                      <li>{getTranslation('userManual.advancedFeatures.decoyMessages.step2')}</li>
                      <li>{getTranslation('userManual.advancedFeatures.decoyMessages.step3')}</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            {/* Security Best Practices */}
            <TabsContent value="securityBestPractices" className="space-y-4">
              <h2 className="text-xl font-semibold text-crypti-purple dark:text-crypti-softBlue">
                {getTranslation('userManual.securityBestPractices.title')}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc pl-5">
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice1')}</li>
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice2')}</li>
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice3')}</li>
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice4')}</li>
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice5')}</li>
                  <li>{getTranslation('userManual.securityBestPractices.practices.practice6')}</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="flex justify-between items-center border-t pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || searchTerm.length >= 2}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {getTranslation('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === sections.length - 1 || searchTerm.length >= 2}
            >
              {getTranslation('common.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <Button onClick={onClose} size="sm">
            {getTranslation('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserManual;
