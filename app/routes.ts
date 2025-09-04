import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('docs', './routes/docs.tsx'),
  route('privacy', './routes/privacy.tsx'),
  route('terms', './routes/terms.tsx'),
  route('checkout', './routes/checkout.tsx'),
  route('success', './routes/success.tsx'),
  route('cancel', './routes/cancel.tsx'),
  route('setup', './routes/auth/setup.tsx'),
  route('login', './routes/auth/login.tsx'),
  route('logout', './routes/auth/logout.ts'),
  ...prefix('api', [
    route('checkout', './routes/api/checkout.ts'),
    route('track', './routes/api/track.ts'),
    route('validate', './routes/api/validate.ts'),
    route('webhook', './routes/api/webhook.ts'),
    route('test-telegram', './routes/api/test-telegram.ts'),
  ]),
  ...prefix('admin', [
    layout('./routes/admin/layout.tsx', [
      index('./routes/admin/index.tsx'),
      route('licenses', './routes/admin/licenses.tsx'),
      route('daily-usage', './routes/admin/daily-usage.tsx'),
      route('usage-analytics', './routes/admin/usage-analytics.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
