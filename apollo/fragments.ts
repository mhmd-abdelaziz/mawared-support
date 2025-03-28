import { gql } from "@apollo/client";

export const AUTH_FRAGMENT = gql`
  fragment authUser on User {
    profile_picture {
      path
      id
    }
    saas {
      id
    }
    user_type
    id
    name
    email
    phone
    lng: locale
    prviliege_ids
    prviliege_ids_with_all_employee_scope
    prviliege_ids_with_managed_employee_scope
    active
    hasActiveCompany
    office {
      name
      id
      time_zone
      company {
        name
        id
      }
      country {
        id
      }
    }
    offices {
      id
      name
      head_quarter
      company {
        id
        name
      }
      currency {
        id
      }
      currenciesWithDefaultCurrency {
        id
        name
        symbol
        defaultCurrencyOffice
      }
      country {
        id
      }
    }
    company {
      name
      id
      canAddNewEmployee
      hasActiveSubscription
      allow_multiple_offices_start
      allow_biometric_device
      getMonthBoundaries {
        from
        to
      }
      activeSubscription: currentSubscription {
        # subscriptionPrivilegesIds
        plan {
          id
          features {
            id
            pivot {
              limits
            }
          }
          privileges {
            id
          }
        }
      }
      allow_cost_center
      attendance_type
    }
    has_temporary_password
  }
`;

export const PAGINATOR_FRAGMENT = gql`
  fragment paginator on PaginatorInfo {
    total
    count
    perPage
    lastPage
    lastItem
    firstItem
    currentPage
    hasMorePages
  }
`;
