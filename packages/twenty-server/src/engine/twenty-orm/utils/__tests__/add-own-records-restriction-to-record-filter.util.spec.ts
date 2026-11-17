import { addOwnRecordsRestrictionToRecordFilter } from 'src/engine/twenty-orm/utils/add-own-records-restriction-to-record-filter.util';

const LIMITED_PERMISSIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  isLimitedToOwnRecords: true,
};

describe('addOwnRecordsRestrictionToRecordFilter', () => {
  it('leaves the filter alone when the object is not limited', () => {
    const recordFilter = { name: { eq: 'Run' } };

    expect(
      addOwnRecordsRestrictionToRecordFilter({
        objectPermissions: {
          ...LIMITED_PERMISSIONS,
          isLimitedToOwnRecords: undefined,
        },
        workspaceMemberId: 'member-id',
        recordFilter,
      }),
    ).toBe(recordFilter);
  });

  it('restricts to records created by the member', () => {
    expect(
      addOwnRecordsRestrictionToRecordFilter({
        objectPermissions: LIMITED_PERMISSIONS,
        workspaceMemberId: 'member-id',
        recordFilter: null,
      }),
    ).toEqual({ createdBy: { workspaceMemberId: { eq: 'member-id' } } });
  });

  it('combines with an existing role filter', () => {
    expect(
      addOwnRecordsRestrictionToRecordFilter({
        objectPermissions: LIMITED_PERMISSIONS,
        workspaceMemberId: 'member-id',
        recordFilter: { name: { eq: 'Run' } },
      }),
    ).toEqual({
      and: [
        { name: { eq: 'Run' } },
        { createdBy: { workspaceMemberId: { eq: 'member-id' } } },
      ],
    });
  });

  it('matches nothing when there is no workspace member', () => {
    expect(
      addOwnRecordsRestrictionToRecordFilter({
        objectPermissions: LIMITED_PERMISSIONS,
        workspaceMemberId: undefined,
        recordFilter: null,
      }),
    ).toEqual({
      createdBy: {
        workspaceMemberId: { eq: '00000000-0000-0000-0000-000000000000' },
      },
    });
  });
});
