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
  AddPluginArgs,
  AddPluginArgsArgs,
  getAddPluginArgsSerializer,
} from '../types';

// Accounts.
export type AddCollectionPluginInstructionAccounts = {
  /** The address of the asset */
  collection: PublicKey | Pda;
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
export type AddCollectionPluginInstructionData = {
  discriminator: number;
  addPluginArgs: AddPluginArgs;
};

export type AddCollectionPluginInstructionDataArgs = {
  addPluginArgs: AddPluginArgsArgs;
};

export function getAddCollectionPluginInstructionDataSerializer(): Serializer<
  AddCollectionPluginInstructionDataArgs,
  AddCollectionPluginInstructionData
> {
  return mapSerializer<
    AddCollectionPluginInstructionDataArgs,
    any,
    AddCollectionPluginInstructionData
  >(
    struct<AddCollectionPluginInstructionData>(
      [
        ['discriminator', u8()],
        ['addPluginArgs', getAddPluginArgsSerializer()],
      ],
      { description: 'AddCollectionPluginInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 3 })
  ) as Serializer<
    AddCollectionPluginInstructionDataArgs,
    AddCollectionPluginInstructionData
  >;
}

// Args.
export type AddCollectionPluginInstructionArgs =
  AddCollectionPluginInstructionDataArgs;

// Instruction.
export function addCollectionPlugin(
  context: Pick<Context, 'identity' | 'programs'>,
  input: AddCollectionPluginInstructionAccounts &
    AddCollectionPluginInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplCore',
    'CoREzp6dAdLVRKf3EM5tWrsXM2jQwRFeu5uhzsAyjYXL'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    collection: { index: 0, isWritable: true, value: input.collection ?? null },
    authority: { index: 1, isWritable: false, value: input.authority ?? null },
    payer: { index: 2, isWritable: true, value: input.payer ?? null },
    systemProgram: {
      index: 3,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
    logWrapper: {
      index: 4,
      isWritable: false,
      value: input.logWrapper ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: AddCollectionPluginInstructionArgs = { ...input };

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
  const data = getAddCollectionPluginInstructionDataSerializer().serialize(
    resolvedArgs as AddCollectionPluginInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
