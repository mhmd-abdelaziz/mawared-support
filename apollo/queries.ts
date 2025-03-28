import { gql } from "@apollo/client";
import { PAGINATOR_FRAGMENT } from "./fragments";

export const GET_CHATS = gql`
  query getChats($page: Int, $first: Int!, $companyId: ID) {
    chats: whatsAppMessagesPerCompanyList(
      page: $page
      first: $first
      companyId: $companyId
    ) {
      data {
        id
        name
        type
        w_message_id
        company_contact_id
      }
      paginatorInfo {
        ...paginator
      }
    }
  }
  ${PAGINATOR_FRAGMENT}
`;
