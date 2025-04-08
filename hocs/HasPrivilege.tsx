import React from "react";
import { useAuth } from "@/hooks";
import { checkPrivileges } from "@/utils";

interface HasPrivilegeProps {
  scope?: string;
  allowBP?: boolean;
  privileges: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const HasPrivilege: React.FC<HasPrivilegeProps> = ({
  scope,
  allowBP,
  children,
  fallback,
  privileges,
}) => {
  const { user } = useAuth();

  const hasAccess = React.useMemo(() => {
    if (!user) return false;
    return checkPrivileges({ user, privileges, allowBP, scope });
  }, [JSON.stringify(user), privileges.length]);

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default HasPrivilege;
