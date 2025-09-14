import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Download, Database, FileText, Code, Eye, Search, AlertTriangle } from 'lucide-react';
import { extractMetadata } from '@/utils/metadata/extractMetadata';
import { useAudit } from '@/components/defense/AuditLogger';

interface AdvancedDataExtractorProps {
  file: File | null;
  className?: string;
}

interface ExtractedData {
  metadata: any;
  hexData: string;
  binaryData: string;
  steganographyAnalysis: any;
  fileSignature: string;
  embeddedMessages: any[];
}

const AdvancedDataExtractor: React.FC<AdvancedDataExtractorProps> = ({ file, className }) => {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata');
  const { toast } = useToast();
  const { logEvent } = useAudit();

  const analyzeFile = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    logEvent('DATA_EXTRACTION_STARTED', `Advanced data extraction initiated for ${file.name}`, 'CUI');

    try {
      // Extract basic metadata
      const metadata = await extractMetadata(file);
      
      // Convert file to array buffer for hex/binary analysis
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Generate hex dump
      const hexData = Array.from(uint8Array)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
      
      // Generate binary representation (first 1KB for display)
      const binaryData = Array.from(uint8Array.slice(0, 1024))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(' ');
      
      // Analyze file signature
      const fileSignature = Array.from(uint8Array.slice(0, 16))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ').toUpperCase();
      
      // Advanced steganography analysis
      const steganographyAnalysis = await performSteganographyAnalysis(uint8Array, file.type);
      
      // Search for embedded messages using multiple techniques
      const embeddedMessages = await searchEmbeddedMessages(uint8Array, file.type);
      
      const extracted: ExtractedData = {
        metadata,
        hexData,
        binaryData,
        steganographyAnalysis,
        fileSignature,
        embeddedMessages
      };
      
      setExtractedData(extracted);
      logEvent('DATA_EXTRACTION_COMPLETED', `Data extraction completed for ${file.name}`, 'CUI', true);
      
      toast({
        title: "Analysis Complete",
        description: `Extracted ${Object.keys(metadata).length} metadata fields and analyzed ${uint8Array.length} bytes`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze file",
      });
      logEvent('DATA_EXTRACTION_FAILED', `Data extraction failed for ${file.name}: ${error}`, 'CUI', false);
    } finally {
      setLoading(false);
    }
  }, [file, toast, logEvent]);

  const performSteganographyAnalysis = async (data: Uint8Array, fileType: string) => {
    const analysis = {
      lsbAnalysis: {},
      frequencyAnalysis: {},
      entropyAnalysis: {},
      possibleHiddenData: false,
      suspiciousPatterns: []
    };

    // LSB (Least Significant Bit) Analysis
    if (fileType.includes('image')) {
      analysis.lsbAnalysis = analyzeLSB(data);
    }

    // Frequency Analysis
    analysis.frequencyAnalysis = analyzeFrequency(data);

    // Entropy Analysis
    analysis.entropyAnalysis = calculateEntropy(data);

    // Check for suspicious patterns
    analysis.suspiciousPatterns = findSuspiciousPatterns(data);
    analysis.possibleHiddenData = analysis.suspiciousPatterns.length > 0;

    return analysis;
  };

  const analyzeLSB = (data: Uint8Array) => {
    // Analyze LSB patterns for potential steganography
    const lsbStats = { '0': 0, '1': 0 };
    const sampleSize = Math.min(data.length, 10000);
    
    for (let i = 0; i < sampleSize; i++) {
      const lsb = data[i] & 1;
      lsbStats[lsb.toString()]++;
    }
    
    const ratio = lsbStats['1'] / (lsbStats['0'] + lsbStats['1']);
    const expectedRatio = 0.5;
    const deviation = Math.abs(ratio - expectedRatio);
    
    return {
      zeroCount: lsbStats['0'],
      oneCount: lsbStats['1'],
      ratio: ratio.toFixed(4),
      deviation: deviation.toFixed(4),
      suspicious: deviation > 0.1
    };
  };

  const analyzeFrequency = (data: Uint8Array) => {
    const frequency = new Array(256).fill(0);
    
    for (const byte of data) {
      frequency[byte]++;
    }
    
    const maxFreq = Math.max(...frequency);
    const minFreq = Math.min(...frequency);
    const avgFreq = data.length / 256;
    
    return {
      maxFrequency: maxFreq,
      minFrequency: minFreq,
      averageFrequency: avgFreq.toFixed(2),
      distribution: frequency
    };
  };

  const calculateEntropy = (data: Uint8Array) => {
    const frequency = new Array(256).fill(0);
    
    for (const byte of data) {
      frequency[byte]++;
    }
    
    let entropy = 0;
    for (const freq of frequency) {
      if (freq > 0) {
        const probability = freq / data.length;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    return {
      entropy: entropy.toFixed(4),
      maxEntropy: 8,
      normalized: (entropy / 8).toFixed(4),
      interpretation: entropy > 7.5 ? 'High (possibly encrypted/compressed)' : 
                     entropy > 6 ? 'Medium' : 'Low (possibly structured data)'
    };
  };

  const findSuspiciousPatterns = (data: Uint8Array): string[] => {
    const patterns: string[] = [];
    
    // Check for repeated sequences that might indicate hidden data
    const sequences = new Map<string, number>();
    for (let i = 0; i < data.length - 4; i++) {
      const seq = Array.from(data.slice(i, i + 4))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      sequences.set(seq, (sequences.get(seq) || 0) + 1);
    }
    
    for (const [seq, count] of sequences) {
      if (count > 100) {
        patterns.push(`Repeated sequence ${seq} appears ${count} times`);
      }
    }
    
    // Check for common steganography markers
    const markers = [
      { pattern: [0xFF, 0xFE], name: 'Possible text marker' },
      { pattern: [0x50, 0x4B], name: 'ZIP archive header' },
      { pattern: [0x89, 0x50, 0x4E, 0x47], name: 'PNG embedded in non-PNG' }
    ];
    
    for (const marker of markers) {
      if (findPattern(data, marker.pattern)) {
        patterns.push(marker.name);
      }
    }
    
    return patterns;
  };

  const findPattern = (data: Uint8Array, pattern: number[]): boolean => {
    for (let i = 0; i <= data.length - pattern.length; i++) {
      let match = true;
      for (let j = 0; j < pattern.length; j++) {
        if (data[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  };

  const searchEmbeddedMessages = async (data: Uint8Array, fileType: string) => {
    const messages = [];
    
    // Search for text patterns
    const textPatterns = extractTextStrings(data);
    if (textPatterns.length > 0) {
      messages.push({
        type: 'text',
        content: textPatterns,
        confidence: 'medium'
      });
    }
    
    // Search for base64 encoded data
    const base64Patterns = findBase64Patterns(data);
    if (base64Patterns.length > 0) {
      messages.push({
        type: 'base64',
        content: base64Patterns,
        confidence: 'high'
      });
    }
    
    // Search for encrypted patterns
    const encryptedPatterns = findEncryptedPatterns(data);
    if (encryptedPatterns.length > 0) {
      messages.push({
        type: 'encrypted',
        content: encryptedPatterns,
        confidence: 'low'
      });
    }
    
    return messages;
  };

  const extractTextStrings = (data: Uint8Array): string[] => {
    const strings: string[] = [];
    let currentString = '';
    
    for (const byte of data) {
      if (byte >= 32 && byte <= 126) { // Printable ASCII
        currentString += String.fromCharCode(byte);
      } else {
        if (currentString.length > 10) {
          strings.push(currentString);
        }
        currentString = '';
      }
    }
    
    if (currentString.length > 10) {
      strings.push(currentString);
    }
    
    return strings.slice(0, 50); // Limit to first 50 strings
  };

  const findBase64Patterns = (data: Uint8Array): string[] => {
    const base64Regex = /[A-Za-z0-9+/]{20,}={0,2}/g;
    const text = new TextDecoder('latin1').decode(data);
    const matches = text.match(base64Regex) || [];
    
    return matches.filter(match => {
      try {
        atob(match);
        return true;
      } catch {
        return false;
      }
    }).slice(0, 10);
  };

  const findEncryptedPatterns = (data: Uint8Array): any[] => {
    const patterns = [];
    
    // Look for high entropy regions
    const blockSize = 1024;
    for (let i = 0; i < data.length - blockSize; i += blockSize) {
      const block = data.slice(i, i + blockSize);
      const entropy = calculateEntropy(block);
      
      if (parseFloat(entropy.entropy) > 7.5) {
        patterns.push({
          offset: i,
          size: blockSize,
          entropy: entropy.entropy,
          description: 'High entropy region (possibly encrypted)'
        });
      }
    }
    
    return patterns.slice(0, 10);
  };

  const exportData = (format: 'json' | 'txt' | 'csv') => {
    if (!extractedData || !file) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify(extractedData, null, 2);
        filename = `${file.name}-analysis.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
        content = generateTextReport(extractedData);
        filename = `${file.name}-analysis.txt`;
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = generateCSVReport(extractedData);
        filename = `${file.name}-analysis.csv`;
        mimeType = 'text/csv';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logEvent('DATA_EXPORT', `Data analysis exported as ${format.toUpperCase()} for ${file.name}`, 'CUI');
  };

  const generateTextReport = (data: ExtractedData): string => {
    return [
      'CryptiPic Advanced Data Analysis Report',
      '=' .repeat(50),
      `File: ${file?.name}`,
      `Analysis Date: ${new Date().toLocaleString()}`,
      `File Signature: ${data.fileSignature}`,
      '',
      'METADATA ANALYSIS',
      '-'.repeat(20),
      JSON.stringify(data.metadata, null, 2),
      '',
      'STEGANOGRAPHY ANALYSIS',
      '-'.repeat(25),
      JSON.stringify(data.steganographyAnalysis, null, 2),
      '',
      'EMBEDDED MESSAGES',
      '-'.repeat(17),
      JSON.stringify(data.embeddedMessages, null, 2),
      '',
      'SECURITY NOTICE',
      '-'.repeat(15),
      'This analysis is for authorized defense personnel only.',
      'Handle all extracted data according to classification guidelines.',
    ].join('\n');
  };

  const generateCSVReport = (data: ExtractedData): string => {
    const rows = [
      ['Field', 'Value', 'Category'],
      ['File Name', file?.name || '', 'Basic'],
      ['File Signature', data.fileSignature, 'Basic'],
      ['Analysis Date', new Date().toLocaleString(), 'Basic'],
      ['LSB Suspicious', data.steganographyAnalysis.lsbAnalysis?.suspicious || false, 'Steganography'],
      ['Entropy', data.steganographyAnalysis.entropyAnalysis?.entropy || '', 'Steganography'],
      ['Suspicious Patterns', data.steganographyAnalysis.suspiciousPatterns?.length || 0, 'Steganography'],
      ['Embedded Messages', data.embeddedMessages.length, 'Messages'],
    ];
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  if (!file) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Upload a file to begin advanced data extraction</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Advanced Data Extraction & Analysis
        </CardTitle>
        <CardDescription>
          Defense-grade forensic analysis and steganography detection for {file.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={analyzeFile} disabled={loading} className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>{loading ? 'Analyzing...' : 'Start Analysis'}</span>
          </Button>
          
          {extractedData && (
            <div className="flex space-x-2">
              <Button onClick={() => exportData('json')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button onClick={() => exportData('txt')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                TXT
              </Button>
              <Button onClick={() => exportData('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          )}
        </div>

        {extractedData && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="hex">Hex Data</TabsTrigger>
              <TabsTrigger value="stego">Steganography</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="binary">Binary</TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">File Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {extractedData.metadata.fileName}</div>
                    <div><strong>Size:</strong> {extractedData.metadata.fileSize}</div>
                    <div><strong>Type:</strong> {extractedData.metadata.fileType}</div>
                    <div><strong>Signature:</strong> <code className="bg-muted px-1">{extractedData.fileSignature}</code></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Extracted Fields</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(extractedData.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hex" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hexadecimal Dump (First 2KB)</h4>
                <Textarea
                  value={extractedData.hexData.slice(0, 6000)} // Limit display
                  readOnly
                  className="font-mono text-xs h-64"
                />
              </div>
            </TabsContent>

            <TabsContent value="stego" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    LSB Analysis
                    {extractedData.steganographyAnalysis.lsbAnalysis?.suspicious && (
                      <Badge variant="destructive" className="ml-2">Suspicious</Badge>
                    )}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>0-bits:</strong> {extractedData.steganographyAnalysis.lsbAnalysis?.zeroCount}</div>
                    <div><strong>1-bits:</strong> {extractedData.steganographyAnalysis.lsbAnalysis?.oneCount}</div>
                    <div><strong>Ratio:</strong> {extractedData.steganographyAnalysis.lsbAnalysis?.ratio}</div>
                    <div><strong>Deviation:</strong> {extractedData.steganographyAnalysis.lsbAnalysis?.deviation}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Entropy Analysis</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Entropy:</strong> {extractedData.steganographyAnalysis.entropyAnalysis?.entropy}</div>
                    <div><strong>Normalized:</strong> {extractedData.steganographyAnalysis.entropyAnalysis?.normalized}</div>
                    <div><strong>Assessment:</strong> {extractedData.steganographyAnalysis.entropyAnalysis?.interpretation}</div>
                  </div>
                </div>
              </div>
              
              {extractedData.steganographyAnalysis.suspiciousPatterns?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 dark:text-yellow-400" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Suspicious Patterns Detected</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                        {extractedData.steganographyAnalysis.suspiciousPatterns.map((pattern: string, index: number) => (
                          <li key={index}>• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              {extractedData.embeddedMessages.length > 0 ? (
                extractedData.embeddedMessages.map((message, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Message {index + 1}</h4>
                      <Badge variant={message.confidence === 'high' ? 'default' : 'secondary'}>
                        {message.confidence} confidence
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div><strong>Type:</strong> {message.type}</div>
                      <div>
                        <strong>Content:</strong>
                        <Textarea
                          value={JSON.stringify(message.content, null, 2)}
                          readOnly
                          className="mt-1 font-mono text-xs h-32"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No embedded messages detected</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="binary" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Binary Representation (First 1KB)</h4>
                <Textarea
                  value={extractedData.binaryData}
                  readOnly
                  className="font-mono text-xs h-64"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedDataExtractor;