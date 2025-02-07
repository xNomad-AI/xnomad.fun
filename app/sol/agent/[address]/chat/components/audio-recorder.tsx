"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Ellipsis, Mic, Send, Trash } from "lucide-react";
import clsx from "clsx";

import { useMutation } from "@tanstack/react-query";
import { UUID } from "@elizaos/core";
import { apiClient } from "../lib/api";
import { message, Tooltip } from "@/primitive/components";

type Props = {
  agentId: UUID;
  onChange: (newInput: string) => void;
  className?: string;
  timerClassName?: string;
};

type Record = {
  id: number;
  name: string;
  file: string | null;
};

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerTimeout: NodeJS.Timeout;

// Utility function to pad a number with leading zeros
const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, "0");
};

export const AudioRecorder = ({
  className,
  timerClassName,
  agentId,
  onChange,
}: Props) => {
  // States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [, setIsRecordingFinished] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [currentRecord, setCurrentRecord] = useState<Record>({
    id: -1,
    name: "",
    file: null,
  });
  // Calculate the hours, minutes, and seconds from the timer
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  const [minuteLeft, minuteRight] = useMemo(
    () => padWithLeadingZeros(minutes, 2).split(""),
    [minutes]
  );
  const [secondLeft, secondRight] = useMemo(
    () => padWithLeadingZeros(seconds, 2).split(""),
    [seconds]
  );
  // Refs
  const mediaRecorderRef = useRef<{
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    mediaRecorder: MediaRecorder | null;
    audioContext: AudioContext | null;
  }>({
    stream: null,
    analyser: null,
    mediaRecorder: null,
    audioContext: null,
  });

  const mutation = useMutation({
    mutationKey: ["whisper"],
    mutationFn: (file: Blob) => apiClient.whisper(agentId, file),
    onSuccess: (data: { text: string }) => {
      if (data?.text) {
        onChange(data.text);
      }
    },
    onError: (e) => {
      message(e.message, {
        type: "error",
      });
      console.log(e);
    },
  });

  function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setIsRecording(true);
          // ============ Analyzing ============
          const AudioContext = window.AudioContext;
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          mediaRecorderRef.current = {
            stream,
            analyser,
            mediaRecorder: null,
            audioContext: audioCtx,
          };

          const mimeType = MediaRecorder.isTypeSupported("audio/mpeg")
            ? "audio/mpeg"
            : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/wav";

          const options = { mimeType };
          mediaRecorderRef.current.mediaRecorder = new MediaRecorder(
            stream,
            options
          );
          mediaRecorderRef.current.mediaRecorder.start();
          recordingChunks = [];
          // ============ Recording ============
          recorder = new MediaRecorder(stream);
          recorder.start();
          recorder.ondataavailable = (e) => {
            recordingChunks.push(e.data);
          };
        })
        .catch((e) => {
          message(e.message, {
            type: "error",
          });
          console.log(e);
        });
    }
  }
  function stopRecording() {
    recorder.onstop = () => {
      const recordBlob = new Blob(recordingChunks, {
        type: "audio/wav",
      });
      mutation.mutate(recordBlob);
      setCurrentRecord({
        ...currentRecord,
        file: window.URL.createObjectURL(recordBlob),
      });
      recordingChunks = [];
    };

    recorder.stop();

    setIsRecording(false);
    setIsRecordingFinished(true);
    setTimer(0);
    clearTimeout(timerTimeout);
  }
  function resetRecording() {
    const { mediaRecorder, stream, analyser, audioContext } =
      mediaRecorderRef.current;

    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        recordingChunks = [];
      };
      mediaRecorder.stop();
    }

    // Stop the web audio context and the analyser node
    if (analyser) {
      analyser.disconnect();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsRecording(false);
    setIsRecordingFinished(true);
    setTimer(0);
    clearTimeout(timerTimeout);
  }
  const handleSubmit = () => {
    stopRecording();
  };

  // Effect to update the timer every second
  useEffect(() => {
    if (isRecording) {
      timerTimeout = setTimeout(() => {
        setTimer(timer + 1);
      }, 1000);
    }
    return () => clearTimeout(timerTimeout);
  }, [isRecording, timer]);

  if (mutation?.isPending) {
    return (
      <button className='cursor-not-allowed'>
        <Ellipsis className='size-16' />
      </button>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center gap-8 border-l border-l-transparent border-opacity-0 transition-all duration-300",
        {
          "border-opacity-100 border-l-border pl-8": isRecording,
        },
        className
      )}
    >
      {isRecording ? (
        <div className='flex gap-1 items-center'>
          <div className='bg-red-500 rounded-full h-2.5 w-2.5 animate-pulse' />
          <Timer
            minuteLeft={minuteLeft}
            minuteRight={minuteRight}
            secondLeft={secondLeft}
            secondRight={secondRight}
            timerClassName={timerClassName}
          />
        </div>
      ) : null}

      <div className='flex items-center gap-8'>
        {/* ========== Delete recording button ========== */}
        {isRecording ? (
          <Tooltip content={<span> Reset recording</span>}>
            <button
              onClick={resetRecording}
              className='flex items-center justify-center '
            >
              <Trash className='size-16' />
            </button>
          </Tooltip>
        ) : null}

        {/* ========== Start and send recording button ========== */}
        <Tooltip content={<span>{!isRecording ? "Start" : "Send"} </span>}>
          {!isRecording ? (
            <button
              className='flex items-center justify-center gap-8'
              onClick={() => startRecording()}
            >
              <Mic className='size-16' />
              <span className='sr-only'>Use Microphone</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className='flex items-center justify-center '
            >
              <Send className='size-16' />
            </button>
          )}
        </Tooltip>
      </div>
    </div>
  );
};

const Timer = React.memo(
  ({
    minuteLeft,
    minuteRight,
    secondLeft,
    secondRight,
    timerClassName,
  }: {
    minuteLeft: string;
    minuteRight: string;
    secondLeft: string;
    secondRight: string;
    timerClassName?: string;
  }) => {
    return (
      <div
        className={clsx(
          "text-sm animate-in duration-1000 fade-in-0 select-none",
          timerClassName
        )}
      >
        <p>
          {minuteLeft}
          {minuteRight}:{secondLeft}
          {secondRight}
        </p>
      </div>
    );
  }
);

Timer.displayName = "Timer";
