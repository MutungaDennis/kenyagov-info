/**
 * Linked content list item — GOV.UK-style chevron row (not a visual “card”).
 */
import ChevronLinkList from "@/components/site/ChevronLinkList";

type Props = {
  title: string;
  description?: string;
  href: string;
  meta?: string;
};

export default function GovUKCard({ title, description, href, meta }: Props) {
  return (
    <ChevronLinkList
      items={[
        {
          title,
          href,
          description,
          meta,
        },
      ]}
    />
  );
}
