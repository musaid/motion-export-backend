/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */

import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router';

export const Link = forwardRef(function Link(
  props: { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof RouterLink>,
    'to'
  >,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { href, ...restProps } = props;
  return (
    <Headless.DataInteractive>
      <RouterLink to={href} {...restProps} ref={ref}>
        {props.children}
      </RouterLink>
    </Headless.DataInteractive>
  );
});
