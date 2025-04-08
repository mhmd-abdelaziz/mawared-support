import {
  View,
  Text,
  Alert,
  Platform,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
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
  Configs,
  Message,
  MessageSender,
  MessageStatus,
  MessageTemplate,
} from "@/constants";
import {
  SEND_MESSAGE,
  SEND_TEMPLATE,
  REPLAY_MESSAGE,
} from "@/apollo/mutations";
import Pusher from "pusher-js";
import { Stack } from "expo-router";
import { router } from "expo-router";
import { Audio, Video } from "expo-av";
import Mime from "react-native-mime-types";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import useThemeColors from "@/hooks/useThemeColors";
import { useState, useEffect, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import { useMutation, useQuery } from "@apollo/client";
import { ExternalLink, AudioPlayer } from "@/components";
import { GET_CHAT, GET_TEMPLATES } from "@/apollo/queries";
import { SettingsModal, ThemedText, ThemedView } from "@/components";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";

interface IMessage extends GiftedChatMessage {
  id: string;
  media?: File;
  file?: string;
  read?: boolean;
  failed?: boolean;
  mediaBase64?: string;
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
const requestMediaPermissionIfNeeded = async () => {
  const { granted } = await ImagePicker.getMediaLibraryPermissionsAsync();

  if (!granted) {
    const { granted: justGranted } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return justGranted;
  }

  return true;
};
const requestMicrophonePermissionIfNeeded = async () => {
  const { granted } = await Audio.getPermissionsAsync();

  if (!granted) {
    const { granted: justGranted } = await Audio.requestPermissionsAsync();
    return justGranted;
  }

  return true;
};
const formatBase64 = (uri: string, base64: string) => {
  const extension = uri.split(".").pop();
  const mimeType = Mime.lookup(extension);
  return `data:${mimeType};base64,${base64}`;
};
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const ChatScreen = () => {
  const videoRef = useRef<Video>(null);
  const themeColors = useThemeColors();
  const theme = useColorScheme() || "light";
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sass, setSass] = useState<{ id: string } | null>(null);
  const { id: companyContactId, title } = useLocalSearchParams();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Server State
  const [sendMessage, { loading: sendLoading }] = useMutation(SEND_MESSAGE);
  const [replyMessage, { loading: replyLoading }] = useMutation(REPLAY_MESSAGE);
  const [sendTemplate, { loading: sendTemplateLoading }] =
    useMutation(SEND_TEMPLATE);
  const { data: res } = useQuery(GET_CHAT, {
    variables: { companyContactId },
    onCompleted: (res) => {
      const messages: Message[] = res.chat.data;
      setMessages(
        messages.map((message: Message) => formatMessage(message, messages))
      );
      setSass(res?.users[0]);
    },
  });
  const { data: templatesData } = useQuery(GET_TEMPLATES, {
    skip: res?.chat?.canSend,
  });

  // Constants
  const showTemplates = res && !res?.chat?.canSend;

  /* ↓ State Effects ↓ */

  useEffect(() => {
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
    const pusher = new Pusher(Configs.pusherKey as string, {
      cluster: Configs.pusherCluster as string,
    });

    const channel = pusher.subscribe(`chat_${companyContactId}`);
    channel.bind("my-event", (newMessage: Message) => {
      if (!sendLoading || !replyLoading || !sendTemplateLoading) {
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
            content: newMessages[0]?.text || "",
            ...(newMessages[0]?.mediaBase64 && {
              mediaBase64: newMessages[0]?.mediaBase64,
            }),
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
            ...(newMessages[0]?.mediaBase64 && {
              mediaBase64: newMessages[0]?.mediaBase64,
            }),
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
    if (Platform.OS !== "web") {
      const hasPermission = await requestMicrophonePermissionIfNeeded();
      if (!hasPermission) {
        alert("Microphone permission is required to record audio.");
        return;
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

    try {
      // Reset recording duration
      setRecordingDuration(0);

      // Stop any playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
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
        const mediaBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const message = {
          _id: String(Math.random() * 1000000),
          createdAt: new Date(),
          audio: uri,
          mediaBase64: formatBase64(uri, mediaBase64),
          user: {
            _id: sass?.id,
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

  // Handle picking documents
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const mediaBase64 = await FileSystem.readAsStringAsync(
          result?.assets[0].uri,
          { encoding: FileSystem.EncodingType.Base64 }
        );

        const message = {
          _id: String(Math.random() * 1000000),
          createdAt: new Date(),
          mediaBase64: formatBase64(result.assets[0].uri, mediaBase64),
          user: {
            _id: sass?.id,
          },
          file: {
            uri: result?.assets[0].uri,
            name: result?.assets[0].name,
            type: result?.assets[0].mimeType,
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
      // Ask for permission
      const hasPermission = await requestMediaPermissionIfNeeded();
      if (!hasPermission) {
        alert("Permission to access media library is required!");
        return;
      }

      // Launch the image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        const message = {
          _id: String(Math.random() * 1000000),
          image: result.assets[0].uri,
          mediaBase64: formatBase64(
            result.assets[0].uri as string,
            result.assets[0].base64 as string
          ),
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
          renderComposer={(composerProps) => {
            if (showTemplates) {
              return (
                <ThemedView style={styles.templatePicker}>
                  <Picker
                    style={{
                      width: "100%",
                      height: "100%",
                      color: themeColors.text,
                      backgroundColor: "inherit",
                    }}
                    selectedValue={selectedTemplate}
                    onValueChange={(value) => setSelectedTemplate(value)}
                  >
                    <Picker.Item label="Select a template..." value={null} />
                    {templatesData?.whatsAppTemplates.map(
                      (template: { id: string; name: string }) => (
                        <Picker.Item
                          value={template}
                          key={template.id}
                          label={template.name}
                        />
                      )
                    )}
                  </Picker>
                </ThemedView>
              );
            } else {
              return <Composer {...composerProps} textInputStyle={{ color }} />;
            }
          }}
        />
      </View>
    );
  };

  // Render custom actions
  const renderActions = (props: ActionsProps) => {
    if (showTemplates) return <></>;
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

  const handleSendTemplate = () => {
    if (selectedTemplate) {
      const newMessages = [
        {
          _id: String(Math.random() * 1000000),
          createdAt: new Date(),
          text: selectedTemplate?.content,
          user: {
            _id: sass?.id,
          },
        },
      ];
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
      sendTemplate({
        variables: {
          input: {
            saasId: sass?.id as string,
            contactId: companyContactId,
            templateId: selectedTemplate.id,
            tempMessageID: newMessages[0]?._id,
          },
        },
        onCompleted: ({ sendMessageViaTemplate }) => {
          setMessages((prev) =>
            prev.map((msg, idx) =>
              !idx ? formatMessage(sendMessageViaTemplate as Message) : msg
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

  const renderSend = (props: SendProps<IMessage>) => {
    if (showTemplates) {
      return (
        <TouchableOpacity
          onPress={handleSendTemplate}
          style={{
            flex: 1,
            paddingBottom: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="send" size={20} color="#0084FF" />
        </TouchableOpacity>
      );
    }

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
      return <AudioPlayer uri={currentMessage.audio} />;
    }
    return null;
  };

  const renderMessageVideo = (props: BubbleProps<IMessage>) => {
    const { currentMessage } = props;
    if (currentMessage.video) {
      return (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            useNativeControls
            shouldPlay={false}
            style={styles.video}
            source={{ uri: currentMessage.video }}
            onPlaybackStatusUpdate={async (status) => {
              if (status.isLoaded && status.didJustFinish) {
                await videoRef.current?.setPositionAsync(0);
              }
            }}
          />
        </View>
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

          {currentMessage.replyTo.video
            ? renderMessageVideo({ currentMessage: currentMessage.replyTo })
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
          headerRight:
            res?.users?.length > 1
              ? () => (
                  <TouchableOpacity
                    style={{ alignSelf: "flex-end" }}
                    onPress={() => setIsSettingsVisible(true)}
                  >
                    <Ionicons size={24} name="settings" color="#0084FF" />
                  </TouchableOpacity>
                )
              : undefined,
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
        renderMessageVideo={renderMessageVideo}
        renderInputToolbar={renderInputToolbar}
      />

      <SettingsModal
        sass={sass}
        setSass={setSass}
        visible={isSettingsVisible}
        sassOptions={res?.users || []}
        onClose={() => setIsSettingsVisible(false)}
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
  templatePicker: {
    height: 50,
    width: "92%",
  },
  fileContainer: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  videoContainer: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
  video: {
    width: 250,
    height: 140,
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
