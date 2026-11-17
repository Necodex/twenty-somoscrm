import { GetCommandMenuWorkflowTriggerDocument } from '~/generated/graphql';
import { useCallback } from 'react';

import {
  type HeadlessCommandContextApi,
  type HeadlessEngineCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

type EnrichParams = {
  headlessEngineCommandContextApi: HeadlessEngineCommandContextApi;
  workflowVersionId?: string;
  coreWorkflowVersionId?: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
};

export const useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
  () => {
    const apolloCoreClient = useApolloCoreClient();

    const enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation =
      useCallback(
        async ({
          headlessEngineCommandContextApi,
          workflowVersionId,
          coreWorkflowVersionId,
          availabilityType,
          availabilityObjectMetadataId,
        }: EnrichParams): Promise<HeadlessCommandContextApi | undefined> => {
          if (
            !isDefined(coreWorkflowVersionId) &&
            !isDefined(workflowVersionId)
          ) {
            return undefined;
          }

          const { data } = await apolloCoreClient.query({
            query: GetCommandMenuWorkflowTriggerDocument,
            variables: {
              coreWorkflowVersionId,
              workspaceWorkflowVersionId: isDefined(coreWorkflowVersionId)
                ? undefined
                : workflowVersionId,
            },
            fetchPolicy: 'network-only',
          });
          const workflowTrigger = data?.commandMenuWorkflowTrigger;

          if (!isDefined(workflowTrigger)) {
            return undefined;
          }

          return {
            ...headlessEngineCommandContextApi,
            workflowId: workflowTrigger.coreWorkflowId,
            workflowVersionId: workflowTrigger.coreWorkflowVersionId,
            coreWorkflowId: workflowTrigger.coreWorkflowId,
            coreWorkflowVersionId: workflowTrigger.coreWorkflowVersionId,
            trigger: workflowTrigger.trigger ?? null,
            availabilityType,
            availabilityObjectMetadataId,
          };
        },
        [apolloCoreClient],
      );

    return {
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    };
  };
