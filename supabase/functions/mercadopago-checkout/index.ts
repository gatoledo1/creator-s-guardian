import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  user_id: string;
  user_email: string;
  plan_type: "monthly" | "yearly";
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email, plan_type }: CheckoutRequest = await req.json();

    if (!user_id || !user_email) {
      return new Response(
        JSON.stringify({ error: "user_id and user_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define pricing
    const pricing = {
      monthly: { amount: 49, title: "DM Focus Pro - Mensal", description: "Assinatura mensal do DM Focus Pro" },
      yearly: { amount: 470, title: "DM Focus Pro - Anual", description: "Assinatura anual do DM Focus Pro (economize 20%)" },
    };

    const selectedPlan = pricing[plan_type] || pricing.monthly;

    // Create Mercado Pago preference for Checkout Pro
    // This allows PIX, credit card, and other payment methods
    const preferenceData = {
      items: [
        {
          id: `dmfocus_${plan_type}`,
          title: selectedPlan.title,
          description: selectedPlan.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: selectedPlan.amount,
        },
      ],
      payer: {
        email: user_email,
      },
      back_urls: {
        success: `${req.headers.get("origin") || "https://dmfocus.vercel.app"}/checkout/success`,
        failure: `${req.headers.get("origin") || "https://dmfocus.vercel.app"}/checkout/failure`,
        pending: `${req.headers.get("origin") || "https://dmfocus.vercel.app"}/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: user_id,
      notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
      payment_methods: {
        // Enable all payment methods including PIX
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12, // Allow up to 12 installments for credit cards
      },
      statement_descriptor: "DMFOCUS",
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    console.log("Creating Mercado Pago preference:", JSON.stringify(preferenceData, null, 2));

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Mercado Pago error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout preference", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const preference = await mpResponse.json();
    console.log("Preference created:", preference.id);

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point, // URL for production
        sandbox_init_point: preference.sandbox_init_point, // URL for sandbox/testing
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
