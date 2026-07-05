"use client";

import { useMemo, useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaPreview from "@/components/NdaPreview";
import { defaultFormData } from "@/lib/types";
import { filename, renderMutualNda } from "@/lib/template";

const todayIso = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function Page() {
  const [data, setData] = useState(() => defaultFormData(todayIso()));
  const markdown = useMemo(() => renderMutualNda(data), [data]);

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename(data);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Mutual NDA creator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Fill in the details on the left. The completed Common Paper Mutual NDA
            updates live on the right. Download the finished document as Markdown.
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Download .md
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="form-heading">
          <h2 id="form-heading" className="sr-only">
            NDA details
          </h2>
          <NdaForm data={data} onChange={setData} />
        </section>
        <section aria-labelledby="preview-heading">
          <h2
            id="preview-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Preview
          </h2>
          <NdaPreview markdown={markdown} />
        </section>
      </div>
    </main>
  );
}
