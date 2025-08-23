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
  route('checkout', './routes/checkout.tsx'),
  route('success', './routes/success.tsx'),
  route('cancel', './routes/cancel.tsx'),
  route('setup', './routes/auth/admin-setup.tsx'),
  route('login', './routes/auth/admin-login.tsx'),
  route('logout', './routes/auth/admin-logout.ts'),
  ...prefix('api', [
    route('checkout', './routes/api/checkout.ts'),
    route('track', './routes/api/track.ts'),
    route('validate', './routes/api/validate.ts'),
    route('webhook', './routes/api/webhook.ts'),
  ]),
  ...prefix('admin', [
    layout('./routes/admin/layout.tsx', [
      index('./routes/admin/index.tsx'),
      route('licenses', './routes/admin/licenses.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
