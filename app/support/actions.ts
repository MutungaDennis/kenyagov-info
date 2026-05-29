"use server";

import { createClient } from "@supabase/supabase-js";

export async function createSupportIntent(formData: FormData, turnstileToken: string) {
  const tier = formData.get("support_tier") as string;
  const customAmount = formData.get("custom_amount") as string;
  const currency = formData.get("currency") as string;
  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Server error: Missing payment routing credentials." };
  }

  // Determine final transactional amount based on selected options
  let finalAmountCents = 0;
  if (tier === "custom") {
    const parsed = parseFloat(customAmount);
    if (isNaN(parsed) || parsed <= 0) {
      return { success: false, error: "Please enter a valid support amount." };
    }
    finalAmountCents = Math.round(parsed * 100);
  } else {
    finalAmountCents = parseInt(tier, 10) * 100;
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Insert payment intent into the secure database ledger
    const { data, error } = await supabaseAdmin
      .from("initiative_support_intents")
      .insert([
        {
          amount_cents: finalAmountCents,
          currency: currency,
          support_tier: tier,
          email_address: email,
          full_name: fullName || null,
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) return { success: false, error: `Database Error: ${error.message}` };

    /**
     * FUTURE PRODUCTION TIP: 
     * This is where you call your Pesapal, IntaSend, or Stripe API using 'finalAmountCents' 
     * and pass back the genuine secure checkout URL to the frontend client.
     */
    const mockCheckoutUrl = `/support/checkout-mock?intentId=${data.id}`;

    return { success: true, checkoutUrl: mockCheckoutUrl };
  } catch (err: any) {
    return { success: false, error: `Server Exception: ${err.message || err}` };
  }
}
