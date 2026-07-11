import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "warning";
  isStart?: boolean;
};

export default function GovUKButton({
  children,
  variant = "primary",
  isStart = false,
  className = "",
  ...props
}: Props) {
  const classes = [
    "govuk-button",
    variant === "secondary" ? "govuk-button--secondary" : "",
    variant === "warning" ? "govuk-button--warning" : "",
    isStart ? "govuk-button--start" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} data-module="govuk-button" {...props}>
      {children}
      {isStart && (
        <svg
          className="govuk-button__start-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="17.5"
          height="19"
          viewBox="0 0 33 40"
          aria-hidden="true"
          focusable="false"
        >
          <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
        </svg>
      )}
    </button>
  );
}
