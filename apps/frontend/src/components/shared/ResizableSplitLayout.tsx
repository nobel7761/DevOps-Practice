"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/shared/shadcn";

/** Draggable left/right split on desktop (lg+); simple stacked layout below that. */
export default function ResizableSplitLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-6">
        {left}
        {right}
      </div>
    );
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="gap-6">
      <ResizablePanel defaultSize={50} minSize={28}>
        {left}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={28}>
        {right}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
