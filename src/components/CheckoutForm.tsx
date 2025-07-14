"use client"

import { useState } from 'react';
import { supabase } from '../utils/supabase';

const CARD_STYLES = {
  base: "p-8 bg-white rounded-2xl shadow-lg text-center",
  popular: "border-4 border-blue-500"
};

const BUTTON_STYLES = {
  base: "w-full px-6 py-3 text-lg font-bold text-white rounded-lg shadow-md transition-colors",
  primary: "bg-blue-600 hover:bg-blue-700",
  secondary: "bg-gray-600 hover:bg-gray-700"
};

const createCheckoutSession = async (priceId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("You must be logged in to subscribe.");
    return;
  }

  const { data, error } = await supabase.functions.invoke("stripe-webhook", {
    body: { priceId },
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  if (error) {
    console.error("Error creating checkout session:", error);
    alert("Error creating checkout session. Please try again.");
    return;
  }

  const { sessionId } = data;
  const stripe = window.Stripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY as string);
  await stripe?.redirectToCheckout({ sessionId });
};

export const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (priceId: string) => {
    setLoading(true);
    await createCheckoutSession(priceId);
    setLoading(false);
  };

  return (
    <section id="subscribe-section" className="my-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Option 1: Monthly Subscription */}
        <div className={`${CARD_STYLES.base} ${CARD_STYLES.popular}`}>
          <h3 className="text-2xl font-bold text-gray-900">Monthly Subscription</h3>
          <p className="mt-4 text-4xl font-extrabold text-gray-900">$5</p>
          <p className="mt-2 text-lg text-gray-600">per month</p>
          <button
            onClick={() => handleSubscription("price_1PFaG2H8xV6jB5g3hxqT0aB1")}
            className={`mt-6 ${BUTTON_STYLES.base} ${BUTTON_STYLES.primary}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Subscribe"}
          </button>
          <ul className="mt-6 text-left space-y-2 text-gray-600">
            <li>✅ Remove all watermarks</li>
            <li>✅ Priority support</li>
            <li>✅ Cancel anytime</li>
          </ul>
        </div>

        {/* Option 2: Lifetime Use */}
        <div className={CARD_STYLES.base}>
          <h3 className="text-2xl font-bold text-gray-900">Lifetime Access</h3>
          <p className="mt-4 text-4xl font-extrabold text-gray-900">$30</p>
          <p className="mt-2 text-lg text-gray-600">one-time payment</p>
          <button
            onClick={() => handleSubscription("price_1PFaH3H8xV6jB5g3IJJpzg5U")}
            className={`mt-6 ${BUTTON_STYLES.base} ${BUTTON_STYLES.secondary}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Get Lifetime Access"}
          </button>
          <ul className="mt-6 text-left space-y-2 text-gray-600">
            <li>✅ Remove all watermarks</li>
            <li>✅ Priority support</li>
            <li>✅ Pay once, use forever</li>
          </ul>
        </div>
      </div>
    </section>
  );
};