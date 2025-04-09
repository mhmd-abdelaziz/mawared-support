export * from "./Types";
export * from "./Colors";
export * from "./Styles";
export { default as Configs } from "./Configs";
export { default as Privileges } from "./Privileges";

export const TOKEN_KEY = "auth_token";
export const AUTH_DATA_KEY = "auth_data";

export const MessageSender = {
  SAAS: "saas",
  Contact: "contact",
};

export const MessageStatus = {
  SENT: "sent",
  READ: "read",
  FAILED: "failed",
  PENDING: "pending",
  DELIVERED: "delivered",
};
