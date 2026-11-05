"use client";

import { useState } from "react";
import SimulatorFrame from "@/components/hermes/simulators/SimulatorFrame";
import { ControlSwitch, LessonBox } from "@/components/shared/simulator";
import { asArray, type SimulatorBase } from "../types";
import AttackRow from "./AttackRow";

export interface Layer {
  id: string;
  label: string;
  desc?: string;
  /** Attack ids this layer stops when switched on. */
  blocks: string[];
}
export interface Attack {
  id: string;
  label: string;
  desc: string;
}

interface Props extends SimulatorBase {
  layers?: Layer[];
  attacks?: Attack[];
}

export default function LayerToggleSimulator(props: Props) {
  const layers = asArray<Layer>(props.layers);
  const attacks = asArray<Attack>(props.attacks);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const blockerOf = (attackId: string) =>
    layers.find((layer) => on[layer.id] && layer.blocks.includes(attackId))
      ?.label ?? null;
  const stopped = attacks.filter((attack) => blockerOf(attack.id)).length;

  return (
    <SimulatorFrame title={props.title ?? "Layers"} hint={props.hint ?? ""}>
      <div className="grid gap-3 sm:grid-cols-2">
        {layers.map((layer) => (
          <ControlSwitch
            key={layer.id}
            label={layer.label}
            description={layer.desc}
            checked={!!on[layer.id]}
            onChange={(value) =>
              setOn((prev) => ({ ...prev, [layer.id]: value }))
            }
          />
        ))}
      </div>
      <p className="text-sm font-medium">
        আটকানো attack: {stopped} / {attacks.length}
      </p>
      <ul className="flex flex-col gap-2">
        {attacks.map((attack) => (
          <AttackRow
            key={attack.id}
            attack={attack}
            blockedBy={blockerOf(attack.id)}
          />
        ))}
      </ul>
      {props.takeaway && <LessonBox>{props.takeaway}</LessonBox>}
    </SimulatorFrame>
  );
}
