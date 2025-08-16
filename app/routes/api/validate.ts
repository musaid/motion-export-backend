import { data } from 'react-router';
import { validateLicense, checkDailyUsage } from '~/lib/license.server';
import { z } from 'zod';
import type { Route } from './+types/validate';

const validateSchema = z.object({
  licenseKey: z.string().optional(),
  deviceId: z.string(),
});

export async function action({ request }: Route.ActionArgs) {
  try {
    const body = await request.json();
    const { licenseKey, deviceId } = validateSchema.parse(body);

    // Check for pro license
    if (licenseKey) {
      const result = await validateLicense(licenseKey, deviceId);

      if (result.valid) {
        return data({
          valid: true,
          isPro: true,
          license: {
            key: result.license!.key,
            email: result.license!.email,
            purchasedAt: result.license!.purchasedAt,
          },
        });
      }

      return data({
        valid: false,
        error: result.error,
      });
    }

    // Check daily usage for free tier
    const usage = await checkDailyUsage(deviceId);

    return data({
      valid: usage.canExport,
      isPro: false,
      dailyUsageCount: usage.count,
      dailyLimit: usage.limit,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return data({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
