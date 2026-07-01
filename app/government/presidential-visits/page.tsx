import { redirect } from 'next/navigation';

export default function PresidentialVisitsRedirect() {
  // Instantly redirects the user to the Master Search Engine 
  // with the 'presidential_trip' filter pre-applied.
  redirect('/search/all?document_type=presidential_trip');
}
