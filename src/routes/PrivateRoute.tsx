import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const PrivateRoute: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
