"use client"
import React, { useState } from 'react';
import { SidebarBrand } from "@/components/ui/navbar/SidebarBrand";
import { SidebarNav } from "@/components/ui/navbar/SidebarNav";
import { User } from '@/types/ather';

interface SidebarProps {
  user: User | null;
  siteName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, siteName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar bg-gray-800 text-gray-100 h-screen ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <SidebarBrand />
      <SidebarNav user={user} siteName={siteName} />
      <button 
        className="absolute bottom-4 right-4 bg-gray-700 text-gray-100 hover:bg-gray-600 p-2 rounded"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </div>
  );
};

