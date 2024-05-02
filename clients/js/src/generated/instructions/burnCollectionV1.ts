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
export type BurnCollectionV1InstructionAccounts = {
  /** The address of the asset */
  collection: PublicKey | Pda;
  /** The account paying for the storage fees */
  payer?: Signer;
  /** The owner or delegate of the asset */
  authority?: Signer;
  /** The SPL Noop Program */
  logWrapper?: PublicKey | Pda;
};

// Data.
export type BurnCollectionV1InstructionData = {
  discriminator: number;
  compressionProof: Option<CompressionProof>;
};

export type BurnCollectionV1InstructionDataArgs = {
  compressionProof: OptionOrNullable<CompressionProofArgs>;
};

export function getBurnCollectionV1InstructionDataSerializer(): Serializer<
  BurnCollectionV1InstructionDataArgs,
  BurnCollectionV1InstructionData
> {
  return mapSerializer<
    BurnCollectionV1InstructionDataArgs,
    any,
    BurnCollectionV1InstructionData
  >(
    struct<BurnCollectionV1InstructionData>(
      [
        ['discriminator', u8()],
        ['compressionProof', option(getCompressionProofSerializer())],
      ],
      { description: 'BurnCollectionV1InstructionData' }
    ),
    (value) => ({ ...value, discriminator: 15 })
  ) as Serializer<
    BurnCollectionV1InstructionDataArgs,
    BurnCollectionV1InstructionData
  >;
}

// Args.
export type BurnCollectionV1InstructionArgs =
  BurnCollectionV1InstructionDataArgs;

// Instruction.
export function burnCollectionV1(
  context: Pick<Context, 'payer' | 'programs'>,
  input: BurnCollectionV1InstructionAccounts & BurnCollectionV1InstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplCore',
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'
  );

  // Accounts.
  const resolvedAccounts = {
    collection: {
      index: 0,
      isWritable: true as boolean,
      value: input.collection ?? null,
    },
    payer: {
      index: 1,
      isWritable: true as boolean,
      value: input.payer ?? null,
    },
    authority: {
      index: 2,
      isWritable: false as boolean,
      value: input.authority ?? null,
    },
    logWrapper: {
      index: 3,
      isWritable: false as boolean,
      value: input.logWrapper ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: BurnCollectionV1InstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.payer.value) {
    resolvedAccounts.payer.value = context.payer;
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
  const data = getBurnCollectionV1InstructionDataSerializer().serialize(
    resolvedArgs as BurnCollectionV1InstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
