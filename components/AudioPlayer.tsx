import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import React, { useEffect, useState, useRef } from "react";

const formatMillis = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function AudioPlayer({ uri }: { uri: string }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  const load = async () => {
    setLoadingAudio(true);
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      (statusUpdate) => {
        setStatus(statusUpdate);
        if (statusUpdate.isLoaded && statusUpdate.didJustFinish) resetPlayer();
      }
    );
    soundRef.current = sound;
    setLoadingAudio(false);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const resetPlayer = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    }
    setIsPlaying(false);
    setStatus(null);
  };

  useEffect(() => {
    load();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const progressPercentage =
    isPlaying &&
    status?.isLoaded &&
    status?.durationMillis &&
    status?.durationMillis > 0
      ? (status?.positionMillis / status?.durationMillis) * 100
      : 0;

  return (
    <TouchableOpacity
      disabled={loadingAudio}
      onPress={togglePlayPause}
      style={styles.audioContainer}
    >
      {loadingAudio && isPlaying ? (
        <ActivityIndicator size="small" color="#0084FF" />
      ) : (
        <FontAwesome
          size={20}
          color="#0084FF"
          name={isPlaying && isPlaying ? "pause" : "play"}
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
        {status?.isLoaded ? (
          <Text style={styles.audioText}>
            {status && isPlaying
              ? `${formatMillis(status?.positionMillis)} / ${formatMillis(
                  status?.durationMillis as number
                )}`
              : `${formatMillis(status?.durationMillis as number)}`}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
