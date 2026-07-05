"use client";

import type { NdaFormData, Party } from "@/lib/types";

type Props = {
  data: NdaFormData;
  onChange: (next: NdaFormData) => void;
};

const labelCls = "block text-sm font-medium text-slate-700 mb-1";
const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
const sectionCls = "space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm";
const sectionTitleCls = "text-base font-semibold text-slate-900";

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: Party;
  onChange: (p: Party) => void;
}) {
  const set = <K extends keyof Party>(key: K, value: Party[K]) =>
    onChange({ ...party, [key]: value });

  return (
    <div className={sectionCls}>
      <h3 className={sectionTitleCls}>{title}</h3>
      <div>
        <label className={labelCls}>Company</label>
        <input
          className={inputCls}
          value={party.company}
          onChange={(e) => set("company", e.target.value)}
          placeholder="Acme, Inc."
        />
      </div>
      <div>
        <label className={labelCls}>Signatory name</label>
        <input
          className={inputCls}
          value={party.signatoryName}
          onChange={(e) => set("signatoryName", e.target.value)}
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label className={labelCls}>Title</label>
        <input
          className={inputCls}
          value={party.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Chief Executive Officer"
        />
      </div>
      <div>
        <label className={labelCls}>Notice address</label>
        <textarea
          className={`${inputCls} min-h-[70px]`}
          value={party.noticeAddress}
          onChange={(e) => set("noticeAddress", e.target.value)}
          placeholder="legal@acme.com or 123 Main St, City, ST 00000"
        />
      </div>
    </div>
  );
}

export default function NdaForm({ data, onChange }: Props) {
  const set = <K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <PartyFields
        title="Party 1"
        party={data.party1}
        onChange={(p) => set("party1", p)}
      />
      <PartyFields
        title="Party 2"
        party={data.party2}
        onChange={(p) => set("party2", p)}
      />

      <div className={sectionCls}>
        <h3 className={sectionTitleCls}>Deal terms</h3>

        <div>
          <label className={labelCls}>Purpose</label>
          <textarea
            className={`${inputCls} min-h-[70px]`}
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Effective date</label>
          <input
            type="date"
            className={inputCls}
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className={labelCls}>MNDA term</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mndaTerm"
              checked={data.mndaTermMode === "expires"}
              onChange={() => set("mndaTermMode", "expires")}
            />
            Expires after
            <input
              type="number"
              min={1}
              className={`${inputCls} w-20`}
              value={data.mndaTermYears}
              onChange={(e) => set("mndaTermYears", e.target.value)}
              disabled={data.mndaTermMode !== "expires"}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="mndaTerm"
              checked={data.mndaTermMode === "untilTerminated"}
              onChange={() => set("mndaTermMode", "untilTerminated")}
            />
            Continues until terminated
          </label>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className={labelCls}>Term of confidentiality</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="confidentiality"
              checked={data.confidentialityMode === "years"}
              onChange={() => set("confidentialityMode", "years")}
            />
            <input
              type="number"
              min={1}
              className={`${inputCls} w-20`}
              value={data.confidentialityYears}
              onChange={(e) => set("confidentialityYears", e.target.value)}
              disabled={data.confidentialityMode !== "years"}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="confidentiality"
              checked={data.confidentialityMode === "perpetuity"}
              onChange={() => set("confidentialityMode", "perpetuity")}
            />
            In perpetuity
          </label>
        </fieldset>

        <div>
          <label className={labelCls}>Governing law (state)</label>
          <input
            className={inputCls}
            value={data.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
            placeholder="Delaware"
          />
        </div>

        <div>
          <label className={labelCls}>Jurisdiction</label>
          <input
            className={inputCls}
            value={data.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
            placeholder='courts located in New Castle, DE'
          />
        </div>

        <div>
          <label className={labelCls}>
            MNDA modifications <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            className={`${inputCls} min-h-[70px]`}
            value={data.modifications}
            onChange={(e) => set("modifications", e.target.value)}
            placeholder="List any modifications to the Standard Terms."
          />
        </div>
      </div>
    </div>
  );
}
