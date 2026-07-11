// components/govuk/ActionDropdown.tsx
'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

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

/**
 * Compact actions menu used in admin tables.
 * Styled with app-prefixed classes (not Tailwind utilities).
 */
export default function ActionDropdown({
  actions,
  buttonText = 'Actions',
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="app-action-dropdown" ref={rootRef}>
      <button
        type="button"
        className="govuk-button govuk-button--secondary app-action-dropdown__button"
        data-module="govuk-button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {buttonText}
        <span className="govuk-visually-hidden"> menu</span>
        <span aria-hidden="true" className="app-action-dropdown__caret">
          {' '}
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="app-action-dropdown__menu"
          role="menu"
        >
          {actions.map((action, index) => {
            const itemClass = [
              'app-action-dropdown__item',
              action.destructive ? 'app-action-dropdown__item--destructive' : '',
            ]
              .filter(Boolean)
              .join(' ');

            if (action.href) {
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={itemClass}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={index}
                type="button"
                className={itemClass}
                role="menuitem"
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
