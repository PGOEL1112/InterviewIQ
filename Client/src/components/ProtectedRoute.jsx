import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/auth" />;
  }

  try{
    const parsed = JSON.parse(user);
    if(!parsed?._id){
      return <Navigate to="/auth" />;
    }
  }
  catch(err){
    console.log(err);
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
