import { workflowRunSchema } from '../workflow-run-schema';

const RUN_WITHOUT_WORKFLOW_RELATIONS = {
  __typename: 'WorkflowRun',
  id: 'run-id',
  coreWorkflowId: 'core-workflow-id',
  coreWorkflowVersionId: 'core-version-id',
  state: null,
  status: 'RUNNING',
  createdAt: '2026-11-05T00:00:00.000Z',
  deletedAt: null,
  endedAt: null,
  name: '#1 - Run',
};

describe('workflowRunSchema', () => {
  it('accepts a run whose workflow relation ids were not returned', () => {
    expect(
      workflowRunSchema.safeParse(RUN_WITHOUT_WORKFLOW_RELATIONS).success,
    ).toBe(true);
  });

  it('still rejects a run with an invalid workflow id', () => {
    expect(
      workflowRunSchema.safeParse({
        ...RUN_WITHOUT_WORKFLOW_RELATIONS,
        workflowId: 42,
      }).success,
    ).toBe(false);
  });
});
