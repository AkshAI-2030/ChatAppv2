import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
