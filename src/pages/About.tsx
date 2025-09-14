
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, Lock, Image, Shield, Eye } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-crypti-darkPurple">About CryptiPic</h1>
          <p className="text-gray-600">
            Learn more about our secure image steganography and metadata extraction tool.
          </p>
        </div>

        {/* What is CryptiPic Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Info className="h-6 w-6 text-crypti-purple mr-2" />
              <CardTitle>What is CryptiPic?</CardTitle>
            </div>
            <CardDescription>
              A secure, browser-based tool for image steganography and metadata extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              CryptiPic is a powerful web application that allows you to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium text-crypti-darkPurple">Hide secret messages within images</span> - Embed text messages in images using steganography techniques that make the changes invisible to the naked eye.
              </li>
              <li>
                <span className="font-medium text-crypti-darkPurple">Extract and reveal hidden messages</span> - Decode and read messages that have been embedded in images using our tool.
              </li>
              <li>
                <span className="font-medium text-crypti-darkPurple">View detailed image metadata</span> - Extract and display comprehensive EXIF data from your images, including camera settings, location information, and more.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Shield className="h-6 w-6 text-crypti-purple mr-2" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>
              How we protect your data and ensure your privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-crypti-softBlue/30 rounded-lg">
              <Lock className="h-10 w-10 text-crypti-purple flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-crypti-darkPurple text-lg">Client-Side Processing</h3>
                <p className="text-gray-600">
                  All processing in CryptiPic happens entirely within your browser. Your images, messages, and metadata are never transmitted to our servers or stored anywhere outside your device.
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-crypti-darkPurple">Our Privacy Commitments:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not store or collect any of your images</li>
              <li>We do not have access to your secret messages</li>
              <li>We do not track individual users or their activities</li>
              <li>No registration or account is required to use our services</li>
              <li>All image processing is done client-side in your browser</li>
            </ul>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Eye className="h-6 w-6 text-crypti-purple mr-2" />
              <CardTitle>How Steganography Works</CardTitle>
            </div>
            <CardDescription>
              The science behind hiding messages in plain sight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Steganography is the practice of concealing information within other non-secret data or a physical object to avoid detection. Unlike cryptography, which focuses on keeping the contents of a message secret, steganography focuses on keeping the existence of the message secret.
            </p>
            
            <h3 className="font-semibold text-crypti-darkPurple mt-4">LSB (Least Significant Bit) Technique</h3>
            <p>
              CryptiPic uses the LSB (Least Significant Bit) technique to hide messages in images:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Each pixel in a digital image consists of color values (typically RGB)</li>
              <li>The least significant bit of these values can be modified without noticeably changing the image</li>
              <li>We use these least significant bits to store the binary data of your secret message</li>
              <li>This allows us to hide substantial amounts of text without visibly altering the image</li>
            </ol>
            
            <h3 className="font-semibold text-crypti-darkPurple mt-4">Optional Encryption</h3>
            <p>
              For additional security, CryptiPic offers AES encryption for your hidden messages. When you choose to encrypt your message with a password, even if someone discovers that the image contains hidden data, they won't be able to read it without the correct password.
            </p>
          </CardContent>
        </Card>

        {/* Metadata Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Image className="h-6 w-6 text-crypti-purple mr-2" />
              <CardTitle>Understanding Image Metadata</CardTitle>
            </div>
            <CardDescription>
              What EXIF data reveals about your images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Metadata is "data about data" - information embedded within your image files that provides details about:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Camera make and model</li>
              <li>Date and time the photo was taken</li>
              <li>Camera settings (aperture, shutter speed, ISO, etc.)</li>
              <li>GPS coordinates (if location services were enabled)</li>
              <li>Software used to edit the image</li>
              <li>Copyright information</li>
              <li>And much more</li>
            </ul>
            
            <div className="p-4 bg-crypti-softBlue/30 rounded-lg mt-4">
              <h3 className="font-semibold text-crypti-darkPurple">Privacy Implications</h3>
              <p className="text-gray-600">
                It's important to be aware that when you share images online, you might inadvertently be sharing personal information through metadata. CryptiPic helps you see exactly what information is contained in your images, empowering you to make informed decisions about your privacy.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />
        
        {/* Disclaimer */}
        <div className="text-sm text-gray-500 text-center max-w-3xl mx-auto">
          <p className="font-medium text-crypti-darkPurple mb-2">Disclaimer</p>
          <p>
            CryptiPic is intended for legitimate privacy protection, educational, and entertainment purposes only. 
            We do not condone the use of our tool for any illegal activities. 
            Users are solely responsible for how they use this technology.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
