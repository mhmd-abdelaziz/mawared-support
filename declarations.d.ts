declare module "apollo-upload-client" {
  export * from "@apollo/client/link/core";
  export { createUploadLink } from "apollo-upload-client/public/index.js";
}

declare module "@env" {
  export const PUSHER_KEY: string;
  export const PUSHER_CLUSTER: string;
  export const EXPO_PUBLIC_API_URL: string;
}
