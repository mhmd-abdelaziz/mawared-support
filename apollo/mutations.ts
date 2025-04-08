import { gql } from "@apollo/client";
import { AUTH_FRAGMENT, MESSAGE } from "./fragments";

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

export const SEND_TEMPLATE = gql`
  mutation sendMessage($input: SenderAsTemplateDataInput) {
    sendMessageViaTemplate(input: $input) {
      ...message
    }
  }
  ${MESSAGE}
`;

export const SEND_MESSAGE = gql`
  mutation sendMessage($input: SenderDataInput) {
    sendMessage(input: $input) {
      ...message
    }
  }
  ${MESSAGE}
`;

export const REPLAY_MESSAGE = gql`
  mutation replyMessage($input: ReplyDataInput) {
    replyOnMessage(input: $input) {
      ...message
    }
  }
  ${MESSAGE}
`;
