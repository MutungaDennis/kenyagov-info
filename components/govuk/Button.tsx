import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "warning";
  isStart?: boolean;
};

export default function GovUKButton({ 
  children, 
  variant = "primary", 
  isStart = false,
  ...props 
}: Props) {
  return (
    <button
      className={`govuk-button 
        ${variant === "secondary" ? "govuk-button--secondary" : ""}
        ${variant === "warning" ? "govuk-button--warning" : ""}
        ${isStart ? "govuk-button--start" : ""}`}
      data-module="govuk-button"
      {...props}
    >
      {children}
    </button>
  );
}