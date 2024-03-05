/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Option,
  OptionOrNullable,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  option,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';
import {
  CompressionProof,
  CompressionProofArgs,
  getCompressionProofSerializer,
} from '../types';

// Accounts.
export type BurnInstructionAccounts = {
  /** The address of the asset */
  asset: PublicKey | Pda;
  /** The collection to which the asset belongs */
  collection?: PublicKey | Pda;
  /** The owner or delegate of the asset */
  authority?: Signer;
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The SPL Noop Program */
  logWrapper?: PublicKey | Pda;
};

// Data.
export type BurnInstructionData = {
  discriminator: number;
  compressionProof: Option<CompressionProof>;
};

export type BurnInstructionDataArgs = {
  compressionProof: OptionOrNullable<CompressionProofArgs>;
};

export function getBurnInstructionDataSerializer(): Serializer<
  BurnInstructionDataArgs,
  BurnInstructionData
> {
  return mapSerializer<BurnInstructionDataArgs, any, BurnInstructionData>(
    struct<BurnInstructionData>(
      [
        ['discriminator', u8()],
        ['compressionProof', option(getCompressionProofSerializer())],
      ],
      { description: 'BurnInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 12 })
  ) as Serializer<BurnInstructionDataArgs, BurnInstructionData>;
}

// Args.
export type BurnInstructionArgs = BurnInstructionDataArgs;

// Instruction.
export function burn(
  context: Pick<Context, 'identity' | 'programs'>,
  input: BurnInstructionAccounts & BurnInstructionArgs
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
    logWrapper: {
      index: 4,
      isWritable: false,
      value: input.logWrapper ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: BurnInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
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
  const data = getBurnInstructionDataSerializer().serialize(
    resolvedArgs as BurnInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
