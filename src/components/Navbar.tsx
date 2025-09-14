
import React, { useState } from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  FileImage,
  Eye,
  MessageSquare,
  Info,
  LayoutDashboard,
  Book,
  TestTube,
  Shield,
  Search,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ProfileButton from './ProfileButton';
import UserManualButton from './UserManualButton';
import Logo from './Logo';
import { useTheme } from '@/context/ThemeContext';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors ${
          isDarkMode
            ? `text-white/80 hover:text-crypti-neon ${isActive ? 'text-crypti-neon text-glow font-semibold' : ''}`
            : `text-crypti-darkBg hover:text-crypti-neon ${isActive ? 'text-crypti-neon text-glow font-semibold' : ''}`
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
};

const MobileNavLink: React.FC<NavLinkProps & { onClick: () => void }> = ({
  to,
  children,
  onClick,
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Link 
      to={to} 
      onClick={onClick} 
      className={`flex items-center space-x-2 ${isDarkMode ? 'text-white/80' : 'text-crypti-darkBg'}`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <nav className={
      isDarkMode 
        ? "sticky top-0 z-50 bg-crypti-darkBg border-b border-crypti-neon/20 shadow-glow"
        : "sticky top-0 z-50 bg-white border-b border-crypti-neon/10 shadow-sm"
    }>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className={`${isDarkMode ? 'text-white' : 'text-crypti-darkBg'}`}>
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <NavLink to="/metadata">Extract Metadata</NavLink>
            <NavLink to="/hide">Hide Message</NavLink>
            <NavLink to="/reveal">Reveal Message</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/testing">Testing</NavLink>
            <NavLink to="/compliance">Compliance</NavLink>
            <NavLink to="/security-audit">Security Audit</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>

          {/* User Manual and Profile Button */}
          <div className="flex items-center space-x-2">
            <UserManualButton 
              variant="outline" 
              size="sm" 
              className={`hidden md:flex ${
                isDarkMode 
                  ? "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10" 
                  : "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10"
              }`}
            />
            <ProfileButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isDarkMode ? "text-white" : "text-crypti-darkBg"}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className={isDarkMode ? "bg-crypti-darkBg text-white" : "bg-white text-crypti-darkBg"}
              >
                <div className="flex flex-col space-y-6 py-6">
                  <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
                    <Home className="h-5 w-5 mr-2 text-crypti-neon" />
                    Home
                  </MobileNavLink>
                  <MobileNavLink to="/metadata" onClick={() => setIsMenuOpen(false)}>
                    <FileImage className="h-5 w-5 mr-2 text-crypti-neon" />
                    Extract Metadata
                  </MobileNavLink>
                  <MobileNavLink to="/hide" onClick={() => setIsMenuOpen(false)}>
                    <Eye className="h-5 w-5 mr-2 text-crypti-neon" />
                    Hide Message
                  </MobileNavLink>
                  <MobileNavLink to="/reveal" onClick={() => setIsMenuOpen(false)}>
                    <MessageSquare className="h-5 w-5 mr-2 text-crypti-neon" />
                    Reveal Message
                  </MobileNavLink>
                  <MobileNavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="h-5 w-5 mr-2 text-crypti-neon" />
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink to="/testing" onClick={() => setIsMenuOpen(false)}>
                    <TestTube className="h-5 w-5 mr-2 text-crypti-neon" />
                    Testing
                  </MobileNavLink>
                  <MobileNavLink to="/compliance" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="h-5 w-5 mr-2 text-crypti-neon" />
                    Compliance
                  </MobileNavLink>
                  <MobileNavLink to="/security-audit" onClick={() => setIsMenuOpen(false)}>
                    <Search className="h-5 w-5 mr-2 text-crypti-neon" />
                    Security Audit
                  </MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setIsMenuOpen(false)}>
                    <Info className="h-5 w-5 mr-2 text-crypti-neon" />
                    About
                  </MobileNavLink>
                  <div className={`py-2 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 justify-start border-crypti-neon text-crypti-neon"
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                    >
                      <Book className="h-5 w-5 mr-2 text-crypti-neon" />
                      <UserManualButton variant="ghost" size="sm" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
