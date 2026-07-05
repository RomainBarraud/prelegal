"use client";

type Props = {
  markdown: string;
};

export default function NdaPreview({ markdown }: Props) {
  return (
    <pre className="whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-6 font-mono text-[13px] leading-relaxed text-slate-800 shadow-sm">
      {markdown}
    </pre>
  );
}
