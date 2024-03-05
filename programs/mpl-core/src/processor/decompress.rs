use borsh::{BorshDeserialize, BorshSerialize};
use mpl_utils::assert_signer;
use mpl_utils::resize_or_reallocate_account_raw;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_memory::sol_memcpy,
    system_program,
};

use crate::{
    error::MplCoreError,
    instruction::accounts::DecompressAccounts,
    plugins::{create_meta_idempotent, initialize_plugin, CheckResult, Plugin, ValidationResult},
    state::{Asset, CompressionProof, Key},
    utils::fetch_core_data,
    utils::{load_key, verify_proof},
};

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct DecompressArgs {
    compression_proof: CompressionProof,
}

pub(crate) fn decompress<'a>(
    accounts: &'a [AccountInfo<'a>],
    args: DecompressArgs,
) -> ProgramResult {
    // Accounts.
    let ctx = DecompressAccounts::context(accounts)?;

    // Guards.
    assert_signer(ctx.accounts.owner)?;
    let payer = if let Some(payer) = ctx.accounts.payer {
        assert_signer(payer)?;
        payer
    } else {
        ctx.accounts.owner
    };

    if *ctx.accounts.system_program.key != system_program::id() {
        return Err(MplCoreError::InvalidSystemProgram.into());
    }

    match load_key(ctx.accounts.asset, 0)? {
        Key::HashedAsset => {
            let (asset, plugins) = verify_proof(ctx.accounts.asset, &args.compression_proof)?;

            let serialized_data = asset.try_to_vec()?;
            resize_or_reallocate_account_raw(
                ctx.accounts.asset,
                payer,
                ctx.accounts.system_program,
                serialized_data.len(),
            )?;

            sol_memcpy(
                &mut ctx.accounts.asset.try_borrow_mut_data()?,
                &serialized_data,
                serialized_data.len(),
            );

            if !plugins.is_empty() {
                create_meta_idempotent(ctx.accounts.asset, payer, ctx.accounts.system_program)?;

                for plugin in plugins {
                    initialize_plugin(
                        &plugin.plugin,
                        &plugin.authorities,
                        ctx.accounts.asset,
                        payer,
                        ctx.accounts.system_program,
                    )?;
                }
            }

            let (asset, _, plugin_registry) = fetch_core_data::<Asset>(ctx.accounts.asset)?;

            let mut approved = false;
            match Asset::check_decompress() {
                CheckResult::CanApprove | CheckResult::CanReject => {
                    match asset.validate_decompress(&ctx.accounts)? {
                        ValidationResult::Approved => {
                            approved = true;
                        }
                        ValidationResult::Rejected => {
                            return Err(MplCoreError::InvalidAuthority.into())
                        }
                        ValidationResult::Pass => (),
                    }
                }
                CheckResult::None => (),
            };

            if let Some(plugin_registry) = plugin_registry {
                for record in plugin_registry.registry {
                    if matches!(
                        record.plugin_type.check_decompress(),
                        CheckResult::CanApprove | CheckResult::CanReject
                    ) {
                        let result = Plugin::load(ctx.accounts.asset, record.offset)?
                            .validate_decompress(ctx.accounts.owner, &args, &record.authorities)?;
                        if result == ValidationResult::Rejected {
                            return Err(MplCoreError::InvalidAuthority.into());
                        } else if result == ValidationResult::Approved {
                            approved = true;
                        }
                    }
                }
            };

            if !approved {
                return Err(MplCoreError::InvalidAuthority.into());
            }
        }
        Key::Asset => return Err(MplCoreError::AlreadyDecompressed.into()),
        _ => return Err(MplCoreError::IncorrectAccount.into()),
    }

    Ok(())
}
