import { gql } from "@apollo/client";
import { AUTH_FRAGMENT } from "./fragments";

export const SIGN_IN = gql`
  mutation signIn(
    $username: String!
    $password: String!
    $device_token: String!
    $device_type: String!
  ) {
    login(
      input: {
        username: $username
        password: $password
        device_token: $device_token
        device_type: $device_type
        api_type: "graphql"
      }
    ) {
      access_token
      user {
        ...authUser
      }
    }
  }
  ${AUTH_FRAGMENT}
`;
