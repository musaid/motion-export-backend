import Stripe from 'stripe';
import { createLicense } from '~/lib/license.server';
import { sendLicenseEmail } from '~/lib/email.server';
import {
  sendPurchaseNotification,
  sendRefundNotification,
  sendDisputeNotification,
} from '~/lib/telegram.server';
import type { Route } from './+types/webhook';
import { database } from '~/database/context';
import { eq } from 'drizzle-orm';
import { licenses } from '~/database/schema';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

export async function action({ request }: Route.ActionArgs) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
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
          const fullSession = await stripe.checkout.sessions.retrieve(
            session.id,
          );
          customerEmail =
            fullSession.customer_email ||
            fullSession.customer_details?.email ||
            null;
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
        const { plainKey } = await createLicense({
          email: customerEmail,
          stripeCustomerId: (session.customer as string) || null,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
        });

        // Send email with plain key
        await sendLicenseEmail(customerEmail, plainKey);
        console.log(`License created for ${customerEmail}`);

        // Send Telegram notification (fire-and-forget)
        sendPurchaseNotification({
          email: customerEmail,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          licenseKey: plainKey,
        });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;

      // Get the payment intent ID
      const paymentIntentId = charge.payment_intent as string;

      // First try to find by session ID (more reliable)
      let license = null;

      // Get the checkout session from the payment intent
      if (paymentIntentId) {
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);
        const sessionId =
          paymentIntent.metadata?.checkout_session_id ||
          (
            paymentIntent as Stripe.PaymentIntent & {
              checkout_session?: string;
            }
          ).checkout_session;

        if (sessionId) {
          const [foundLicense] = await database()
            .select()
            .from(licenses)
            .where(eq(licenses.stripeSessionId, sessionId))
            .limit(1);
          license = foundLicense;
        }
      }

      // Fallback to customer search if no session ID
      if (!license && charge.customer) {
        const allLicenses = await database()
          .select()
          .from(licenses)
          .where(eq(licenses.stripeCustomerId, charge.customer as string));

        // Find the most recent active license
        license = allLicenses
          .filter((l) => l.status === 'active')
          .sort(
            (a, b) =>
              new Date(b.purchasedAt || 0).getTime() -
              new Date(a.purchasedAt || 0).getTime(),
          )[0];
      }

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

        // Send Telegram notification (fire-and-forget)
        sendRefundNotification({
          licenseKey: license.key,
          email: license.email,
          amount: charge.amount_refunded / 100,
          currency: charge.currency || 'usd',
        });
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
              new Date(b.purchasedAt || 0).getTime() -
              new Date(a.purchasedAt || 0).getTime(),
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

          // Send Telegram notification (fire-and-forget)
          sendDisputeNotification({
            type: 'created',
            licenseKey: license.key,
            email: license.email,
            disputeId: dispute.id,
          });
        }
      }
      break;
    }

    case 'charge.dispute.closed': {
      const dispute = event.data.object as Stripe.Dispute;

      // Check if we won the dispute
      if (dispute.status === 'won') {
        const chargeId = dispute.charge as string;
        const chargeDetails = await stripe.charges.retrieve(chargeId);

        if (chargeDetails.customer) {
          // Find the disputed license
          const [license] = await database()
            .select()
            .from(licenses)
            .where(
              eq(licenses.stripeCustomerId, chargeDetails.customer as string),
            )
            .limit(1);

          if (license && license.status === 'disputed') {
            // Reactivate the license
            await database()
              .update(licenses)
              .set({
                status: 'active',
                metadata: JSON.stringify({
                  ...JSON.parse(license.metadata || '{}'),
                  disputeResolvedAt: new Date().toISOString(),
                  disputeOutcome: 'won',
                }),
                updatedAt: new Date().toISOString(),
              })
              .where(eq(licenses.id, license.id));

            console.log(
              `License reactivated after winning dispute: ${license.key}`,
            );

            // Send Telegram notification (fire-and-forget)
            sendDisputeNotification({
              type: 'won',
              licenseKey: license.key,
              email: license.email,
            });

            // Optionally send email to customer about reactivation
            // await sendLicenseReactivatedEmail(license.email);
          }
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response('OK', { status: 200 });
}
