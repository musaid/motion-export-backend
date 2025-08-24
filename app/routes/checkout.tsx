import { redirect } from 'react-router';
import Stripe from 'stripe';
import type { Route } from './+types/checkout';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

export async function loader({}: Route.LoaderArgs) {
  try {
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || '',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      customer_creation: 'always',
      billing_address_collection: 'required',
      metadata: {
        productType: 'motion-export-pro',
      },
    });

    // Redirect to Stripe checkout
    if (session.url) {
      return redirect(session.url);
    }

    // Fallback to home if no URL
    return redirect('/');
  } catch (error) {
    console.error('Checkout error:', error);
    // Redirect to home with error
    return redirect('/?error=checkout_failed');
  }
}
