import { redirect } from 'next/navigation';
export default function ConsultationsRedirect() {
  redirect('/search/all?document_type=consultation');
}