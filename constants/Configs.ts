export default {
  appUrl: process.env.EXPO_PUBLIC_API_URL,
  pusherCluster: __DEV__
    ? process.env.EXPO_PUBLIC_PUSHER_CLUSTER
    : process.env.PUSHER_CLUSTER,
  pusherKey: __DEV__
    ? process.env.EXPO_PUBLIC_PUSHER_KEY
    : process.env.PUSHER_KEY,
};
