import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useAuthBootstrap } from '../hooks/useAuthBootstrap';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  useAuthBootstrap();
  return (
    <div className="flex min-h-full w-full flex-col bg-bg-primary text-text-primary">
      <Outlet />
    </div>
  );
}
