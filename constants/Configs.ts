import Constants from "expo-constants";

export default {
  appUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL,
  pusherCluster: Constants.expoConfig?.extra?.PUSHER_CLUSTER,
  pusherKey: Constants.expoConfig?.extra?.PUSHER_KEY,
};
