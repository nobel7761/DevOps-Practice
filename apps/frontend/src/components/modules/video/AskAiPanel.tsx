"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/shared/shadcn";
import AskChatMessage from "@/components/modules/video/AskChatMessage";
import CustomButton from "@/components/shared/CustomButton";
import client, { getApiBaseUrl } from "@/lib/api/client";
import type { RelatedLab } from "@/lib/data/video-ask-context";
import { parseSseStream } from "@/lib/sse/parse-sse-stream";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface InterviewSummary {
  title: string;
  questions: { title: string; scenario: string }[];
}

export default function AskAiPanel({
  contentId,
  videoTitle,
  golpoMarkdown,
  labs,
  moduleId,
  hasInterview,
}: {
  contentId: string;
  videoTitle: string;
  golpoMarkdown: string;
  labs: RelatedLab[];
  moduleId: string | null;
  hasInterview: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<
    number | null
  >(null);
  const [interview, setInterview] = useState<InterviewSummary | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasInterview || !moduleId) return;
    let cancelled = false;
    client
      .get<InterviewSummary>(`/interview/${moduleId}`)
      .then((res) => {
        if (!cancelled) setInterview(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasInterview, moduleId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    client
      .get<ChatMessage[]>(`/ask/${contentId}/history`)
      .then((res) => {
        if (!cancelled) setMessages(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setSending(true);
    setWaitingForFirstToken(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/ask/${contentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          question,
          context: {
            videoTitle,
            golpoMarkdown,
            labs,
            interview: interview ?? undefined,
          },
        }),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Ask stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let started = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseStream(buffer);
        buffer = parsed.remainder;

        for (const raw of parsed.events) {
          let event: { delta?: string; error?: string; done?: boolean };
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          if (event.delta) {
            setWaitingForFirstToken(false);
            if (!started) {
              started = true;
              setMessages((prev) => {
                setStreamingMessageIndex(prev.length);
                return [
                  ...prev,
                  { role: "assistant", content: event.delta as string },
                ];
              });
            } else {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                next[next.length - 1] = {
                  ...last,
                  content: last.content + event.delta,
                };
                return next;
              });
            }
          } else if (event.error) {
            setWaitingForFirstToken(false);
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: event.error as string },
            ]);
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "দুঃখিত, এখন উত্তর দেওয়া যায়নি। আবার চেষ্টা করো।",
        },
      ]);
    } finally {
      setSending(false);
      setWaitingForFirstToken(false);
      setStreamingMessageIndex(null);
    }
  };

  return (
    <div className="flex h-[32rem] flex-col gap-3">
      <div className="flex-1 overflow-y-auto rounded-md border border-border p-3">
        {loadingHistory ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            আগের কথোপকথন লোড হচ্ছে...
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            এই video, এর সাথে যুক্ত lab আর interview নিয়ে যেকোনো প্রশ্ন করো —
            golpo lesson আর transcript মাথায় রেখে উত্তর দেওয়া হবে। তোমার
            conversation save থাকবে, tab বদলালে বা পরে ফিরে আসলেও হারাবে না।
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <AskChatMessage
                key={index}
                role={message.role}
                content={message.content}
                isStreaming={index === streamingMessageIndex}
              />
            ))}
            {waitingForFirstToken && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                ভাবছে...
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="যেকোনো প্রশ্ন লেখো..."
          className="min-h-11 resize-none"
          rows={1}
        />
        <CustomButton
          variant="primary"
          onClick={handleSend}
          disabled={sending || !input.trim()}
        >
          <Send className="size-4" />
        </CustomButton>
      </div>
    </div>
  );
}
