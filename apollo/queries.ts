import { gql } from "@apollo/client";
import { MESSAGE, PAGINATOR_FRAGMENT } from "./fragments";

export const GET_CHATS = gql`
  query getChats($page: Int, $first: Int!) {
    chats: whatsAppMessagesPerCompanyList(page: $page, first: $first) {
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

export const GET_CHAT = gql`
  query getChat($companyContactId: ID) {
    chat: whatsAppMessagesBetweenClients(
      type: private
      companyContactId: $companyContactId
    ) {
      canSend
      hasMorePage
      data {
        ...message
      }
    }
    users: getSaasCanRepresent(companyContactId: $companyContactId) {
      id
      name
    }
  }
  ${MESSAGE}
`;

export const GET_CONTACTS = gql`
  query getContacts($companyId: ID) {
    generatedContacts(companyId: $companyId) {
      name
      contactUser {
        id
        phone
      }
    }
  }
`;

export const GET_TEMPLATES = gql`
  query whatsAppTemplates {
    whatsAppTemplates {
      id
      name
      content
    }
  }
`;
