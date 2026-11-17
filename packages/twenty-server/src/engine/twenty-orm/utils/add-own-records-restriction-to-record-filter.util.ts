import {
  type ObjectPermissions,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Never matches a real record, so a caller without a workspace member sees nothing
const NO_WORKSPACE_MEMBER_ID = '00000000-0000-0000-0000-000000000000';

export const addOwnRecordsRestrictionToRecordFilter = ({
  objectPermissions,
  workspaceMemberId,
  recordFilter,
}: {
  objectPermissions: ObjectPermissions | undefined;
  workspaceMemberId: string | undefined;
  recordFilter: RecordGqlOperationFilter | null;
}): RecordGqlOperationFilter | null => {
  if (objectPermissions?.isLimitedToOwnRecords !== true) {
    return recordFilter;
  }

  const ownRecordsFilter: RecordGqlOperationFilter = {
    createdBy: {
      workspaceMemberId: { eq: workspaceMemberId ?? NO_WORKSPACE_MEMBER_ID },
    },
  };

  return isDefined(recordFilter)
    ? { and: [recordFilter, ownRecordsFilter] }
    : ownRecordsFilter;
};
