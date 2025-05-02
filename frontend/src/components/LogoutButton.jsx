import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token"); // Remove token from cookies
    navigate("/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
