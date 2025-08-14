'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Settings, Cloud } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    setIsSigningOut(false);
  };

  // Gerar iniciais do email
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Gerar cor baseada no email
  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 rounded-lg p-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200 flex items-center gap-3 border border-transparent hover:border-gray-200"
        >
          <Avatar className={`h-8 w-8 ${getAvatarColor(user.email || '')}`}>
            <AvatarFallback className="text-white font-semibold text-xs">
              {getInitials(user.email || 'US')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-gray-900 truncate max-w-32">
              {user.email?.split('@')[0]}
            </span>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
          <div className="flex items-center gap-3 p-3 border-b">
            <Avatar className={`h-10 w-10 ${getAvatarColor(user.email || '')}`}>
              <AvatarFallback className="text-white font-semibold text-sm">
                {getInitials(user.email || 'US')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{user.email}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Cloud className="h-3 w-3" />
                Conectado à nuvem
              </div>
            </div>
          </div>
          
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Saindo...' : 'Sair'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}