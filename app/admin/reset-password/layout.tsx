// Clean layout for password reset page (avoids protected admin sidebar)
export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
