"use client";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-[16px_16px_4px_16px] border border-[#00FFB3]/[0.18] bg-[#00FFB3]/[0.10] px-4 py-3 text-[14.5px] leading-6 whitespace-pre-wrap text-white">
        {content}
      </div>
    </div>
  );
}
