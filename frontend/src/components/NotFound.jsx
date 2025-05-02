import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">
        404 - Page Not Found
      </h1>
      <p className="mb-6 text-gray-600">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
