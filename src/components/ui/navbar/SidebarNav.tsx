import React from 'react';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarNavGroup } from './SidebarNavGroup';
import { User } from "@/types/ather";

interface SidebarNavProps {
  user: User | null;
  siteName: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ user, siteName }) => {
  const setCookieAndRedirect = (serviceId: string) => {
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `mcServerId=${serviceId}; expires=${date.toUTCString()}; path=/`;
    window.location.href = "/minecraft/";
  };

  const mcServers = user?.services?.filter(service => service.type === "mcServer") || [];
  const botServices = user?.services?.filter(service => service.type === "discordBot") || [];

  return (
    <ul className="sidebar-nav overflow-y-auto" data-coreui="navigation">
      <SidebarNavItem href={`https://${siteName}/`} icon="fa-home" label="Home" />
      <SidebarNavItem href="https://discord.gg/SAqDnYYgSg" icon="fa-brands fa-discord" label="Discord" />
      <SidebarNavItem href="https://status.athernas.net" icon="fa-cloud" label="Status Site" />

      {user && (user.permissions?.admin || user.permissions?.archiveAccess) && (
        <>
          <li className="nav-title text-gray-400 px-4 py-2">Ather1</li>
          {user.permissions?.admin && (
            <SidebarNavItem href="https://phpmyadmin.ather1.net" icon="fa-database" label="PHP My Admin" />
          )}
          {user.permissions?.archiveAccess && (
            <SidebarNavItem href="https://archive.ather1.net/" icon="fa-database" label="The Arch" />
          )}
        </>
      )}

      {mcServers.length > 0 && (
        <>
          <li className="nav-title text-gray-400 px-4 py-2">Minecraft Servers</li>
          {mcServers.map((server) => (
            <SidebarNavItem 
              key={server.serviceId}
              href="#"
              icon="fa-cube"
              label={server.serviceName}
              onClick={() => setCookieAndRedirect(server.serviceId)}
            />
          ))}
        </>
      )}

      {botServices.length > 0 && (
        <>
          <li className="nav-title text-gray-400 px-4 py-2">Bots</li>
          {botServices.map((server) => (
            <SidebarNavGroup key={server.serviceId} server={server} />
          ))}
        </>
      )}

      {user?.permissions?.admin && (
        <SidebarNavItem 
          href="https://coreui.io/docs/templates/installation/" 
          icon="fa-regular fa-file-lines" 
          label="Docs" 
          className="mt-auto"
        />
      )}
    </ul>
  );
};