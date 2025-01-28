import { Ellipsis, StopCircle, Volume2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { apiClient } from "../../../lib/api";
import { Button, message, Tooltip } from "@/primitive/components";

export default function ChatTtsButton({
  agentId,
  text,
}: {
  agentId: string;
  text: string;
}) {
  const [playing, setPlaying] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mutation = useMutation({
    mutationKey: ["tts", text],
    mutationFn: () => apiClient.tts(agentId, text),
    onSuccess: (data) => {
      setAudioBlob(data);
      play();
    },
    onError: (e) => {
      message(e.message, {
        type: "error",
      });
    },
  });

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    }
    setPlaying(true);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  const execute = () => {
    if (mutation?.isPending) return;

    if (playing) {
      stop();
      return;
    }

    if (audioBlob) {
      play();
      return;
    } else {
      mutation.mutate();
    }
  };

  const iconClass = "text-muted-foreground size-4";

  return (
    <div>
      {audioBlob ? (
        <audio
          ref={audioRef}
          onEnded={() => {
            setPlaying(false);
          }}
          autoPlay
        >
          <source src={URL.createObjectURL(audioBlob)} type='audio/mpeg' />
          Your browser does not support the audio element.
        </audio>
      ) : null}
      <Tooltip content={<p>{playing ? "Stop" : "Read aloud"}</p>}>
        <Button
          size='icon'
          variant='ghost'
          type='button'
          onClick={() => execute()}
          disabled={mutation?.isPending}
        >
          {mutation?.isPending ? (
            <Ellipsis className={iconClass} />
          ) : playing ? (
            <StopCircle className={iconClass} />
          ) : (
            <Volume2 className={iconClass} />
          )}
        </Button>
      </Tooltip>
    </div>
  );
}
