import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class CommandMenuWorkflowTriggerArgs {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  coreWorkflowVersionId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  workspaceWorkflowVersionId?: string;
}
