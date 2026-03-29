import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
