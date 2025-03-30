# [MAWARED Support]

Mawared Support is a real-time chat application designed to facilitate seamless communication between users and support teams. The application supports text, images, files, and audio messages, with features like message replies, swipe-to-reply, and real-time updates powered by Pusher.

## Table of contents

- [Features](#features)
- [Technologies](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Commands](#commands)
- [Docs](#docs)

<br />

## Features

- **Real-Time Messaging**: Instant communication with real-time updates using Pusher.
- **Rich Media Support**: Send and receive text, images, files, and audio messages.
- **Reply Functionality**: Reply to specific messages, including text, images, files, and audio.
- **Swipe-to-Reply**: Intuitive swipe gesture to reply to messages.
- **Audio Playback**: Play voice notes with a visual waveform and playback controls.
- **File Sharing**: Share and download files directly in the chat.
- **Dark Mode Support**: Fully supports light and dark themes.
- **Optimistic UI**: Messages appear instantly while waiting for server confirmation.

<br />

## Technologies Used

- **Frontend**: React Native with Expo
- **Backend**: GraphQL API
- **Real-Time Updates**: Pusher
- **Media Handling**: `expo-av` for audio, `expo-image-picker` for images
- **UI Components**: `react-native-gifted-chat`, `react-native-gesture-handler`

<br />

## Prerequisites

- [Node version 18 or higher](https://nodejs.org/en/)

- Yarn
  ```bash
  npm install -g yarn
  ```

<br />

## Installation

1- clone the project:

```bash
git clone https://github.com/mhmd-abdelaziz/mawared-support.git && cd mawared-support
```

2- Add environment constants:

```bash
cp .env.example .env
```

3- Install dependencies:

```bash
yarn
```

or

```bash
npm run install
```

<br />

## Commands

- `yarn start` _OR_ `npm run start`: Runs the app in the development mode.
- `yarn build` _OR_ `npm run build`: Builds the app for production to the `dist` folder.
- `yarn preview` _OR_ `npm run preview`: Runs the app in the production mode.
