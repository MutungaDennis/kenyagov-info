import { redirect } from 'next/navigation';
export default function PublicationsRedirect() {
  redirect('/search/all?document_type=publication');
}