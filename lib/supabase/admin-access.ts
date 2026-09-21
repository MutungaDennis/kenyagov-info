import { createServiceClient } from "@/lib/supabase/service";

/**
 * Checks administrator status using the server-only service-role client.
 *
 * The supplied user ID must come from a validated Supabase session.
 * Never accept an arbitrary client-supplied user ID for authorization.
 */
export async function isAdminUserId(
  userId: string,
): Promise<boolean> {
  try {
    const serviceClient =
      createServiceClient();

    const { data: profile, error } =
      await serviceClient
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
      console.error(
        "Service-role admin lookup failed:",
        {
          userId,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      );

      return false;
    }

    if (!profile) {
      console.error(
        "No administrator profile was found:",
        {
          userId,
        },
      );

      return false;
    }

    return profile.is_admin === true;
  } catch (error) {
    console.error(
      "Administrator lookup failed:",
      error,
    );

    return false;
  }
}