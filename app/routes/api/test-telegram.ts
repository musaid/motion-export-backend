import { data } from 'react-router';
import { testTelegramConnection } from '~/lib/telegram.server';
import type { Route } from './+types/test-telegram';

export async function loader({ request }: Route.LoaderArgs) {
  // Simple auth check - you might want to add proper admin authentication
  const url = new URL(request.url);
  const adminKey = url.searchParams.get('key');

  // Check if admin key matches (you should set this in env)
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return data({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const result = await testTelegramConnection();

  return data(result, {
    status: result.success ? 200 : 500,
  });
}
