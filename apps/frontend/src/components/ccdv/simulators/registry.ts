import type { ComponentType } from "react";
import BudgetMeterSimulator from "./budget-meter";
import FlowStepperSimulator from "./flow-stepper";
import LayerToggleSimulator from "./layer-toggle";
import SortGameSimulator from "./sort-game";

/** Data-driven simulators: a lesson block passes its JSON `props` (see docs/ccdv/CHAPTER_BRIEF.md). */
export const CCDV_SIMULATORS: Record<
  string,
  ComponentType<Record<string, unknown>>
> = {
  "flow-stepper": FlowStepperSimulator as ComponentType<
    Record<string, unknown>
  >,
  "sort-game": SortGameSimulator as ComponentType<Record<string, unknown>>,
  "budget-meter": BudgetMeterSimulator as ComponentType<
    Record<string, unknown>
  >,
  "layer-toggle": LayerToggleSimulator as ComponentType<
    Record<string, unknown>
  >,
};
