import { isDefined } from 'twenty-shared/utils';

import {
  type WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type CommandMenuItemTrigger = Pick<
  CommandMenuItemEntity,
  | 'engineComponentKey'
  | 'isActive'
  | 'coreWorkflowVersionId'
  | 'workflowVersionId'
>;

export const isCoreWorkflowVersionRunnableFromCommandMenu = ({
  coreWorkflowVersion,
  commandMenuItems,
}: {
  coreWorkflowVersion: Pick<
    WorkflowVersionEntity,
    'id' | 'status' | 'triggers' | 'workspaceWorkflowVersionId'
  >;
  commandMenuItems: CommandMenuItemTrigger[];
}): boolean => {
  if (coreWorkflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
    return false;
  }

  const hasManualTrigger = (coreWorkflowVersion.triggers ?? []).some(
    (trigger) => trigger.type === WorkflowTriggerType.MANUAL,
  );

  if (!hasManualTrigger) {
    return false;
  }

  return commandMenuItems.some(
    (commandMenuItem) =>
      commandMenuItem.isActive &&
      commandMenuItem.engineComponentKey ===
        EngineComponentKey.TRIGGER_WORKFLOW_VERSION &&
      (commandMenuItem.coreWorkflowVersionId === coreWorkflowVersion.id ||
        (isDefined(coreWorkflowVersion.workspaceWorkflowVersionId) &&
          commandMenuItem.workflowVersionId ===
            coreWorkflowVersion.workspaceWorkflowVersionId)),
  );
};
