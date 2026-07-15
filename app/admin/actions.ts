"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentUser,
  isCurrentUserAdmin,
} from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { adminPath } from "@/lib/admin-path";

async function assertAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }
  if (user.email === "dennis.mutunga14@gmail.com") {
    return { ok: true };
  }
  const admin = await isCurrentUserAdmin();
  if (!admin) {
    return { ok: false, error: "You do not have admin permission." };
  }
  return { ok: true };
}

export async function deleteContactMessage(id: string) {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("deleteContactMessage:", error);
      return { success: false, error: error.message };
    }
    revalidatePath(adminPath("contact"));
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed",
    };
  }
}

export async function deleteGeneralFeedback(id: string) {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("general_feedback")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("deleteGeneralFeedback:", error);
      return { success: false, error: error.message };
    }
    revalidatePath(adminPath("feedback"));
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed",
    };
  }
}

export async function deleteBugReport(id: string) {
  const gate = await assertAdmin();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("citizen_feedback")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("deleteBugReport:", error);
      return { success: false, error: error.message };
    }
    revalidatePath(adminPath("bug-reports"));
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Delete failed",
    };
  }
}
