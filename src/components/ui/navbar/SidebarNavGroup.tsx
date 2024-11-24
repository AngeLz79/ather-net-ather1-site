"use client"
import React, { useState, useEffect } from 'react';
import { SidebarNavItem } from "@/components/ui/navbar/SidebarNavItem";
interface Service {
  serviceId: string;
  serviceName: string;
  type: string;
}

interface SidebarNavGroupProps {
  server: Service;
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({ server }) => {
  const [subItems, setSubItems] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const simulatedScandir = ['.', '..', 'folder1', 'folder2', 'folder3'];
    setSubItems(simulatedScandir.filter(item => item !== '.' && item !== '..'));
  }, [server.serviceId]);

  return (
    <li className="nav-group">
      <a 
        className="nav-link nav-group-toggle flex items-center justify-between px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white" 
        href="#"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>
          <i className="fas fa-cube nav-icon mr-2"></i>
          {server.serviceName}
        </span>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
      </a>
      {isExpanded && (
        <ul className="nav-group-items pl-4">
          <SidebarNavItem href={`/${server.serviceId}/`} icon="fa-home" label="Main" />
          {subItems.map((folder) => (
            <SidebarNavItem 
              key={folder}
              href={`/${server.serviceId}/${folder}/`}
              icon="fa-folder"
              label={folder.charAt(0).toUpperCase() + folder.slice(1)}
            />
          ))}
        </ul>
      )}
    </li>
  );
};