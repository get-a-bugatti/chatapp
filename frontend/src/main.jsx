import {lazy, Suspense} from "react";
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Protected from './components/Protected.jsx'
import UserBox from './components/UserBox.jsx'
import LoadingScreen from './components/LoadingScreen.jsx';

import{ Login, Signup } from "./pages/index.js"
const Users = lazy(() => import("./pages/Users.jsx"));
const GlobalChat = lazy(() => import("./pages/GlobalChat.jsx"));
const PrivateChat = lazy(() => import("./pages/PrivateChat.jsx"));

const ForgotPasswordPage = lazy(() =>
  import("./pages").then(module => ({
    default: module.ForgotPasswordPage,
  }))
);

const VerifyOtpPage = lazy(() =>
  import("./pages").then(module => ({
    default: module.VerifyOtpPage,
  }))
);

const SetNewPasswordPage = lazy(() =>
  import("./pages").then(module => ({
    default: module.SetNewPasswordPage,
  }))
);
import { Provider } from 'react-redux'
import store from './store/store.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Protected authentication={true}>
            <Users />
          </Protected>
        ),
      },
      {
        path: "login",
        element: (
          <Protected authentication={false}>
            <Login />
          </Protected>
        ),
      },
      {
        path: "signup",
        element: (
          <Protected authentication={false}>
            <Signup />
          </Protected>
        ),
      },
      {
        path: "global",
        element: (
          <Protected authentication={true}>
            <GlobalChat />
          </Protected>
        ),
      },
      {
        path: "private/:userId",
        element: (
          <Protected authentication={true}>
            <PrivateChat />
          </Protected>
        ),
      },
      {
        path: "users/all",
        element: (
          <Protected authentication={true}>
            <Users />
          </Protected>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Protected authentication={false}>
            <ForgotPasswordPage />
          </Protected>
        ),
      },
      {
        path: "verify-otp",
        element: (
          <Protected authentication={false}>
            <VerifyOtpPage />
          </Protected>
        )
      },
      {
        path: "set-new-password",
        element: (
          <Protected authentication={false}>
            <SetNewPasswordPage />
          </Protected>
        )
      },
      {
        path: "test",
        element: (
            <UserBox />
        ),
      }
    ],
  },
]);

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
)
