import type { ComponentType } from "react";
import AgentLoopSimulator from "./AgentLoopSimulator";
import ApprovalSimulator from "./ApprovalSimulator";
import CheckpointRollbackSimulator from "./checkpoint-rollback";
import ContextFilePrioritySimulator from "./context-file-priority";
import ContextReferenceBudgetSimulator from "./context-reference-budget";
import ContextWindowSimulator from "./ContextWindowSimulator";
import CronSimulator from "./CronSimulator";
import DelegationSimulator from "./DelegationSimulator";
import GatewayAuthSimulator from "./gateway-auth";
import GoalLoopSimulator from "./goal-loop";
import HookEventsSimulator from "./hook-events";
import InstallPickerSimulator from "./install-picker";
import KanbanBoardSimulator from "./kanban-board";
import MemorySimulator from "./MemorySimulator";
import ModelSwitchCostSimulator from "./model-switch-cost";
import PluginGateSimulator from "./plugin-gate";
import SecretPrecedenceSimulator from "./secret-precedence";
import SessionResumeSimulator from "./session-resume";
import SkillLifecycleSimulator from "./skill-lifecycle";
import SttFallbackSimulator from "./stt-fallback";
import ToolsetPickerSimulator from "./toolset-picker";
import UpdatePipelineSimulator from "./update-pipeline";
import WebBackendSimulator from "./web-backend";
import WorktreeSweepSimulator from "./worktree-sweep";

/** Simulator ids a lesson's `{ "type": "simulator", "id": ... }` block may use. */
export const SIMULATORS: Record<string, ComponentType> = {
  "agent-loop": AgentLoopSimulator,
  memory: MemorySimulator,
  cron: CronSimulator,
  approval: ApprovalSimulator,
  delegation: DelegationSimulator,
  "context-window": ContextWindowSimulator,
  "update-pipeline": UpdatePipelineSimulator,
  "install-picker": InstallPickerSimulator,
  "toolset-picker": ToolsetPickerSimulator,
  "context-file-priority": ContextFilePrioritySimulator,
  "skill-lifecycle": SkillLifecycleSimulator,
  "context-reference-budget": ContextReferenceBudgetSimulator,
  "web-backend": WebBackendSimulator,
  "plugin-gate": PluginGateSimulator,
  "session-resume": SessionResumeSimulator,
  "worktree-sweep": WorktreeSweepSimulator,
  "model-switch-cost": ModelSwitchCostSimulator,
  "stt-fallback": SttFallbackSimulator,
  "gateway-auth": GatewayAuthSimulator,
  "checkpoint-rollback": CheckpointRollbackSimulator,
  "secret-precedence": SecretPrecedenceSimulator,
  "goal-loop": GoalLoopSimulator,
  "kanban-board": KanbanBoardSimulator,
  "hook-events": HookEventsSimulator,
};
