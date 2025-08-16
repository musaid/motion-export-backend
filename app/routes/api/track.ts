// app/routes/api.track.tsx
import { data } from 'react-router';
import { usageAnalytics, dailyUsage } from '~/database/schema';
import { database } from '~/database/context';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import type { Route } from './+types/track';

const trackSchema = z.object({
  event: z.string(),
  userId: z.string().optional(),
  deviceId: z.string().optional(),
  licenseKey: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json();
    const data = trackSchema.parse(body);

    // Get IP and user agent
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track event
    await database()
      .insert(usageAnalytics)
      .values({
        event: data.event,
        userId: data.userId,
        licenseKey: data.licenseKey,
        properties: JSON.stringify(data.properties || {}),
        ip,
        userAgent,
      });

    // If it's an export event, update daily usage
    if (data.event === 'export_completed' && data.deviceId) {
      const today = new Date().toISOString().split('T')[0];

      // Check if record exists
      const [existing] = await database()
        .select()
        .from(dailyUsage)
        .where(
          and(
            eq(dailyUsage.deviceId, data.deviceId),
            eq(dailyUsage.date, today),
          ),
        )
        .limit(1);

      if (existing) {
        await database()
          .update(dailyUsage)
          .set({ exportCount: (existing.exportCount || 0) + 1 })
          .where(eq(dailyUsage.id, existing.id));
      } else {
        await database().insert(dailyUsage).values({
          deviceId: data.deviceId,
          date: today,
          exportCount: 1,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return data({ error: 'Failed to track event' }, { status: 500 });
  }
}
