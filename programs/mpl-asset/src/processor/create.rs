use borsh::BorshSerialize;
use mpl_utils::assert_signer;
use solana_program::{
    account_info::AccountInfo, clock::Clock, entrypoint::ProgramResult, program::invoke,
    program_memory::sol_memcpy, rent::Rent, system_instruction, system_program, sysvar::Sysvar,
};

use crate::{
    error::MplAssetError,
    instruction::{accounts::CreateAccounts, CreateArgs},
    state::{Asset, Compressible, DataState, HashedAsset, Key},
};

pub(crate) fn create<'a>(accounts: &'a [AccountInfo<'a>], args: CreateArgs) -> ProgramResult {
    // Accounts.
    let ctx = CreateAccounts::context(accounts)?;
    let rent = Rent::get()?;

    // Guards.
    assert_signer(ctx.accounts.asset_address)?;
    assert_signer(ctx.accounts.payer)?;

    if *ctx.accounts.system_program.key != system_program::id() {
        return Err(MplAssetError::InvalidSystemProgram.into());
    }

    let new_asset = Asset {
        key: Key::Asset,
        update_authority: *ctx.accounts.authority.unwrap_or(ctx.accounts.payer).key,
        owner: *ctx
            .accounts
            .owner
            .unwrap_or(ctx.accounts.authority.unwrap_or(ctx.accounts.payer))
            .key,
        name: args.name,
        uri: args.uri,
    };

    let serialized_data = new_asset.try_to_vec()?;

    let serialized_data = match args.data_state {
        DataState::AccountState => serialized_data,
        DataState::LedgerState => {
            invoke(&spl_noop::instruction(serialized_data.clone()), &[])?;

            let hashed_asset = HashedAsset {
                key: Key::HashedAsset,
                hash: new_asset.hash()?,
                watermark_slot: match args.watermark {
                    true => Some(Clock::get()?.slot),
                    false => None,
                },
            };

            hashed_asset.try_to_vec()?
        }
    };

    let lamports = rent.minimum_balance(serialized_data.len());

    // CPI to the System Program.
    invoke(
        &system_instruction::create_account(
            ctx.accounts.payer.key,
            ctx.accounts.asset_address.key,
            lamports,
            serialized_data.len() as u64,
            &crate::id(),
        ),
        &[
            ctx.accounts.payer.clone(),
            ctx.accounts.asset_address.clone(),
            ctx.accounts.system_program.clone(),
        ],
    )?;

    sol_memcpy(
        &mut ctx.accounts.asset_address.try_borrow_mut_data()?,
        &serialized_data,
        serialized_data.len(),
    );

    Ok(())
}
