import React from 'react';

export default function TestPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Page with Sidebar</h1>
      <div className="bg-background text-foreground shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to the Test Page</h2>
        <p className="mb-4">
          This page demonstrates the integration of our custom sidebar with page content.
          You should see the sidebar on the left side of the screen, and this content on the right.
        </p>
        <ul className="list-disc pl-5">
          <li>The sidebar should be responsive and collapsible</li>
          <li>It should display user-specific information and navigation</li>
          <li>You can interact with the sidebar items to navigate to different sections</li>
        </ul>
      </div>
    </div>
  );
}

