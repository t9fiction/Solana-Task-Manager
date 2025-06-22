use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("8rwZJ58gyv2yY2eUanMYVWohBBLeSAguNDo736k2nDJf");

#[program]
pub mod task_manager {
    use super::*;

    // Creating the task
    pub fn create_task(ctx: Context<CreateTask>, title: String, description: String) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let clock = Clock::get()?;

        require!(title.len() <= 100, ErrorTask::TitleTooLong);
        require!(!title.trim().is_empty(), ErrorTask::TitleIsEmpty);
        require!(description.len() <= 1000, ErrorTask::DescriptionTooLong);
        require!(
            !description.trim().is_empty(),
            ErrorTask::DescriptionIsEmpty
        );

        task.author = ctx.accounts.author.key();
        task.title = title.clone();
        task.description = description.clone();
        task.is_completed = false;
        task.created_at = clock.unix_timestamp;

        msg!(
            "Task create, Title: {}, Author: {}, Created at: {}",
            task.title,
            task.author,
            task.created_at
        );

        Ok(())
    }

    // Updating the description in the task
    pub fn update_task(ctx: Context<UpdateTask>, description: String) -> Result<()> {
        let task = &mut ctx.accounts.task;

        require!(description.len() <= 1000, ErrorTask::DescriptionTooLong);
        require!(
            !description.trim().is_empty(),
            ErrorTask::DescriptionIsEmpty
        );

        task.description = description.clone();
        msg!(
            "Task description updated, Title: {}, Author: {}",
            task.title,
            task.author
        );

        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        task.is_completed = true;
        msg!(
            "Task is marked complete. Title: {}, Author: {}",
            task.title,
            task.author
        );
        Ok(())
    }

    pub fn delete_task(ctx: Context<DeleteTask>) -> Result<()> {
        let task = &ctx.accounts.task;
        require!(
            task.author == ctx.accounts.author.key(),
            ErrorTask::Unauthorized
        );
        msg!(
            "Task Deleted. Title: {}, Author: {}",
            task.title,
            task.author
        );
        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        init,
        payer= author,
        space = 8 + Task::INIT_SPACE,
        seeds = [b"task", author.key().as_ref(), title.as_bytes()],
        bump,
    )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", author.key().as_ref(), task.title.as_bytes()],
        bump,
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", author.key().as_ref(), task.title.as_bytes()],
        bump,
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", author.key().as_ref(), task.title.as_bytes()],
        bump,
        close = author,
    )]
    pub task: Account<'info, Task>,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    pub author: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(1000)]
    pub description: String,
    pub is_completed: bool,
    pub created_at: i64,
}

#[error_code]
pub enum ErrorTask {
    #[msg("Title can't be more then 100 chars")]
    TitleTooLong,
    #[msg("Description can't be more then 1000 chars")]
    DescriptionTooLong,
    #[msg("Title is empty")]
    TitleIsEmpty,
    #[msg("Description is empty")]
    DescriptionIsEmpty,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Title not found")]
    TitleNotFound,
}
