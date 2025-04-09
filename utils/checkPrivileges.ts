import { AuthUser } from "@/constants";

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

  switch (args?.scope) {
    case "all":
      return allScope?.some((prev) => args.privileges.indexOf(prev) !== -1);
    case "managed":
      return managedScope?.some((prev) => args.privileges.indexOf(prev) !== -1);
    default:
      return main?.some((prev) => args.privileges.indexOf(prev) !== -1);
  }
};

export default checkPrivileges;
