import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function LegacyGazetteNoticePage({
  params,
}: {
  params: Promise<{ noticeNumber: string }>;
}) {
  const { noticeNumber: noticeNumberStr } = await params;
  const noticeNumber = Number.parseInt(noticeNumberStr, 10);

  if (Number.isNaN(noticeNumber)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: notices, error } = await supabase
    .from("gazette_notices")
    .select("id, issue_id, notice_number")
    .eq("notice_number", noticeNumber)
    .limit(2);

  if (error || !notices || notices.length === 0) {
    notFound();
  }

  if (notices.length > 1) {
    redirect(`/kenya-gazette/search?q=${noticeNumber}`);
  }

  const notice = notices[0];

  if (!notice.issue_id) {
    redirect(`/kenya-gazette/search?q=${noticeNumber}`);
  }

  const { data: issue } = await supabase
    .from("gazette_issues")
    .select("year, issue_number")
    .eq("id", notice.issue_id)
    .maybeSingle();

  if (!issue) {
    redirect(`/kenya-gazette/search?q=${noticeNumber}`);
  }

  redirect(
    `/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`
  );
}
