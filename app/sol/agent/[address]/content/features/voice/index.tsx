import {
  Modal,
  ModalTitleWithBorder,
  ModalContent,
  Button,
  message,
  RadioButtonGroup,
  RadioButton,
  Card,
  IconTrianglePlay,
  IconPause,
} from "@/primitive/components";
import { Config } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";
import { onError } from "@/lib/utils/error";
import { Gender, genders, Voice } from "./type";
import { upperFirstLetter } from "@/lib/utils/string";
import { api } from "@/primitive/api";
import clsx from "clsx";

export function VoiceModal({
  open,
  onClose,
  config,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  config?: Config;
  onSave: (config: Partial<Config>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(false);
  }, [open]);
  const [voiceId, setVoiceId] = useState<string | undefined>(
    config?.characterConfig.settings.secrets?.ELEVENLABS_VOICE_ID
  );
  useEffect(() => {
    setVoiceId(config?.characterConfig.settings.secrets?.ELEVENLABS_VOICE_ID);
  }, [config]);
  const [gender, setGender] = useState<Gender>("male");
  const [voices, setVoices] = useState<Voice[]>([]);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    api.v1.get<{ voices: Voice[] }>("/agent/voices").then((res) => {
      setVoices(res.voices);
    });
    return () => {
      setGender("male");
      setVoiceId(undefined);
    };
  }, []);
  const showVoices = useMemo(() => {
    return voices.filter((voice) => voice.labels.gender === gender);
  }, [gender, voices]);
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <Modal open={open} size='m' onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose}>
        Telegram Integration
      </ModalTitleWithBorder>
      <ModalContent className='gap-16'>
        <RadioButtonGroup
          className='flex-shrink-0'
          disableAnimation
          value={gender}
          onChange={setGender}
        >
          {genders.map((gender) => (
            <RadioButton value={gender} key={gender}>
              {upperFirstLetter(gender)}
            </RadioButton>
          ))}
        </RadioButtonGroup>

        <div className='w-full max-h-[400px] overflow-auto flex flex-col gap-16'>
          {showVoices.map((voice) => (
            <button
              key={voice.voice_id}
              onClick={() => {
                setVoiceId(voice.voice_id);
              }}
            >
              <Card
                className={clsx(
                  "w-full flex items-center gap-16 justify-between p-16",
                  {
                    "border-white": voice.voice_id === voiceId,
                  }
                )}
              >
                <div className='flex flex-col items-start gap-4'>
                  <span className='font-bold'>{voice.name}</span>
                  <p className='text-size-12 text-text2'>
                    {voice.labels.description}
                  </p>
                </div>
                <button
                  className='rounded-6 bg-surface w-40 h-40 flex items-center justify-center'
                  onClick={(e) => {
                    e.stopPropagation();
                    const isCurrentAudio =
                      audioPlayer.current?.src === voice.preview_url;
                    if (audioPlayer.current && isPlaying) {
                      audioPlayer.current.pause();
                      setIsPlaying(false);
                      if (isCurrentAudio) {
                        return;
                      }
                    }
                    audioPlayer.current = new Audio(voice.preview_url);
                    audioPlayer.current.play().then(() => {
                      setIsPlaying(true);
                    });
                    audioPlayer.current.addEventListener("ended", () => {
                      setIsPlaying(false);
                    });
                  }}
                >
                  {audioPlayer.current?.src === voice.preview_url &&
                  isPlaying ? (
                    <IconPause className='text-size-20 text-white' />
                  ) : (
                    <IconTrianglePlay className='text-size-20 text-white' />
                  )}
                </button>
              </Card>
            </button>
          ))}
        </div>
        <div className='w-full flex items-center gap-16'>
          <Button variant='secondary' stretch onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            stretch
            onClick={() => {
              if (!voiceId) return;
              setSaving(true);
              onSave({
                characterConfig: {
                  settings: {
                    secrets: {
                      ELEVENLABS_VOICE_ID: voiceId,
                    },
                  },
                },
              })
                .then(() => {
                  message("Voice setting updated successfully", {
                    type: "success",
                  });

                  setSaving(false);
                  onClose();
                })
                .catch((error) => {
                  onError(error);
                  setSaving(false);
                });
            }}
          >
            Save
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
