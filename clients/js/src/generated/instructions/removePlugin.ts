/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';
import {
  RemovePluginArgs,
  RemovePluginArgsArgs,
  getRemovePluginArgsSerializer,
} from '../types';

// Accounts.
export type RemovePluginInstructionAccounts = {
  /** The address of the asset */
  asset: PublicKey | Pda;
  /** The collection to which the asset belongs */
  collection?: PublicKey | Pda;
  /** The owner or delegate of the asset */
  authority?: Signer;
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The system program */
  systemProgram?: PublicKey | Pda;
  /** The SPL Noop Program */
  logWrapper?: PublicKey | Pda;
};

// Data.
export type RemovePluginInstructionData = {
  discriminator: number;
  removePluginArgs: RemovePluginArgs;
};

export type RemovePluginInstructionDataArgs = {
  removePluginArgs: RemovePluginArgsArgs;
};

export function getRemovePluginInstructionDataSerializer(): Serializer<
  RemovePluginInstructionDataArgs,
  RemovePluginInstructionData
> {
  return mapSerializer<
    RemovePluginInstructionDataArgs,
    any,
    RemovePluginInstructionData
  >(
    struct<RemovePluginInstructionData>(
      [
        ['discriminator', u8()],
        ['removePluginArgs', getRemovePluginArgsSerializer()],
      ],
      { description: 'RemovePluginInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 4 })
  ) as Serializer<RemovePluginInstructionDataArgs, RemovePluginInstructionData>;
}

// Args.
export type RemovePluginInstructionArgs = RemovePluginInstructionDataArgs;

// Instruction.
export function removePlugin(
  context: Pick<Context, 'identity' | 'programs'>,
  input: RemovePluginInstructionAccounts & RemovePluginInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplCore',
    'CoREzp6dAdLVRKf3EM5tWrsXM2jQwRFeu5uhzsAyjYXL'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    asset: { index: 0, isWritable: true, value: input.asset ?? null },
    collection: { index: 1, isWritable: true, value: input.collection ?? null },
    authority: { index: 2, isWritable: false, value: input.authority ?? null },
    payer: { index: 3, isWritable: true, value: input.payer ?? null },
    systemProgram: {
      index: 4,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
    logWrapper: {
      index: 5,
      isWritable: false,
      value: input.logWrapper ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: RemovePluginInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getRemovePluginInstructionDataSerializer().serialize(
    resolvedArgs as RemovePluginInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
