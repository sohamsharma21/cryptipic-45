import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Download, 
  Smartphone, 
  Zap, 
  Activity,
  Eye,
  Users,
  FileText,
  Package,
  Wifi,
  WifiOff,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Database,
  Key
} from 'lucide-react';

interface FeatureCard {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  status: 'ready' | 'beta' | 'new';
  href?: string;
  color: string;
}

const EnhancedHomePage: React.FC = () => {
  const { isOnline, isInstalled, isInstallable, installApp } = useServiceWorker();

  const features: FeatureCard[] = [
    {
      icon: Lock,
      title: 'Defense Steganography',
      description: 'Military-grade steganography with AES-256 encryption for classified operations',
      status: 'ready',
      href: '/defense',
      color: 'text-blue-600',
    },
    {
      icon: Eye,
      title: 'Hide Messages',
      description: 'Embed secret messages in images with advanced encryption',
      status: 'ready',
      href: '/hide',
      color: 'text-green-600',
    },
    {
      icon: FileText,
      title: 'Reveal Messages',
      description: 'Extract and decrypt hidden messages from steganographic images',
      status: 'ready',
      href: '/reveal',
      color: 'text-purple-600',
    },
    {
      icon: Database,
      title: 'Metadata Analysis',
      description: 'Comprehensive image metadata extraction and analysis',
      status: 'ready',
      href: '/metadata',
      color: 'text-orange-600',
    },
    {
      icon: Shield,
      title: 'Biometric Security',
      description: 'Hardware-based biometric authentication for maximum security',
      status: 'new',
      color: 'text-red-600',
    },
    {
      icon: Key,
      title: 'OTP Authentication',
      description: 'Time-based one-time passwords for secure access',
      status: 'beta',
      color: 'text-indigo-600',
    },
  ];

  const stats = [
    { label: 'Encryption Standard', value: 'AES-256', icon: Lock },
    { label: 'Security Clearance', value: 'TOP SECRET', icon: Shield },
    { label: 'Uptime', value: '99.9%', icon: Activity },
    { label: 'Processing Speed', value: '<2s', icon: Zap },
  ];

  const handleInstallClick = async () => {
    if (isInstallable) {
      await installApp();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-8">
            {/* Status Indicators */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <Badge className={`${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-3 py-1`}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? 'Online' : 'Offline Mode'}
              </Badge>
              {isInstalled && (
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Smartphone className="h-3 w-3 mr-1" />
                  PWA Installed
                </Badge>
              )}
              <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Defense Ready
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Shield className="h-8 w-8" />
                <span className="font-bold text-2xl">CryptiPic</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                Advanced Defense
                <span className="text-primary block">Steganography</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Military-grade steganography platform for defense and intelligence operations. 
                Secure message hiding with AES-256 encryption, biometric authentication, and NIST compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Link to="/defense">
                  <Shield className="mr-2 h-5 w-5" />
                  Access Defense Portal
                </Link>
              </Button>
              
              {!isInstalled && isInstallable && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleInstallClick}
                  className="px-8"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install PWA
                </Button>
              )}
              
              <Button variant="ghost" size="lg" asChild>
                <Link to="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-primary/20">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Advanced Security Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive suite of cryptographic and steganographic tools designed for defense operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <Badge 
                    variant={feature.status === 'ready' ? 'default' : 
                            feature.status === 'new' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feature.href ? (
                  <Button 
                    asChild 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                  >
                    <Link to={feature.href}>
                      Access Feature
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full" variant="outline">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Standards */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Defense Grade Security
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built to meet the highest security standards for government and defense applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-blue-600" />
                <CardTitle>NIST Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fully compliant with NIST 800-53 security controls and CMMC framework requirements
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lock className="h-12 w-12 mx-auto text-green-600" />
                <CardTitle>AES-256 Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Military-grade encryption with PBKDF2 key derivation and hardware security modules
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 mx-auto text-purple-600" />
                <CardTitle>Global Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Secure cloud infrastructure with multi-region deployment and disaster recovery
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PWA Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Smartphone className="h-6 w-6" />
                Progressive Web App
              </CardTitle>
              <CardDescription className="text-base">
                Install CryptiPic as a native app for enhanced performance and offline capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Offline cryptographic operations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Native app performance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Secure local storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Push notifications</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Background sync</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Hardware acceleration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Biometric authentication</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Cross-platform support</span>
                  </div>
                </div>
              </div>
              {!isInstalled && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleInstallClick}
                    disabled={!isInstallable}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Install CryptiPic Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomePage;