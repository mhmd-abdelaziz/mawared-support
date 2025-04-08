import { AuthUser, Privileges } from "@/constants";

type checkPrivilegesArgs = {
  user: AuthUser;
  scope?: string;
  allowBP?: boolean;
  privileges: string[];
};

const checkPrivileges = (args: checkPrivilegesArgs) => {
  const main: string[] = args.user?.prviliege_ids || [];
  const allScope: string[] =
    args.user?.prviliege_ids_with_all_employee_scope || [];
  const managedScope: string[] =
    args.user?.prviliege_ids_with_managed_employee_scope || [];
  const planPrivileges: string[] = [
    Privileges.BUSINESS_PARTNER_PRIVILEGES,
    ...(args.user?.company?.activeSubscription?.subscriptionPrivilegesIds ||
      []),
  ];

  if (
    args?.allowBP &&
    main?.includes(Privileges.BUSINESS_PARTNER_PRIVILEGES) &&
    args.privileges?.some((priv) => planPrivileges?.indexOf(priv) !== -1)
  ) {
    return true;
  } else {
    if (args.privileges?.some((priv) => planPrivileges?.indexOf(priv) !== -1)) {
      switch (args?.scope) {
        case "all":
          return allScope?.some((prev) => args.privileges.indexOf(prev) !== -1);
        case "managed":
          return managedScope?.some(
            (prev) => args.privileges.indexOf(prev) !== -1
          );
        default:
          return main?.some((prev) => args.privileges.indexOf(prev) !== -1);
      }
    } else {
      return false;
    }
  }
};

export default checkPrivileges;
