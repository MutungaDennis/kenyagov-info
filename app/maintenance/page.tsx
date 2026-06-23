import { redirect } from 'next/navigation';

export default function MaintenancePage() {
  // Kill switch feature has been removed. Redirect to home.
  redirect('/');
}