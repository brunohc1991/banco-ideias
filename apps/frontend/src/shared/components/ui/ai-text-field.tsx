'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Mic, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import { AiApiError, generateAiText, transcribeAiAudio } from '@/shared/api/ai.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { getMessage } from '@/shared/i18n';
import { cn } from '@/shared/lib/class-name.util';

export type AiContextField = {
  label: string;
  value: string;
  required?: boolean;
};

export type AiTextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Prompt orientativo do campo, enviado ao modelo como orientação. */
  prompt: string;
  contextFields?: AiContextField[];
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  onAfterGenerate?: (text: string) => void;
};

const MAX_INSTRUCTION_LENGTH = 1500;
const REFINE_INSTRUCTION =
  'Refine o conteúdo atual, melhorando clareza e estrutura. Preserve a intenção de quem escreveu e nunca comece do zero nem descarte o que já foi escrito.';

const WAVE_BARS = 24;
const IDLE_WAVE = Array.from({ length: WAVE_BARS }, () => 0.08);

// Anexa o ditado ao fim do conteúdo, com um único espaço entre os dois trechos.
function appendTranscript(current: string, transcript: string): string {
  const base = current.trimEnd();
  const addition = transcript.trim();

  return base ? `${base} ${addition}` : addition;
}

function buildContext(value: string, contextFields: AiContextField[]): string | undefined {
  const blocks: string[] = [];

  if (value.trim()) {
    blocks.push(`Conteúdo atual (contexto principal):\n"""\n${value}\n"""`);
  }

  for (const field of contextFields) {
    if (field.value.trim()) blocks.push(`${field.label}: ${field.value}`);
  }

  return blocks.length ? blocks.join('\n\n') : undefined;
}

export default function AiTextField({
  value,
  onChange,
  prompt,
  contextFields = [],
  multiline = false,
  rows = 4,
  placeholder,
  id,
  name,
  disabled = false,
  className,
  onAfterGenerate,
}: AiTextFieldProps) {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [wave, setWave] = useState<number[]>(IDLE_WAVE);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const isRefining = value.trim().length > 0;
  const actionLabel = isRefining ? 'Refinar' : 'Gerar';
  const pending = contextFields.filter((field) => field.required && !field.value.trim()).map((field) => field.label);
  const busyWithVoice = recording || transcribing;
  const aiDisabled = disabled || generating || busyWithVoice || pending.length > 0;
  const micDisabled = disabled || generating || transcribing;

  async function handleGenerate() {
    const userInstruction = instruction.trim();
    const instructions = [isRefining ? REFINE_INSTRUCTION : null, userInstruction || null].filter(Boolean);

    setGenerating(true);

    try {
      const text = await generateAiText(token, {
        prompt,
        context: buildContext(value, contextFields),
        instruction: instructions.length ? instructions.join(' ') : undefined,
      });

      onChange(text);
      onAfterGenerate?.(text);
      setInstruction('');
      setOpen(false);
    } catch (error) {
      const locale = navigator.language;

      if (error instanceof AiApiError) {
        if (error.status === 401) {
          logout();
          return;
        }
        error.codes.forEach((code) => toast.error(getMessage(code, { locale })));
      } else {
        toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
      }
    } finally {
      setGenerating(false);
    }
  }

  function notifyAudioError(error: unknown) {
    const locale = navigator.language;

    if (error instanceof AiApiError) {
      if (error.status === 401) {
        logout();
        return;
      }
      error.codes.forEach((code) => toast.error(getMessage(code, { locale })));
    } else {
      toast.error(getMessage('DEFAULT_API_ERROR', { locale }));
    }
  }

  // Encerra a captação e libera o microfone, sem tocar no estado do componente.
  function releaseMedia() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
  }

  function startWave(stream: MediaStream) {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    analyser.fftSize = 64;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setWave(
        Array.from({ length: WAVE_BARS }, (_, index) => {
          const sample = data[Math.floor((index / WAVE_BARS) * data.length)] ?? 0;
          return Math.max(0.08, sample / 255);
        }),
      );
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  async function handleStartRecording() {
    const locale = navigator.language;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error(getMessage('AUDIO_RECORDING_UNSUPPORTED', { locale }));
      return;
    }

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error(getMessage('AUDIO_RECORDING_DENIED', { locale }));
      return;
    }

    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorderRef.current = recorder;
    streamRef.current = stream;
    startWave(stream);
    recorder.start();
    setRecording(true);
  }

  function stopRecorder(onStopped: (blob: Blob) => void) {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    releaseMedia();
    setRecording(false);
    setWave(IDLE_WAVE);

    if (!recorder || recorder.state === 'inactive') return;

    recorder.onstop = () => {
      onStopped(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      chunksRef.current = [];
    };
    recorder.stop();
  }

  function handleCancelRecording() {
    stopRecorder(() => undefined);
  }

  function handleConfirmRecording() {
    stopRecorder(async (blob) => {
      if (blob.size === 0) {
        toast.error(getMessage('ai.audio.required', { locale: navigator.language }));
        return;
      }

      setTranscribing(true);

      try {
        const text = await transcribeAiAudio(token, blob);

        onChangeRef.current(appendTranscript(valueRef.current, text));
        toast.success(getMessage('AUDIO_TRANSCRIBED', { locale: navigator.language }));
      } catch (error) {
        notifyAudioError(error);
      } finally {
        setTranscribing(false);
      }
    });
  }

  // Ao sair da tela durante a gravação: libera o microfone e descarta o áudio.
  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseMedia();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const fieldProps = {
    id,
    name,
    placeholder,
    value,
    disabled: disabled || generating || busyWithVoice,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  };

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      disabled={aiDisabled}
      aria-label={`${actionLabel} com IA`}
    >
      {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
    </Button>
  );

  return (
    <div className={cn('space-y-1', className)}>
      <div className="relative">
        {multiline ? (
          <Textarea {...fieldProps} rows={rows} className="pr-20" />
        ) : (
          <Input {...fieldProps} className="pr-20" />
        )}

        <div className={cn('absolute right-2 flex items-center gap-1', multiline ? 'top-2' : 'top-1/2 -translate-y-1/2')}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={micDisabled || recording}
            aria-label="Gravar áudio"
            onClick={handleStartRecording}
          >
            {transcribing ? <Loader2 className="size-4 animate-spin" /> : <Mic className="size-4" />}
          </Button>
          {pending.length > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex">
                    {trigger}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Preencha antes de usar a IA: {pending.join(', ')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>{trigger}</PopoverTrigger>
              <PopoverContent align="end" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`${id ?? name ?? 'ai'}-instruction`}>Instrução adicional (opcional)</Label>
                  <Input
                    id={`${id ?? name ?? 'ai'}-instruction`}
                    value={instruction}
                    maxLength={MAX_INSTRUCTION_LENGTH}
                    disabled={generating}
                    onChange={(event) => setInstruction(event.target.value)}
                  />
                </div>
                <Button type="button" size="sm" className="w-full" disabled={generating} onClick={handleGenerate}>
                  {actionLabel}
                </Button>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {recording ? (
          <div
            role="status"
            className="absolute inset-0 flex items-center gap-3 overflow-hidden rounded-md border border-sky-500/40 bg-background px-3 text-sky-500"
          >
            <span aria-hidden="true" className="absolute inset-0 bg-sky-500/10" />
            <span className="relative flex size-7 shrink-0 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-500/30" />
              <Mic className="relative size-4" />
            </span>
            <div className="relative flex h-8 flex-1 items-center justify-center gap-0.5" aria-hidden="true">
              {wave.map((level, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-sky-500"
                  style={{ height: `${Math.round(level * 100)}%` }}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative size-7"
              aria-label="Cancelar gravação"
              onClick={handleCancelRecording}
            >
              <X className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative size-7"
              aria-label="Confirmar gravação"
              onClick={handleConfirmRecording}
            >
              <Check className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {generating ? <p className="text-xs text-muted-foreground">Gerando...</p> : null}
    </div>
  );
}

export { AiTextField };
