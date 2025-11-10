"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onTasksUpdate?: (tasks: any[]) => void;
}

export function ChatWindow({ messages, onTasksUpdate }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full w-full">
      <div ref={scrollRef} className="space-y-4 pb-4 pr-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Start a conversation to plan your project...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              onTasksUpdate={onTasksUpdate}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
