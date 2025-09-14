
import React from 'react';
import Layout from '@/components/Layout';
import MessageEncoder from '@/components/MessageEncoder';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertTriangle } from 'lucide-react';

const HidePage = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-crypti-darkPurple">Hide Secret Messages</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Securely embed hidden messages within your images using advanced steganography techniques.
            {!isMobile && " Optional encryption adds an extra layer of security."}
          </p>
          
          {isMobile && (
            <div className="mt-4 inline-flex items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-md border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
              For mobile users, we recommend using larger images for better reliability.
            </div>
          )}
        </div>

        <MessageEncoder />
        
        {/* How It Works Section */}
        <section className={`bg-white p-${isMobile ? '4' : '6'} rounded-lg shadow-sm border border-crypti-purple/10 mt-${isMobile ? '6' : '8'}`}>
          <h2 className="text-xl font-bold text-crypti-purple mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">1</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Upload Your Image</h3>
                <p className="text-gray-600">Select any JPEG or PNG image as your carrier file.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">2</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Enter Your Secret Message</h3>
                <p className="text-gray-600">Type the confidential text you want to hide within the image.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">3</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Optional Encryption</h3>
                <p className="text-gray-600">Add password protection for an additional layer of security.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">4</div>
              <div>
                <h3 className="font-medium text-crypti-darkPurple">Download & Share</h3>
                <p className="text-gray-600">Save the processed image which looks identical to the original but contains your hidden message.</p>
              </div>
            </div>
            
            {isMobile && (
              <div className="flex items-start">
                <div className="bg-crypti-purple/10 p-2 rounded-full mr-4 text-crypti-purple font-semibold">📱</div>
                <div>
                  <h3 className="font-medium text-crypti-darkPurple">Mobile Optimized</h3>
                  <p className="text-gray-600">Our mobile algorithm uses stronger encoding that works better on mobile devices. For best results, use uncompressed original images.</p>
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

export default HidePage;
