import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { isCoreWorkflowVersionRunnableFromCommandMenu } from 'src/engine/core-modules/workflow/utils/is-core-workflow-version-runnable-from-command-menu.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const buildTrigger = (type: WorkflowTriggerType) =>
  ({
    name: 'Trigger',
    type,
    settings: { outputSchema: {} },
  }) as WorkflowTrigger;

const ACTIVE_MANUAL_VERSION = {
  id: 'core-version-id',
  status: WorkflowVersionStatus.ACTIVE,
  triggers: [buildTrigger(WorkflowTriggerType.MANUAL)],
  workspaceWorkflowVersionId: 'workspace-version-id',
};

const BUTTON = {
  engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
  isActive: true,
  coreWorkflowVersionId: 'core-version-id',
  workflowVersionId: null,
};

describe('isCoreWorkflowVersionRunnableFromCommandMenu', () => {
  it('allows an active manual version that has a button', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: ACTIVE_MANUAL_VERSION,
        commandMenuItems: [BUTTON],
      }),
    ).toBe(true);
  });

  it('allows a button that points to the workspace version id', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: ACTIVE_MANUAL_VERSION,
        commandMenuItems: [
          {
            ...BUTTON,
            coreWorkflowVersionId: null,
            workflowVersionId: 'workspace-version-id',
          },
        ],
      }),
    ).toBe(true);
  });

  it('refuses a draft version', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: {
          ...ACTIVE_MANUAL_VERSION,
          status: WorkflowVersionStatus.DRAFT,
        },
        commandMenuItems: [BUTTON],
      }),
    ).toBe(false);
  });

  it('refuses a version without a manual trigger', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: {
          ...ACTIVE_MANUAL_VERSION,
          triggers: [buildTrigger(WorkflowTriggerType.WEBHOOK)],
        },
        commandMenuItems: [BUTTON],
      }),
    ).toBe(false);
  });

  it('refuses a version with no button', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: ACTIVE_MANUAL_VERSION,
        commandMenuItems: [
          { ...BUTTON, coreWorkflowVersionId: 'another-version-id' },
        ],
      }),
    ).toBe(false);
  });

  it('refuses a version whose button is deactivated', () => {
    expect(
      isCoreWorkflowVersionRunnableFromCommandMenu({
        coreWorkflowVersion: ACTIVE_MANUAL_VERSION,
        commandMenuItems: [{ ...BUTTON, isActive: false }],
      }),
    ).toBe(false);
  });
});
