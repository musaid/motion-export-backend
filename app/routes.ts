import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  ...prefix('api', [
    route('checkout', './routes/api/checkout.ts'),
    route('track', './routes/api/track.ts'),
    route('validate', './routes/api/validate.ts'),
    route('webhook', './routes/api/webhook.ts'),
  ]),
  ...prefix('admin', [
    layout('./routes/admin/layout.tsx', [
      index('./routes/admin/index.tsx'),
      route('logout', './routes/admin/logout.ts'),
      route('licenses', './routes/admin/licenses.tsx'),
      route('login', './routes/admin/login.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
