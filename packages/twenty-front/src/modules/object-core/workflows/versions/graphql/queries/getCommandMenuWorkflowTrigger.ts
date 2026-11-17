import { gql } from '@apollo/client';

export const GET_COMMAND_MENU_WORKFLOW_TRIGGER = gql`
  query GetCommandMenuWorkflowTrigger(
    $coreWorkflowVersionId: UUID
    $workspaceWorkflowVersionId: UUID
  ) {
    commandMenuWorkflowTrigger(
      coreWorkflowVersionId: $coreWorkflowVersionId
      workspaceWorkflowVersionId: $workspaceWorkflowVersionId
    ) {
      coreWorkflowVersionId
      coreWorkflowId
      trigger
    }
  }
`;
