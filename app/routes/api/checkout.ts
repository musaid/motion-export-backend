import Stripe from 'stripe';
import { z } from 'zod';
import type { Route } from './+types/checkout';
import { data } from 'react-router';
import { corsHeaders, handleCors } from '~/lib/cors.server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const checkoutSchema = z.object({
  userId: z.string().optional(),
  email: z.email().optional(),
});

// Handle OPTIONS and GET requests
export async function loader({ request }: Route.LoaderArgs) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  const origin = request.headers.get('origin');
  // Return method not allowed for GET
  return data(
    { error: 'Method not allowed' }, 
    { status: 405, headers: corsHeaders(origin) }
  );
}

export async function action({ request }: Route.ActionArgs) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  const origin = request.headers.get('origin');
  
  try {
    const body = await request.json();
    const { userId, email } = checkoutSchema.parse(body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      customer_email: email,
      metadata: {
        figmaUserId: userId || '',
        productType: 'motion-export-pro',
      },
    });

    return data({
      checkoutUrl: session.url,
      sessionId: session.id,
    }, { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Checkout error:', error);
    return data(
      { error: 'Failed to create checkout session' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
