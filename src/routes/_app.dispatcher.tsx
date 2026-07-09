import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useRelayStore } from "@/lib/relay/store";

export const Route = createFileRoute("/_app/dispatcher")({
  beforeLoad: () => {
    const role = useRelayStore.getState().role;
    if (role !== "dispatcher") {
      throw redirect({ to: "/manager" });
    }
  },
  component: () => <Outlet />,
});
