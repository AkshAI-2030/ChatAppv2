import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get("token");

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }

  return children; // Render the child components if authenticated
};

export default ProtectedRoute;
