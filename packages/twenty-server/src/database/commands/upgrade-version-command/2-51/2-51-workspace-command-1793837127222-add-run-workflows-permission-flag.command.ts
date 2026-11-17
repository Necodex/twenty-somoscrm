import { Command } from 'nest-commander';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const RUN_WORKFLOWS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  SystemPermissionFlag.RUN_WORKFLOWS;

@RegisteredWorkspaceCommand('2.51.0', 1793837127222)
@Command({
  name: 'upgrade:2-51:add-run-workflows-permission-flag',
  description:
    'Add the Run Workflows permission flag so roles can trigger workflow buttons without managing workflows',
})
export class AddRunWorkflowsPermissionFlagCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const permissionFlagsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPermissionFlag>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPermissionFlagMaps,
        existingFlatEntityMaps: flatPermissionFlagMaps,
        universalIdentifiers: [
          RUN_WORKFLOWS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
        ],
      });

    if (!isNonEmptyArray(permissionFlagsToCreate)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the Run Workflows permission flag`,
    );

    if (options.dryRun) {
      return;
    }

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      permissionFlagsToCreate,
      permissionFlagsToDelete: [],
    });
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatPermissionFlagMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPermissionFlagMaps',
      ]);

    const existingFlatPermissionFlag =
      findFlatEntityByUniversalIdentifier<FlatPermissionFlag>({
        universalIdentifier: RUN_WORKFLOWS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
        flatEntityMaps: flatPermissionFlagMaps,
      });

    if (!isDefined(existingFlatPermissionFlag) || options.dryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      permissionFlagsToCreate: [],
      permissionFlagsToDelete: [existingFlatPermissionFlag],
    });
  }

  private async runMigration({
    workspaceId,
    applicationUniversalIdentifier,
    permissionFlagsToCreate,
    permissionFlagsToDelete,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    permissionFlagsToCreate: FlatPermissionFlag[];
    permissionFlagsToDelete: FlatPermissionFlag[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
              flatEntityToCreate: permissionFlagsToCreate,
              flatEntityToDelete: permissionFlagsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to change the Run Workflows permission flag for workspace ${workspaceId}`,
      );
    }
  }
}
