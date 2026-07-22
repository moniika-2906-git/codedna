import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/landing";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "root",
    element: <AppLayout />,
    children: [
      {
        index: true,
        name: "home",
        element: <LandingPage />,
      },
      /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
      {
        path: "*",
        name: "404",
        element: <NotFound />,
      },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
