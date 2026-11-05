"use client";

import { useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import SimulatorFrame from "./SimulatorFrame";

const LIMIT = 100;

export default function ContextWindowSimulator() {
  const [used, setUsed] = useState(10);
  const [compressed, setCompressed] = useState(false);
  const pct = Math.min(100, Math.round((used / LIMIT) * 100));
  const full = used >= LIMIT;

  return (
    <SimulatorFrame
      title="Context Window"
      hint="কথা বাড়াতে থাকো — context ভরে এলে কী হয়, আর compress করলে কী বাঁচে দেখো।"
    >
      <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${pct > 80 ? "bg-red-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm">
        {used}/{LIMIT} টোকেন-ইউনিট ব্যবহার হয়েছে ({pct}%)
        {full && " — ভরে গেছে! পুরনো কথা বাদ পড়ছে।"}
        {compressed && " — পুরনো কথার সারাংশ রেখে জায়গা খালি করা হয়েছে।"}
      </p>
      <div className="flex gap-2">
        <CustomButton
          variant="primary"
          disabled={full}
          onClick={() => {
            setUsed((u) => Math.min(LIMIT, u + 15));
            setCompressed(false);
          }}
        >
          আরও কথা বলো (+১৫)
        </CustomButton>
        <CustomButton
          variant="secondary"
          disabled={used < 40}
          onClick={() => {
            setUsed((u) => Math.round(u * 0.35));
            setCompressed(true);
          }}
        >
          Compress করো
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => {
            setUsed(10);
            setCompressed(false);
          }}
        >
          Reset
        </CustomButton>
      </div>
    </SimulatorFrame>
  );
}
