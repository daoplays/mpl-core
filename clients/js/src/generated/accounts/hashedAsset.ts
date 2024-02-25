/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  bytes,
  struct,
} from '@metaplex-foundation/umi/serializers';
import { Key, KeyArgs, getKeySerializer } from '../types';

export type HashedAsset = Account<HashedAssetAccountData>;

export type HashedAssetAccountData = { key: Key; hash: Uint8Array };

export type HashedAssetAccountDataArgs = { key: KeyArgs; hash: Uint8Array };

export function getHashedAssetAccountDataSerializer(): Serializer<
  HashedAssetAccountDataArgs,
  HashedAssetAccountData
> {
  return struct<HashedAssetAccountData>(
    [
      ['key', getKeySerializer()],
      ['hash', bytes({ size: 32 })],
    ],
    { description: 'HashedAssetAccountData' }
  ) as Serializer<HashedAssetAccountDataArgs, HashedAssetAccountData>;
}

export function deserializeHashedAsset(rawAccount: RpcAccount): HashedAsset {
  return deserializeAccount(rawAccount, getHashedAssetAccountDataSerializer());
}

export async function fetchHashedAsset(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<HashedAsset> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'HashedAsset');
  return deserializeHashedAsset(maybeAccount);
}

export async function safeFetchHashedAsset(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<HashedAsset | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeHashedAsset(maybeAccount) : null;
}

export async function fetchAllHashedAsset(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<HashedAsset[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'HashedAsset');
    return deserializeHashedAsset(maybeAccount);
  });
}

export async function safeFetchAllHashedAsset(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<HashedAsset[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) => deserializeHashedAsset(maybeAccount as RpcAccount));
}

export function getHashedAssetGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'mplCoreProgram',
    'CoREzp6dAdLVRKf3EM5tWrsXM2jQwRFeu5uhzsAyjYXL'
  );
  return gpaBuilder(context, programId)
    .registerFields<{ key: KeyArgs; hash: Uint8Array }>({
      key: [0, getKeySerializer()],
      hash: [1, bytes({ size: 32 })],
    })
    .deserializeUsing<HashedAsset>((account) =>
      deserializeHashedAsset(account)
    );
}

export function getHashedAssetSize(): number {
  return 33;
}
