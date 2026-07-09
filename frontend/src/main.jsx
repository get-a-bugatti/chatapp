import {lazy, Suspense} from "react";
import { createRoot } from 'react-dom/client'
import './index.css'

import App, {AppLoader} from './App.jsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Protected from './components/Protected.jsx'
import LoadingScreen from './components/LoadingScreen.jsx';
// import UserBox from './components/UserBox.jsx'

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
    loader: AppLoader,
    children: [
      {
        element: <Protected authentication={true} />,
        children: [
          {
            index: true,
            element: <Users />
          }, 
          {
            path: "global",
           element: <GlobalChat />
          }, 
          {
            path: "private/:userId",
            element: <PrivateChat />
          },
          {
            path: "users/all",
            element: <Users />
          }
        ]
      },
      {
        element: <Protected authentication={false} />,
        children: [
          {
            path: "login",
            element: <Login />
          },
          {
            path: "signup",
            element: <Signup />
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />
          },
          {
            path: "verify-otp",
            element: <VerifyOtpPage />
          },
          {
            path: "set-new-password",
            element: <SetNewPasswordPage />
          }
        ]
      },
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
