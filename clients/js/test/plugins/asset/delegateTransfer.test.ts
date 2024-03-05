import { generateSigner } from '@metaplex-foundation/umi';
import test from 'ava';
import {
  AssetWithPlugins,
  DataState,
  PluginType,
  addPluginAuthority,
  addPlugin,
  create,
  fetchAssetWithPlugins,
  transfer,
  updateAuthority,
} from '../../../src';
import { createUmi } from '../../_setup';

test('a delegate can transfer the asset', async (t) => {
  // Given a Umi instance and a new signer.
  const umi = await createUmi();
  const assetAddress = generateSigner(umi);
  const delegateAddress = generateSigner(umi);
  const newOwnerAddress = generateSigner(umi);

  // When we create a new account.
  await create(umi, {
    dataState: DataState.AccountState,
    asset: assetAddress,
    name: 'Test Bread',
    uri: 'https://example.com/bread',
    plugins: [],
  }).sendAndConfirm(umi);

  await addPlugin(umi, {
    asset: assetAddress.publicKey,
    addPluginArgs: {
      plugin: {
        __kind: 'Transfer',
        fields: [{}],
      },
    }
  }).sendAndConfirm(umi);

  await addPluginAuthority(umi, {
    asset: assetAddress.publicKey,
    addPluginAuthorityArgs: {
      pluginType: PluginType.Transfer,
      newAuthority: {
        __kind: 'Pubkey',
        address: delegateAddress.publicKey,
      },
    }
  }).sendAndConfirm(umi);

  await transfer(umi, {
    asset: assetAddress.publicKey,
    newOwner: newOwnerAddress.publicKey,
    authority: delegateAddress,
    compressionProof: null,
  }).sendAndConfirm(umi);

  const asset = await fetchAssetWithPlugins(umi, assetAddress.publicKey);
  // console.log(asset);
  t.like(asset, <AssetWithPlugins>{
    publicKey: assetAddress.publicKey,
    updateAuthority: updateAuthority('Address', [umi.identity.publicKey]),
    owner: newOwnerAddress.publicKey,
    name: 'Test Bread',
    uri: 'https://example.com/bread',
    pluginHeader: {
      key: 3,
      pluginRegistryOffset: BigInt(119),
    },
    pluginRegistry: {
      key: 4,
      registry: [
        {
          pluginType: PluginType.Transfer,
          offset: BigInt(118),
          authorities: [
            { __kind: 'Owner' },
            { __kind: 'Pubkey', address: delegateAddress.publicKey },
          ],
        },
      ],
    },
    plugins: [
      {
        authorities: [
          { __kind: 'Owner' },
          { __kind: 'Pubkey', address: delegateAddress.publicKey },
        ],
        plugin: {
          __kind: 'Transfer',
          fields: [{}],
        },
      },
    ],
  });
});
