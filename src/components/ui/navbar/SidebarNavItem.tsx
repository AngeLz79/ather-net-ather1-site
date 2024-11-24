import React from 'react';

interface SidebarNavItemProps {
  href: string;
  icon: string;
  label: string;
  className?: string;
  onClick?: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ href, icon, label, className = '', onClick }) => {
  return (
    <li className={`nav-item ${className}`}>
      <a className="nav-link flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white" href={href} onClick={onClick}>
        <i className={`fa-solid fa-fw ${icon} nav-icon mr-2`}></i>
        <span>{label}</span>
      </a>
    </li>
  );
};

