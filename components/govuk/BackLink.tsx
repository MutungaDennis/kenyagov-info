import Link from "next/link";

export default function GovUKBackLink({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="govuk-back-link">
      Back
    </Link>
  );
}