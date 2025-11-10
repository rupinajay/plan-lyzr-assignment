"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center flex-1">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your project..."
        disabled={disabled}
        className="flex-1 h-12 rounded-full px-6 text-base border-2 focus-visible:ring-2 focus-visible:ring-offset-0"
        maxLength={10000}
      />
      <Button 
        type="submit" 
        disabled={disabled || !input.trim()} 
        size="icon"
        className="h-12 w-12 rounded-full shrink-0"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </form>
  );
}
