// components/govuk/ActionDropdown.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}

interface ActionDropdownProps {
  actions: Action[];
  buttonText?: string;
}

export default function ActionDropdown({ actions, buttonText = "Actions" }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="govuk-dropdown dropdown-relative">
      <button
        className="govuk-button govuk-button--secondary dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {buttonText} ▾
      </button>

      {isOpen && (
        <div 
          className="govuk-dropdown__content dropdown-content"
          onMouseLeave={() => setIsOpen(false)}
        >
          {actions.map((action, index) => (
            <div key={index}>
              {action.href ? (
                <Link
                  href={action.href}
                  className={`govuk-link block px-4 py-2 hover:bg-gray-100 ${action.destructive ? 'govuk-link--destructive' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  className={`govuk-link block w-full text-left px-4 py-2 hover:bg-gray-100 ${action.destructive ? 'govuk-link--destructive' : ''}`}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                >
                  {action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}