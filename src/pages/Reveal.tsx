
import React from 'react';
import Layout from '@/components/Layout';
import MessageDecoder from '@/components/MessageDecoder';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle } from 'lucide-react';

const RevealPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-crypti-darkPurple">Reveal Hidden Messages</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Extract secret messages that have been hidden in images using our steganography tool.
            {!isMobile && " If the message is encrypted, you'll need the password to decrypt it."}
          </p>
          
          {isMobile && (
            <div className="mt-4 inline-flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
              Some images processed on mobile may need the desktop version for reliable results.
            </div>
          )}
        </div>

        <MessageDecoder />
        
        {/* How It Works Section */}
        <section className={`bg-white p-${isMobile ? '4' : '6'} rounded-lg shadow-sm border border-crypti-purple/10 mt-${isMobile ? '6' : '8'}`}>
          <h2 className="text-xl font-bold text-crypti-purple mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">1</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Upload Steganographic Image</h3>
                <p className="text-gray-600">Select an image that contains a hidden message created with CryptiPic.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">2</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Enter Password (If Required)</h3>
                <p className="text-gray-600">If the message was encrypted, you'll need to provide the correct password.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">3</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">View Secret Message</h3>
                <p className="text-gray-600">The hidden message will be extracted and displayed.</p>
              </div>
            </div>
            
            {isMobile && (
              <div className="flex items-start">
                <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">⚠️</div>
                <div>
                  <h3 className="font-medium text-crypti-darkPurple">Mobile Tips</h3>
                  <p className="text-gray-600">For best results on mobile, use the original uncompressed image file and avoid downloading images from messaging apps.</p>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Privacy Notice */}
        <div className={`p-4 bg-crypti-softBlue/30 rounded-lg text-sm text-gray-600 text-center ${isMobile ? 'mb-4' : ''}`}>
          <p>
            <span className="font-medium text-crypti-darkPurple">Privacy Notice:</span> All processing happens locally in your browser.
            Your images and messages are never uploaded to any server.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RevealPage;
