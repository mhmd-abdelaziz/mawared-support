import { gql } from "@apollo/client";
import { MESSAGE, PAGINATOR_FRAGMENT } from "./fragments";

export const GET_CHATS = gql`
  query getChats(
    $page: Int
    $first: Int!
    $input: FilterWhatsAppMessagesPerCompanyList
  ) {
    chats: whatsAppMessagesPerCompanyList(
      page: $page
      first: $first
      input: $input
    ) {
      data {
        id
        name
        type
        w_message_id
        company_contact_id
        unreadCount: unreadMessagesPerContactOfCurrentMessage
      }
      paginatorInfo {
        ...paginator
      }
    }
  }
  ${PAGINATOR_FRAGMENT}
`;

export const GET_ANON_CHATS = gql`
  query getChats($page: Int, $first: Int!, $phone: String) {
    chats: whatsAppUnassignedPhoneList(
      page: $page
      first: $first
      phone: $phone
    ) {
      data {
        id
        phone
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

export const GET_CHATS_CONTACTS_LIST_FILTERS_OPTIONS = gql`
  query getChatsContactsListFiltersOptions {
    companies: saasCompaniesMenu {
      id
      name
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
