export * from "./Types";
export * from "./Colors";
export * from "./Styles";
export { default as Configs } from "./Configs";

export const TOKEN_KEY = "auth_token";

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
