import React from 'react';
import { Sidebar } from '@/components/ui/navbar/sidebar';
import { User } from '@/types/ather';

// This is a mock user object. In a real application, you'd fetch this data from your authentication system.
const mockUser: User = {
  id: '123',
  username: 'testuser',
  discriminator: '1234',
  avatar: 'https://example.com/avatar.jpg',
  bot: false,
  system: false,
  mfa_enabled: true,
  locale: 'en-US',
  verified: true,
  email: 'test@example.com',
  flags: 0,
  premium_type: 0,
  public_flags: 0,
  globalName: 'Test User',
  permissions: {
    admin: true,
    archiveAccess: true
  },
  services: [
    { serviceId: 'mc1', serviceName: 'Minecraft Server 1', type: 'mcServer' },
    { serviceId: 'bot1', serviceName: 'Discord Bot 1', type: 'discordBot' }
  ]
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar user={mockUser} siteName="ather1.net" />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
