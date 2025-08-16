import Stripe from 'stripe';
import { z } from 'zod';
import type { Route } from './+types/checkout';
import { data } from 'react-router';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const checkoutSchema = z.object({
  userId: z.string().optional(),
  email: z.email().optional(),
});

export async function action({ request }: Route.ActionArgs) {
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
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return data(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
