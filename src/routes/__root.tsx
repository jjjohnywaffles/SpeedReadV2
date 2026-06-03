import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-full w-full flex-col bg-bg-primary text-text-primary">
      <Outlet />
    </div>
  ),
});
