import { redirect } from 'next/navigation';
export default function CabinetDecisionsRedirect() {
  redirect('/search/all?document_type=cabinet_decision');
}