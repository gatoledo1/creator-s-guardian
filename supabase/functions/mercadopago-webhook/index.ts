import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Mercado Pago sends notifications via query params or body
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const paymentId = url.searchParams.get("id") || url.searchParams.get("data.id");

    // Also check body for IPN notifications
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body might be empty for some notification types
    }

    const notificationType = topic || body.type;
    const dataId = paymentId || body.data?.id;

    console.log("Webhook received:", { notificationType, dataId, body });

    // We're interested in payment notifications
    if (notificationType === "payment" && dataId) {
      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${dataId}`,
        {
          headers: {
            "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        console.error("Failed to fetch payment:", await paymentResponse.text());
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      const payment = await paymentResponse.json();
      console.log("Payment details:", JSON.stringify(payment, null, 2));

      const userId = payment.external_reference;
      const status = payment.status; // approved, pending, rejected, etc.

      if (status === "approved" && userId) {
        console.log(`Payment approved for user ${userId}`);

        // Update user subscription in database
        // First check if subscriptions table exists, if not we'll create it via migration
        const { error: updateError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            payment_id: String(payment.id),
            payment_method: payment.payment_type_id,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days for monthly
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        } else {
          console.log("Subscription updated successfully");
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent retries
    return new Response("OK", { status: 200, headers: corsHeaders });
  }
});
