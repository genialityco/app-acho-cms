import React from "react";
import {
  type AuthProvider,
  Authenticated,
  OnErrorResponse,
  Refine,
} from "@refinedev/core";
import {
  AuthPage,
  ThemedLayoutV2,
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/mantine";
import { MantineProvider, Global, Group, Image, Text } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";

import { customGenRestDataProvider } from "./components/dataProvider/customGenRestDataProvider";

// Importa páginas
import { EventCreate, EventEdit, EventList, EventShow } from "./pages/events";
import {
  AgendaCreate,
  AgendaEdit,
  AgendaList,
  AgendaShow,
} from "./pages/agendas";
import {
  PosterCreate,
  PosterEdit,
  PosterList,
  PosterShow,
} from "./pages/posters";
import {
  SpeakerCreate,
  SpeakerEdit,
  SpeakerList,
  SpeakerShow,
} from "./pages/speakers";
import {
  ModuleCreate,
  ModuleEdit,
  ModuleList,
  ModuleShow,
} from "./pages/modules";
import { NewsCreate, NewsEdit, NewsList } from "./pages/news";
import { MemberList } from "./pages/member/list";
import {
  NotificationTemplateCreate,
  NotificationTemplateEdit,
  NotificationTemplateList,
} from "./pages/notifications";
import { CertificatesList } from "./pages/certificates/list";

// Mock de credenciales de autenticación
const authCredentials = {
  email: "recertificacion@acho.com.co",
  password: "123456",
};

// Proveedor de autenticación
const authProvider: AuthProvider = {
  login: async ({ providerName, email }) => {
    if (providerName === "google") {
      window.location.href = "https://accounts.google.com/o/oauth2/v2/auth";
      return { success: true };
    }

    if (providerName === "github") {
      window.location.href = "https://github.com/login/oauth/authorize";
      return { success: true };
    }

    if (email === authCredentials.email) {
      localStorage.setItem("email", email);
      return { success: true, redirectTo: "/" };
    }

    return {
      success: false,
      error: { message: "Login failed", name: "Invalid email or password" },
    };
  },
  logout: async () => {
    localStorage.removeItem("email");
    return { success: true, redirectTo: "/login" };
  },
  check: async () =>
    localStorage.getItem("email")
      ? { authenticated: true }
      : {
          authenticated: false,
          error: { message: "Check failed", name: "Not authenticated" },
          logout: true,
          redirectTo: "/login",
        },
  getPermissions: async () => ["admin"],
  getIdentity: async () => ({
    id: 1,
    name: "Admin",
    avatar: "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
  }),
  onError: function (error: any): Promise<OnErrorResponse> {
    throw new Error("Function not implemented.");
  },
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <Global styles={{ body: { WebkitFontSmoothing: "auto" } }} />
        <NotificationsProvider position="top-right">
          <Refine
            dataProvider={customGenRestDataProvider}
            authProvider={authProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "events",
                list: "/events",
                show: "/events/show/:id",
                edit: "/events/edit/:id",
                create: "/events/create",
              },
              {
                name: "agendas",
                list: "/agendas",
                show: "/agendas/show/:id",
                edit: "/agendas/edit/:id",
                create: "/agendas/create",
              },
              {
                name: "posters",
                list: "/posters",
                show: "/posters/show/:id",
                edit: "/posters/edit/:id",
                create: "/posters/create",
              },
              {
                name: "speakers",
                list: "/speakers",
                show: "/speakers/show/:id",
                edit: "/speakers/edit/:id",
                create: "/speakers/create",
              },
              {
                name: "modules",
                list: "/modules",
                show: "/modules/show/:id",
                edit: "/modules/edit/:id",
                create: "/modules/create",
              },
              {
                name: "news",
                list: "/news",
                show: "/news/show/:id",
                edit: "/news/edit/:id",
                create: "/news/create",
              },
              {
                name: "members",
                list: "/members",
                show: "/members/show/:id",
                edit: "/members/edit/:id",
                create: "/members/create",
              },
              {
                name: "notification-templates",
                list: "/notification-templates",
                show: "/notification-templates/show/:id",
                edit: "/notification-templates/edit/:id",
                create: "/notification-templates/create",
                meta: {
                  label: "Notifications",
                },
              },
              {
                name: "certificates",
                list: "/certificates",
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              title: {
                icon: (
                  <Image src="/icons/LOGOSIMBOLO_ASOCIACION.png" width={40} />
                ),
                text: (
                  <Text weight={700} size="xl">
                    ACHO
                  </Text>
                ),
              },
            }}
          >
            <Routes>
              {/* Rutas autenticadas */}
              <Route
                element={
                  <Authenticated
                    key="dashboard"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2>
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="events" />}
                />
                <Route path="/events">
                  <Route index element={<EventList />} />
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
                <Route path="/news">
                  <Route index element={<NewsList />} />
                  <Route path="create" element={<NewsCreate />} />
                  <Route path="edit/:id" element={<NewsEdit />} />
                  {/* <Route path="show/:id" element={<ModuleShow />} /> */}
                </Route>
                <Route path="/members">
                  <Route index element={<MemberList />} />
                  {/* <Route path="create" element={<NewsCreate />} />
                  <Route path="edit/:id" element={<NewsEdit />} /> */}
                  {/* <Route path="show/:id" element={<ModuleShow />} /> */}
                </Route>
                <Route path="/notification-templates">
                  <Route index element={<NotificationTemplateList />} />
                  <Route
                    path="create"
                    element={<NotificationTemplateCreate />}
                  />
                  <Route
                    path="edit/:id"
                    element={<NotificationTemplateEdit />}
                  />
                  {/* <Route path="show/:id" element={<ModuleShow />} /> */}
                </Route>
                <Route path="/certificates">
                  <Route index element={<CertificatesList />} />
                  {/* <Route path="create" element={<NotificationTemplateCreate />} />
                  <Route path="edit/:id" element={<NotificationTemplateEdit />} />  */}
                  {/* <Route path="show/:id" element={<ModuleShow />} /> */}
                </Route>
              </Route>

              {/* Rutas públicas */}
              <Route
                element={
                  <Authenticated key="public" fallback={<Outlet />}>
                    <NavigateToResource resource="events" />
                  </Authenticated>
                }
              >
                <Route
                  path="/login"
                  
                  element={
                    <AuthPage
                      type="login"
                      registerLink={false}
                      forgotPasswordLink={false}
                      formProps={{ initialValues: { ...authCredentials } }}
                    />
                  }
                />
              </Route>

              {/* Catch-All */}
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
