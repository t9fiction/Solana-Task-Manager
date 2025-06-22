
# ✅ Solana Task Manager dApp

A full-stack decentralized task management application built on the **Solana blockchain** using **Anchor** and a modern **Next.js 14** frontend. It allows users to **create**, **update**, and **delete** their personal tasks stored directly on-chain via **Program Derived Addresses (PDAs)**.

---

## 🚀 Features

* ✅ **Create, update, and delete** tasks on Solana
* 🔐 **Wallet integration** (Phantom, Solflare, etc.)
* 📡 **Real-time blockchain interaction** using Anchor
* 🎨 **Clean UI** with TailwindCSS + SweetAlert2
* ⚙️ **Fully typed** with TypeScript (frontend + contract)

---

## 🧱 Smart Contract (Anchor)

Written in Rust using the Anchor framework.

### 📜 Program ID

```rust
declare_id!("8rwZJ58gyv2yY2eUanMYVWohBBLeSAguNDo736k2nDJf");
```

### 🧾 `Task` Account Structure

```rust
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
```

### 🔧 Instructions

* **create\_task(title, description)**
  Creates a new task for the connected wallet.
  PDA: `["task", author_pubkey, title]`

* **update\_task(...)**
  Allows updating task fields (e.g. mark as completed, edit title/description)

* **delete\_task()**
  Deletes the task account, only callable by the author.

### ❗ Errors

```rust
#[error_code]
pub enum ErrorTask {
    TitleTooLong,
    DescriptionTooLong,
    TitleIsEmpty,
    DescriptionIsEmpty,
    Unauthorized,
    TitleNotFound,
}
```

---

## 🖥️ Frontend Tech Stack

| Technology     | Usage                                      |
| -------------- | ------------------------------------------ |
| Next.js 14     | React framework (App Router)               |
| TailwindCSS    | Styling and layout                         |
| Anchor         | Smart contract framework                   |
| Wallet Adapter | Wallet connection (Phantom, Solflare, etc) |
| SweetAlert2    | Elegant loading and alert popups           |
| TypeScript     | Type safety for frontend and contract      |

---

## 📁 Project Structure

```
.
├── app/                # Next.js App Router directory
├── components/         # UI components
├── constants/          # Program ID and IDL
├── lib/                # Helper functions (getProvider, getProgram)
├── types/              # Shared TypeScript types (e.g., task.d.ts)
├── styles/             # Tailwind config
├── solana/             # Anchor program (Rust code)
├── public/             # Static assets
├── .env.local          # Environment variables
└── README.md
```

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/t9fiction/Solana-Task-Manager
cd solana-task-manager
```

### 2. Install Dependencies

Install Solana + Anchor related packages:

```bash
npm install @project-serum/anchor \
            @solana/wallet-adapter-base \
            @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/web3.js
```

Also install frontend packages:

```bash
npm install sweetalert2 tailwindcss postcss autoprefixer
```

Initialize TailwindCSS:

```bash
npx tailwindcss init -p
```

> If `package.json` is preconfigured, just run:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## 🧪 Running the App

### Start Dev Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

---

## 📦 Smart Contract Setup (Anchor)

### 1. Navigate to the Contract

```bash
cd solana/task_manager
```

### 2. Build & Deploy

```bash
anchor build
anchor deploy
```

Then, update `declare_id!` in `lib.rs` with the new deployed program ID.

---

## 🔐 Wallet Support

* Phantom
* Solflare
* Backpack
* Ledger (via Wallet Adapter)

---

## 📸 Screenshots

> Add some UI screenshots showing:
>
> * Connected wallet
> * Task creation form
> * Task list with edit/delete actions

---

## 📚 Resources

* [Anchor Book](https://book.anchor-lang.com/)
* [Solana Docs](https://docs.solana.com/)
* [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
* [SweetAlert2](https://sweetalert2.github.io/)

---

## 📄 License

MIT License © 2025 Sohail

---

## 🙌 Credits

* Built by Sohail using Anchor, Solana, and modern full-stack tooling.