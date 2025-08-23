import Stripe from 'stripe';
import { createLicense } from '~/lib/license.server';
import { sendLicenseEmail } from '~/lib/email.server';
import type { Route } from './+types/webhook';
import { database } from '~/database/context';
import { eq } from 'drizzle-orm';
import { licenses } from '~/database/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function action({ request }: Route.ActionArgs) {
  const signature = request.headers.get('stripe-signature')!;
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  console.log(`Webhook received: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only process if payment is successful
      if (session.payment_status === 'paid') {
        // Check if we already processed this session
        const existing = await database()
          .select()
          .from(licenses)
          .where(eq(licenses.stripeSessionId, session.id))
          .limit(1);

        if (existing.length > 0) {
          console.log('Session already processed');
          return new Response('OK', { status: 200 });
        }

        // Fetch the full session details if email is missing
        let customerEmail = session.customer_email;
        let customerDetails = session.customer_details;
        
        if (!customerEmail) {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id);
          customerEmail = fullSession.customer_email || fullSession.customer_details?.email || null;
          customerDetails = fullSession.customer_details;
        }

        // If still no email, try to get it from customer details
        if (!customerEmail && customerDetails?.email) {
          customerEmail = customerDetails.email;
        }

        // If we still don't have an email, log error and return
        if (!customerEmail) {
          console.error('No email found in checkout session:', session.id);
          return new Response('OK', { status: 200 });
        }

        // Create license
        const { license, plainKey } = await createLicense({
          email: customerEmail,
          stripeCustomerId: session.customer as string || null,
          stripeSessionId: session.id,
          amount: session.amount_total! / 100,
          currency: session.currency!,
        });

        // Send email with plain key
        await sendLicenseEmail(customerEmail, plainKey);
        console.log(
          `License created for ${customerEmail}`,
        );
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;

      // Find license by payment intent ID stored in metadata
      const paymentIntentId = charge.payment_intent as string;

      // Search for license with this payment intent in metadata
      const allLicenses = await database()
        .select()
        .from(licenses)
        .where(eq(licenses.stripeCustomerId, charge.customer as string));

      // Find the matching license
      const license = allLicenses.find((l) => {
        const metadata = JSON.parse(l.metadata || '{}');
        return metadata.paymentIntentId === paymentIntentId;
      });

      if (license) {
        // Revoke the license
        await database()
          .update(licenses)
          .set({
            status: 'refunded',
            metadata: JSON.stringify({
              ...JSON.parse(license.metadata || '{}'),
              refundedAt: new Date().toISOString(),
              refundAmount: charge.amount_refunded / 100,
            }),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(licenses.id, license.id));

        console.log(`License refunded: ${license.key}`);
      }
      break;
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object as Stripe.Dispute;

      // Find and revoke license
      const chargeId = dispute.charge as string;
      const chargeDetails = await stripe.charges.retrieve(chargeId);

      if (chargeDetails.customer) {
        const customerLicenses = await database()
          .select()
          .from(licenses)
          .where(
            eq(licenses.stripeCustomerId, chargeDetails.customer as string),
          );

        // Find the most recent active license for this customer
        const license = customerLicenses
          .filter((l) => l.status === 'active')
          .sort(
            (a, b) =>
              new Date(b.purchasedAt!).getTime() -
              new Date(a.purchasedAt!).getTime(),
          )[0];

        if (license) {
          await database()
            .update(licenses)
            .set({
              status: 'disputed',
              metadata: JSON.stringify({
                ...JSON.parse(license.metadata || '{}'),
                disputeId: dispute.id,
                disputedAt: new Date().toISOString(),
              }),
              updatedAt: new Date().toISOString(),
            })
            .where(eq(licenses.id, license.id));

          console.log(`License revoked due to dispute: ${license.key}`);
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response('OK', { status: 200 });
}
