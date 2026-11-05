"use client";

import { useState } from "react";
import SimulatorFrame from "../SimulatorFrame";
import ChainPanel from "./ChainPanel";
import SizePanel from "./SizePanel";
import type { Provider, SizeProvider } from "./logic";

export default function SttFallbackSimulator() {
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState<Record<Provider, boolean>>({
    local: false,
    groq: true,
    openai: true,
  });
  const [provider, setProvider] = useState<SizeProvider>("openai");
  const [mb, setMb] = useState(100);
  return (
    <SimulatorFrame
      title="Speech-to-Text Fallback"
      hint="ELI5: কথা লেখায় বদলাতে Hermes তিনজন সহকারীকে ক্রমানুযায়ী ডাকে — local, তারপর groq, তারপর openai।"
    >
      <h4 className="text-sm font-medium">
        ১. Automatic fallback (local &gt; groq &gt; openai)
      </h4>
      <ChainPanel
        enabled={enabled}
        ready={ready}
        setEnabled={setEnabled}
        setReady={(p, v) => setReady((r) => ({ ...r, [p]: v }))}
      />
      <h4 className="text-sm font-medium">২. Upload size limit</h4>
      <SizePanel
        provider={provider}
        mb={mb}
        setProvider={setProvider}
        setMb={setMb}
      />
    </SimulatorFrame>
  );
}
