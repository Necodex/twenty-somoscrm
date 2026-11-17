import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@ObjectType('CommandMenuWorkflowTrigger')
export class CommandMenuWorkflowTriggerDTO {
  @Field(() => UUIDScalarType)
  coreWorkflowVersionId: string;

  @Field(() => UUIDScalarType)
  coreWorkflowId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  trigger: WorkflowTrigger | null;
}
