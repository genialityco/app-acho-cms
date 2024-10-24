import { type AuthProvider, Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { AuthPage, ThemedLayoutV2, ErrorComponent, useNotificationProvider, RefineThemes } from "@refinedev/mantine";
import { NotificationsProvider } from "@mantine/notifications";
import { MantineProvider, Global } from "@mantine/core";
import { customGenRestDataProvider } from "./components/dataProvider/customGenRestDataProvider";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";

import { EventCreate, EventEdit, EventList, EventShow } from "./pages";
import { AgendaCreate, AgendaEdit, AgendaList, AgendaShow } from "./pages";
import { PosterCreate, PosterEdit, PosterList, PosterShow } from "./pages";
import { SpeakerCreate, SpeakerEdit, SpeakerList, SpeakerShow } from "./pages";
import { ModuleCreate, ModuleEdit, ModuleList, ModuleShow } from "./pages";

/**
 *  mock auth credentials to simulate authentication
 */
const authCredentials = {
  email: "demo@refine.dev",
  password: "demodemo",
};

const App: React.FC = () => {
  const authProvider: AuthProvider = {
    login: async ({ providerName, email }) => {
      if (providerName === "google") {
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth";
        return {
          success: true,
        };
      }

      if (providerName === "github") {
        window.location.href = "https://github.com/login/oauth/authorize";
        return {
          success: true,
        };
      }

      if (email === authCredentials.email) {
        localStorage.setItem("email", email);
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid email or password",
        },
      };
    },
    register: async (params) => {
      if (params.email === authCredentials.email && params.password) {
        localStorage.setItem("email", params.email);
        return {
          success: true,
          redirectTo: "/",
        };
      }
      return {
        success: false,
        error: {
          message: "Register failed",
          name: "Invalid email or password",
        },
      };
    },
    updatePassword: async (params) => {
      if (params.password === authCredentials.password) {
        //we can update password here
        return {
          success: true,
        };
      }
      return {
        success: false,
        error: {
          message: "Update password failed",
          name: "Invalid password",
        },
      };
    },
    forgotPassword: async (params) => {
      if (params.email === authCredentials.email) {
        //we can send email with reset password link here
        return {
          success: true,
        };
      }
      return {
        success: false,
        error: {
          message: "Forgot password failed",
          name: "Invalid email",
        },
      };
    },
    logout: async () => {
      localStorage.removeItem("email");
      return {
        success: true,
        redirectTo: "/login",
      };
    },
    onError: async (error) => {
      if (error.response?.status === 401) {
        return {
          logout: true,
        };
      }

      return { error };
    },
    check: async () =>
      localStorage.getItem("email")
        ? {
            authenticated: true,
          }
        : {
            authenticated: false,
            error: {
              message: "Check failed",
              name: "Not authenticated",
            },
            logout: true,
            redirectTo: "/login",
          },
    getPermissions: async () => ["admin"],
    getIdentity: async () => ({
      id: 1,
      name: "Jane Doe",
      avatar: "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
    }),
  };

  return (
    <BrowserRouter>
      <MantineProvider theme={RefineThemes.Blue} withNormalizeCSS withGlobalStyles>
        <Global styles={{ body: { WebkitFontSmoothing: "auto" } }} />
        <NotificationsProvider position="top-right">
          <Refine
            dataProvider={customGenRestDataProvider}
            // {dataProvider("https://api.fake-rest.refine.dev")}
            authProvider={authProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "posts",
                list: "/posts/listar",
                show: "/posts/show/:id",
                edit: "/posts/edit/:id",
                create: "/posts/create",
              },
              {
                name: "events",
                list: "/events",
                show: "/events/show/:id",
                edit: "/events/edit/:id",
                create: "/events/create",
              },
              {
                //agendas/search?eventId=66f1e0b57c2e2fbdefa21271
                name: "agendas",
                list: "/agendas",
                show: "/agendas/show/:id",
                edit: "/agendas/edit/:id",
                create: "/agendas/create",
              },
              {
                //agendas/search?eventId=66f1e0b57c2e2fbdefa21271
                name: "posters",
                list: "/posters",
                show: "/posters/show/:id",
                edit: "/posters/edit/:id",
                create: "/posters/create",
              },
              {
                //agendas/search?eventId=66f1e0b57c2e2fbdefa21271
                name: "speakers",
                list: "/speakers",
                show: "/speakers/show/:id",
                edit: "/speakers/edit/:id",
                create: "/speakers/create",
              },
              {
                //agendas/search?eventId=66f1e0b57c2e2fbdefa21271
                name: "modules",
                list: "/modules",
                show: "/modules/show/:id",
                edit: "/modules/edit/:id",
                create: "/modules/create",
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="authenticated-routes" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayoutV2>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="posters" />} />

                <Route path="/events">
                  <Route index element={<EventList />} />
                  <Route path="listar" index element={<EventList />} />
                  <Route path="create" element={<EventCreate />} />
                  <Route path="edit/:id" element={<EventEdit />} />
                  <Route path="show/:id" element={<EventShow />} />
                </Route>
                <Route path="/agendas">
                  <Route index element={<AgendaList />} />
                  <Route path="create" element={<AgendaCreate />} />
                  <Route path="edit/:id" element={<AgendaEdit />} />
                  <Route path="show/:id" element={<AgendaShow />} />
                </Route>
                <Route path="/posters">
                  <Route index element={<PosterList />} />
                  <Route path="create" element={<PosterCreate />} />
                  <Route path="edit/:id" element={<PosterEdit />} />
                  <Route path="show/:id" element={<PosterShow />} />
                </Route>
                <Route path="/speakers">
                  <Route index element={<SpeakerList />} />
                  <Route path="create" element={<SpeakerCreate />} />
                  <Route path="edit/:id" element={<SpeakerEdit />} />
                  <Route path="show/:id" element={<SpeakerShow />} />
                </Route>
                <Route path="/modules">
                  <Route index element={<ModuleList />} />
                  <Route path="create" element={<ModuleCreate />} />
                  <Route path="edit/:id" element={<ModuleEdit />} />
                  <Route path="show/:id" element={<ModuleShow />} />
                </Route>                
              </Route>

              <Route
                element={
                  <Authenticated key="auth-pages" fallback={<Outlet />}>
                    <NavigateToResource resource="posts" />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  element={
                    <AuthPage
                      type="login"
                      formProps={{
                        initialValues: {
                          ...authCredentials,
                        },
                      }}
                      providers={[
                        {
                          name: "google",
                          label: "Sign in with Google",
                          icon: <IconBrandGoogle />,
                        },
                        {
                          name: "github",
                          label: "Sign in with GitHub",
                          icon: <IconBrandGithub />,
                        },
                      ]}
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthPage
                      type="register"
                      providers={[
                        {
                          name: "google",
                          label: "Sign in with Google",
                          icon: <IconBrandGoogle />,
                        },
                        {
                          name: "github",
                          label: "Sign in with GitHub",
                          icon: <IconBrandGithub />,
                        },
                      ]}
                    />
                  }
                />
                <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
                <Route path="/update-password" element={<AuthPage type="updatePassword" />} />
              </Route>

              <Route
                element={
                  <Authenticated key="catch-all">
                    <ThemedLayoutV2>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </NotificationsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
};

export default App;
