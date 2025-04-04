import {
  View,
  Text,
  Alert,
  Platform,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Send,
  Time,
  Bubble,
  Actions,
  Composer,
  SendProps,
  GiftedChat,
  BubbleProps,
  ActionsProps,
  InputToolbar,
  MessageImage,
  MessageAudioProps,
  InputToolbarProps,
  IMessage as GiftedChatMessage,
} from "react-native-gifted-chat";
import {
  Colors,
  Styles,
  Message,
  MessageSender,
  MessageStatus,
} from "@/constants";
import Pusher from "pusher-js";
import { Audio } from "expo-av";
import { Stack } from "expo-router";
import { router } from "expo-router";
import { ExternalLink } from "@/components";
import { GET_CHAT } from "@/apollo/queries";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import useThemeColors from "@/hooks/useThemeColors";
import { useState, useEffect, useRef } from "react";
import { ThemedText, ThemedView } from "@/components";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQuery } from "@apollo/client";
import { REPLAY_MESSAGE, SEND_MESSAGE } from "@/apollo/mutations";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";

interface IMessage extends GiftedChatMessage {
  id: string;
  media?: File;
  file?: string;
  read?: boolean;
  failed?: boolean;
  w_message_id?: string;
  temp_message_id: string;
  replyTo: IMessage | null;
}
const formatMessage = (
  message: Message,
  messages?: Message[] | IMessage[]
): IMessage => {
  const formatMedia = (url: string) => {
    if (!url) return {};
    switch (true) {
      case url.includes(".mp4"):
        return { video: url };

      case url.includes(".mp3"):
        return { audio: url };

      case url.includes(".png") || url.includes(".jpg"):
        return { image: url };

      default:
        return { file: url };
    }
  };

  return {
    id: String(message.id),
    _id: String(message.id),
    text: message.content || "",
    ...formatMedia(message.media_url),
    w_message_id: message.w_message_id,
    read: message.status === MessageStatus.READ,
    sent: message.status === MessageStatus.SENT,
    failed: message.status === MessageStatus.FAILED,
    pending: message.status === MessageStatus.PENDING,
    received: message.status === MessageStatus.DELIVERED,
    createdAt: new Date(message.created_time?.replace(" ", "T")),
    user: {
      _id:
        message.sender === MessageSender.Contact
          ? String(message.company_contact_id)
          : String(message.saas_id),
    },
    replyTo:
      message?.replyTo ||
      (messages && message?.message_parent_id
        ? formatMessage(
            messages?.find(
              (m) => m.w_message_id === message.message_parent_id
            ) as Message,
            messages
          )
        : null),
  };
};

const ChatScreen = () => {
  const themeColors = useThemeColors();
  const theme = useColorScheme() || "light";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sass, setSaas] = useState<{ id: string } | null>(null);
  const { id: companyContactId, title } = useLocalSearchParams();
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Server State
  const [sendMessage, { loading: sendLoading }] = useMutation(SEND_MESSAGE);
  const [replyMessage, { loading: replyLoading }] = useMutation(REPLAY_MESSAGE);
  const { data: res, loading } = useQuery(GET_CHAT, {
    variables: { companyContactId },
    onCompleted: (res) => {
      const messages: Message[] = res.chat.data;
      setMessages(
        messages.map((message: Message, i) => formatMessage(message, messages))
      );
      // if (res?.users?.length === 1) {
      setSaas(res?.users[0]);
      // }
    },
  });

  /* ↓ State Effects ↓ */

  useEffect(() => {
    // Request permissions for recording audio
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access microphone is required!");
        }
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    })();

    // Cleanup function for audio recording/playback
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.PUSHER_KEY as string, {
      cluster: process.env.PUSHER_CLUSTER as string,
    });

    const channel = pusher.subscribe(`chat_${companyContactId}`);
    channel.bind("my-event", (newMessage: Message) => {

      if (!sendLoading || !replyLoading) {
        const isMsgExist = messages?.find(
          (msg) =>
            msg?.w_message_id === newMessage?.w_message_id ||
            msg?._id === newMessage?.temp_message_id
        );

        if (isMsgExist) {
          setMessages((prev) =>
            prev?.map((msg) =>
              msg?.w_message_id === newMessage?.w_message_id ||
              msg?._id === newMessage?.temp_message_id
                ? formatMessage(newMessage, messages)
                : msg
            )
          );
        } else {
          setMessages((prev) => [formatMessage(newMessage, messages), ...prev]);
        }
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [messages.length]);

  /* ↓ Helpers ↓ */

  // Handle sending messages
  const onSend = async (newMessages: IMessage[] = []) => {
    if (!replyingTo) {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
      sendMessage({
        variables: {
          input: {
            saasId: sass?.id as string,
            contactId: companyContactId,
            tempMessageID: newMessages[0]?._id,
            content: newMessages[0]?.text || null,
            // ...(newMessages[0]?.file && { media: newMessages[0]?.file }),
            // ...(newMessages[0]?.audio && { media: newMessages[0]?.audio }),
            // ...(newMessages[0]?.image && { media: newMessages[0]?.image }),
          },
        },
        onCompleted: ({ sendMessage }) => {
          setMessages((prev) =>
            prev.map((msg, idx) =>
              !idx ? formatMessage(sendMessage as Message) : msg
            )
          );
        },
        onError: (err) => {
          Alert.alert(
            (err?.graphQLErrors?.[0]?.extensions?.reason ||
              err?.graphQLErrors?.[0]?.message ||
              err?.message) as string
          );
        },
      });
    } else {
      newMessages[0].replyTo = replyingTo;
      setReplyingTo(null);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
      replyMessage({
        variables: {
          input: {
            senderId: sass?.id,
            content: newMessages[0]?.text || null,
            messageId: replyingTo?.id as string,
            // ...(newMessages[0]?.file && { media: newMessages[0]?.file }),
            // ...(newMessages[0]?.audio && { media: newMessages[0]?.audio }),
            // ...(newMessages[0]?.image && { media: newMessages[0]?.image }),
          },
        },
        onCompleted: ({ replyOnMessage }) => {
          setMessages((prev) =>
            prev.map((msg, idx) =>
              !idx
                ? formatMessage({
                    ...replyOnMessage,
                    replyTo: newMessages[0].replyTo,
                  } as Message)
                : msg
            )
          );
        },
        onError: (err) => {
          Alert.alert(
            (err?.graphQLErrors?.[0]?.extensions?.reason ||
              err?.graphQLErrors?.[0]?.message ||
              err?.message) as string
          );
        },
      });
    }
  };

  const handleLongPress = (context, message) => {
    // Set the message to reply to
    setReplyingTo(message);
  };

  // Handle recording voice notes
  const startRecording = async () => {
    try {
      // Reset recording duration
      setRecordingDuration(0);

      // Stop any playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPlayingMessageId(null);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
          playbackTimer.current = null;
        }
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);

      // Start timer to track recording duration
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      setRecordingTimer(timer);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);

    // Clear recording timer
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Only send voice note if recording duration is greater than 1 second
      if (uri && recordingDuration >= 1) {
        const message = {
          _id: Math.round(Math.random() * 1000000),
          audio: uri,
          createdAt: new Date(),
          user: {
            _id: 1,
          },
          duration: recordingDuration,
        };
        onSend([message]);
      } else {
        // Inform user that recording was too short
        if (recordingDuration < 1) {
          Alert.alert(
            "Voice note discarded",
            "Recording was too short (less than 1 second)."
          );
        }
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to process voice recording");
    }

    // Reset recording duration
    setRecordingDuration(0);
  };

  // Handle playing voice notes
  const playSound = async (uri: string, messageId: string) => {
    try {
      // If already playing this message, toggle pause/play
      if (isPlaying && playingMessageId === messageId && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
          playbackTimer.current = null;
        }
        return;
      }

      // If playing a different message, stop current playback
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setPlayingMessageId(null);
        if (playbackTimer.current) {
          clearInterval(playbackTimer.current);
          playbackTimer.current = null;
        }
      }

      setLoadingAudio(true);
      setPlayingMessageId(messageId);

      // Load and play the new audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setLoadingAudio(false);

      // Start timer to update playback position
      playbackTimer.current = setInterval(() => {
        if (sound) {
          sound.getStatusAsync().then((status) => {
            if (status.isLoaded) {
              setPlaybackPosition(status.positionMillis / 1000);
            }
          });
        }
      }, 100);

      // Set up completion listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setPlayingMessageId(null);
          setPlaybackPosition(0);
          if (playbackTimer.current) {
            clearInterval(playbackTimer.current);
            playbackTimer.current = null;
          }
        }
      });
    } catch (err) {
      console.error("Failed to play sound", err);
      Alert.alert("Error", "Failed to play voice note");
      setLoadingAudio(false);
      setIsPlaying(false);
      setPlayingMessageId(null);
    }
  };

  // Handle audio playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackDuration(status.durationMillis / 1000);
      setPlaybackPosition(status.positionMillis / 1000);
    }
  };

  // Format time in seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle picking documents
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const message = {
          _id: Math.round(Math.random() * 1000000),
          text: `Shared file: ${result.name}`,
          createdAt: new Date(),
          user: {
            _id: 1,
          },
          file: {
            uri: result.uri,
            name: result.name,
            type: result.mimeType,
          },
        };
        onSend([message]);
      }
    } catch (err) {
      console.error("Error picking document", err);
    }
  };

  // Handle picking images
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const message = {
          _id: Math.round(Math.random() * 1000000),
          image: result.assets[0].uri,
          createdAt: new Date(),
          user: {
            _id: sass?.id as string,
          },
        };
        onSend([message]);
      }
    } catch (err) {
      console.error("Error picking image", err);
    }
  };

  // Render the message bubble
  const renderBubble = (props: BubbleProps<IMessage>) => {
    const { text: color, secBackground: backgroundColor } = themeColors;
    return (
      <View>
        <Bubble
          {...props}
          wrapperStyle={{ left: { backgroundColor } }}
          textStyle={
            theme === "dark" ? { right: { color }, left: { color } } : undefined
          }
          renderTime={(timeProps) => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Time {...timeProps} timeFormat="HH:mm" />
              {props.currentMessage.read ? (
                <View style={{ flexDirection: "row", paddingEnd: 10 }}>
                  <Ionicons name="checkmark" size={11} color="#fff" />
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
              ) : null}
              {props.currentMessage.failed ? (
                <View
                  style={{
                    marginEnd: 8,
                    marginBottom: 4,
                    flexDirection: "row",
                  }}
                >
                  <Ionicons name="information-circle" size={11} color="red" />
                </View>
              ) : null}
            </View>
          )}
        />
      </View>
    );
  };

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    const { text: color, secBackground: backgroundColor } = themeColors;
    return (
      <View>
        {replyingTo ? (
          <View style={styles.replyInputContainer}>
            <View style={{ flex: 1 }}>
              {renderCustomView({
                position: "left",
                currentMessage: { replyTo: replyingTo } as IMessage,
              })}
            </View>

            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ) : null}
        <InputToolbar
          {...props}
          containerStyle={{ backgroundColor }}
          renderComposer={(composerProps) => (
            <Composer {...composerProps} textInputStyle={{ color }} />
          )}
        />
      </View>
    );
  };

  // Render custom actions
  const renderActions = (props: ActionsProps) => {
    return (
      <Actions
        {...props}
        options={{
          ["Choose Image"]: pickImage,
          ["Choose File"]: pickDocument,
        }}
        icon={() => <FontAwesome name="paperclip" size={24} color="#0084FF" />}
      />
    );
  };

  // Render voice note button
  const renderVoiceButton = () => {
    return (
      <TouchableOpacity
        style={styles.voiceButton}
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <FontAwesome
          size={24}
          color={isRecording ? "red" : "#0084FF"}
          name={isRecording ? "microphone" : "microphone-slash"}
        />
        {isRecording && (
          <Text style={styles.recordingDuration}>
            {formatTime(recordingDuration)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return !props?.text?.length ? (
      renderVoiceButton()
    ) : (
      <Send {...props} containerStyle={styles.sendContainer}>
        <MaterialIcons name="send" size={20} color="#0084FF" />
      </Send>
    );
  };

  // Render custom message audio
  const renderMessageAudio = (props: MessageAudioProps<IMessage>) => {
    const { currentMessage } = props;
    if (currentMessage.audio) {
      const isCurrentlyPlaying = playingMessageId === currentMessage._id;
      const progressPercentage =
        isCurrentlyPlaying && playbackDuration > 0
          ? (playbackPosition / playbackDuration) * 100
          : 0;

      return (
        <TouchableOpacity
          disabled={loadingAudio}
          style={styles.audioContainer}
          onPress={() => playSound(currentMessage.audio, currentMessage._id)}
        >
          {loadingAudio && isCurrentlyPlaying ? (
            <ActivityIndicator size="small" color="#0084FF" />
          ) : (
            <FontAwesome
              name={isCurrentlyPlaying && isPlaying ? "pause" : "play"}
              size={20}
              color="#0084FF"
            />
          )}

          <View style={styles.audioWaveformContainer}>
            <View style={styles.audioWaveform}>
              <View
                style={[
                  styles.audioWaveformProgress,
                  { width: `${progressPercentage}%` },
                ]}
              />
              <View style={styles.audioWaveformBars}>
                {[...Array(15)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.audioWave,
                      {
                        height: 6 + Math.random() * 12,
                        backgroundColor:
                          progressPercentage > (index / 15) * 100
                            ? "#0084FF"
                            : "#B0B0B0",
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.audioText}>
              {isCurrentlyPlaying && isPlaying
                ? `${formatTime(playbackPosition)} / ${formatTime(
                    playbackDuration
                  )}`
                : `Voice note (${formatTime(currentMessage.duration || 0)})`}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderFile = (props: BubbleProps<IMessage>) => {
    const { currentMessage } = props;
    if (currentMessage.file) {
      return (
        <View style={styles.fileContainer}>
          <Ionicons name="document-outline" size={24} color="#0084FF" />
          <ExternalLink href={currentMessage.file}>
            <ThemedText type="link">Download</ThemedText>
          </ExternalLink>
        </View>
      );
    }
    return null;
  };

  // Render custom file attachment
  const renderCustomView = (props: BubbleProps<IMessage>) => {
    const { currentMessage } = props;

    // Display the file if it exists
    if (currentMessage?.file) return renderFile(props);

    // Display the replied message if it exists
    if (currentMessage?.replyTo) {
      return (
        <View>
          {currentMessage.replyTo.image ? (
            <MessageImage currentMessage={currentMessage.replyTo} />
          ) : null}

          {currentMessage.replyTo.file
            ? renderFile({
                currentMessage: currentMessage.replyTo,
              } as BubbleProps<IMessage>)
            : null}

          {currentMessage.replyTo.audio
            ? renderMessageAudio({ currentMessage: currentMessage.replyTo })
            : null}

          {currentMessage.replyTo.text ? (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>
                {currentMessage.replyTo.text}
              </Text>
            </View>
          ) : null}
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: title as string,
          headerTintColor: themeColors.tint,
          headerStyle: { backgroundColor: themeColors.background },
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginEnd: 30 }}
              onPress={() => router.push("/(main)")}
            >
              <Ionicons name="arrow-back" size={24} color="#0084FF" />
            </TouchableOpacity>
          ),
        }}
      />
      <GiftedChat
        onSend={onSend}
        messages={messages}
        renderSend={renderSend}
        renderBubble={renderBubble}
        renderActions={renderActions}
        onLongPress={handleLongPress}
        user={{ _id: sass?.id as string }}
        renderCustomView={renderCustomView}
        renderMessageAudio={renderMessageAudio}
        renderInputToolbar={renderInputToolbar}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  voiceButton: {
    padding: 8,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDuration: {
    marginLeft: 5,
    color: "red",
    fontSize: 12,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 5,
    minWidth: 200,
  },
  audioWaveformContainer: {
    flex: 1,
    marginLeft: 10,
  },
  audioWaveform: {
    position: "relative",
    height: 24,
    marginBottom: 5,
  },
  audioWaveformBars: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  audioWaveformProgress: {
    top: 0,
    left: 0,
    zIndex: 1,
    height: "100%",
    borderRadius: 4,
    position: "absolute",
    backgroundColor: "rgba(0, 132, 255, 0.2)",
  },
  audioWave: {
    width: 3,
    borderRadius: 1,
    marginHorizontal: 2,
    backgroundColor: "#B0B0B0",
  },
  audioText: {
    color: "#555",
    fontSize: 12,
  },
  fileContainer: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  replyContainer: {
    padding: 4,
    width: "80%",
    marginTop: 5,
    borderRadius: 5,
    marginInline: "auto",
    backgroundColor: "#f2f2f2",
  },
  replyText: {
    fontSize: 12,
    color: "#0a7ea4",
  },
  replyInputContainer: {
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    justifyContent: "space-between",
  },
  replyInputText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
  },
});

export default ChatScreen;
