import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/auth";
import ProblemsPage from "./pages/problems";
import AssessmentPage from "./pages/assessment";
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
      {
        path: "auth",
        name: "auth",
        element: <AuthPage />,
      },
      {
        path: "problems",
        name: "problems",
        element: <ProblemsPage />,
      },
      {
        path: "assessment/:sessionId",
        name: "assessment",
        element: <AssessmentPage />,
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
