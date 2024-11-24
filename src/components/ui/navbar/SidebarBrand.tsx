import React from 'react';

export const SidebarBrand: React.FC = () => {
  return (
    <div className="sidebar-brand d-none d-md-flex p-4 bg-gray-900">
      <div className="sidebar-brand-full text-xl font-bold text-gray-100" style={{ fontFamily: '"ather1Font", Arial, sans-serif' }}>
        ather1.net
      </div>
      <div className="sidebar-brand-narrow text-3xl font-bold text-gray-100" style={{ fontFamily: '"ather1Font", Arial, sans-serif' }}>
        a
      </div>
    </div>
  );
};

