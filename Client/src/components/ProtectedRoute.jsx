import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const user = localStorage.getItem("name");

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
