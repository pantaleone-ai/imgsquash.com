import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@10.17.0'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createOrRetrieveCustomer = async ({ uuid, email, supabaseAdmin }: { uuid: string; email: string; supabaseAdmin: SupabaseClient<any, "public", any> }) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', uuid)
    .single()

  if (error || !data?.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: email,
      metadata: { supabase_uuid: uuid },
    })

    await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', uuid)

    return customer.id
  }
  return data.stripe_customer_id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature')

  if (signature) {
    const body = await req.text()
    let event
    try {
      event = await stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!
      )
    } catch (err) {
      console.error(`Webhook signature verification failed.`)
      return new Response(err.message, { status: 400 })
    }

    const checkoutSession = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('stripe_customer_id', checkoutSession.customer)

      if (error) {
        console.error('Error updating user subscription status:', error)
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  }

  try {
    const { priceId } = await req.json()

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const customerId = await createOrRetrieveCustomer({
      uuid: user.id,
      email: user.email!,
      supabaseAdmin,
    })
    
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}`,
      cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}`,
    })

    return new Response(JSON.stringify({ sessionId: session.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }})

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  }
})