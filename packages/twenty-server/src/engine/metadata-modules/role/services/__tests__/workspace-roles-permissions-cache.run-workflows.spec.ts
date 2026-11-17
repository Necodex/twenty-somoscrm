import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';

const OBJECTS = {
  workflow: STANDARD_OBJECTS.workflow.universalIdentifier,
  workflowVersion: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
  workflowRun: STANDARD_OBJECTS.workflowRun.universalIdentifier,
};

const compute = (grantedFlags: PermissionFlagType[]) => {
  const service = new WorkspaceRolesPermissionsCacheService();

  return service.computeForCache({
    workspaceId: 'workspace',
    rows: {
      role: [
        {
          id: 'role',
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      ],
      objectMetadata: Object.entries(OBJECTS).map(
        ([id, universalIdentifier]) => ({
          id,
          isSystem: true,
          universalIdentifier,
        }),
      ),
      objectPermission: { byRoleId: new Map() },
      rolePermissionFlag: {
        byRoleId: new Map([
          ['role', grantedFlags.map((flag) => ({ permissionFlagId: flag }))],
        ]),
      },
      permissionFlag: grantedFlags.map((flag) => ({
        id: flag,
        universalIdentifier: SystemPermissionFlag[flag],
      })),
      fieldPermission: { byRoleId: new Map() },
      rowLevelPermissionPredicate: { byRoleId: new Map() },
      rowLevelPermissionPredicateGroup: { byRoleId: new Map() },
      fieldMetadata: [],
    },
  } as never).role;
};

describe('Workflow object permissions for run-only roles', () => {
  it('lets a run-only role read only its own workflow runs', () => {
    const permissions = compute([PermissionFlagType.RUN_WORKFLOWS]);

    expect(permissions.workflowRun).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
      isLimitedToOwnRecords: true,
    });
    expect(permissions.workflow.canReadObjectRecords).toBe(false);
    expect(permissions.workflowVersion.canReadObjectRecords).toBe(false);
  });

  it('keeps full workflow access unrestricted for workflow managers', () => {
    const permissions = compute([
      PermissionFlagType.WORKFLOWS,
      PermissionFlagType.RUN_WORKFLOWS,
    ]);

    expect(permissions.workflowRun).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    });
    expect(permissions.workflowRun.isLimitedToOwnRecords).toBeUndefined();
  });

  it('gives no workflow run access without either flag', () => {
    expect(compute([]).workflowRun.canReadObjectRecords).toBe(false);
  });
});
