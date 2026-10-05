import React, { useState, useRef, useEffect } from 'react';
import { IconMessageSquare, IconSend, IconPlus, IconSparkles, IconX } from './icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AITutorChatProps {
  onClose?: () => void;
  targetRole?: string;
  trackSlug?: string;
  onAddTask?: (title: string, category: any) => void;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  onClose,
  targetRole = 'Data Analyst',
  trackSlug = 'data-analyst',
  onAddTask,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your Udyama AI Career & Learning Tutor. How can I assist your ${targetRole} prep today? You can ask me to explain difficult SQL or machine learning concepts, review problem reasoning, or design custom daily study goals.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Explain DENSE_RANK() vs RANK() with examples',
    'How do I calculate Month 1 cohort retention?',
    'What are the best STAR behavioral answers?',
    'Break down A/B testing p-value interpretation',
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: { targetRole, trackSlug },
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach the AI Tutor service right now. Please check your connection or try again shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#C8CECB] p-3 bg-[#F2F3F1]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2E5B66] text-white flex items-center justify-center text-xs">
            <IconSparkles size={13} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Udyama AI Learning & Chat Support
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              Context-aware tutor • Gemini 3.8 Flash server engine
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#DDE1DE] text-[#5D676C]"
          >
            <IconX size={15} />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#2E5B66] text-white'
                    : 'bg-[#F2F3F1] border border-[#C8CECB] text-[#253238]'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {!isUser && onAddTask && (
                  <div className="mt-2 pt-2 border-t border-[#C8CECB]/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#5D676C]">
                      {m.timestamp}
                    </span>
                    <button
                      onClick={() =>
                        onAddTask(
                          `Review AI Advice: ${m.content.slice(0, 35)}...`,
                          'roadmap_study'
                        )
                      }
                      className="text-[10px] text-[#2E5B66] hover:underline flex items-center gap-0.5 font-medium"
                    >
                      <IconPlus size={10} /> Add as Task
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#5D676C] mt-0.5 px-1 font-mono">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[#5D676C] bg-[#F2F3F1] border border-[#C8CECB] rounded p-2.5 max-w-[200px]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E5B66] animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E5B66] animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#2E5B66] animate-bounce [animation-delay:0.4s]" />
            <span>AI Tutor thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1.5 bg-[#F2F3F1] border-t border-[#C8CECB] flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2 py-0.5 bg-[#E7E9E6] hover:bg-[#DDE1DE] border border-[#C8CECB] rounded text-[#5D676C] cursor-pointer shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-[#F2F3F1] border-t border-[#C8CECB] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${targetRole} roadmap, SQL, formulas, or cases...`}
          className="flex-1 bg-white border border-[#C8CECB] rounded px-3 py-1.5 text-xs text-[#253238] focus:outline-none focus:border-[#2E5B66]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-1.5 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-semibold rounded flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <IconSend size={13} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
