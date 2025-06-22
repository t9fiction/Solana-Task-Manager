# 📝 Solana Notes dApp

A full-stack decentralized note-taking application built on the **Solana blockchain** using **Anchor** and a modern **Next.js 14** frontend. It enables users to **create**, **update**, and **delete** personal notes stored directly on-chain using **Program Derived Addresses (PDAs)**.

---

## 🚀 Features

- 📝 **Create, update, and delete** personal notes on Solana
- 🔐 **Wallet integration** (Phantom, Solflare, etc.)
- 📡 **Real-time blockchain interaction** with Anchor
- 🎨 **Clean UI** using TailwindCSS + SweetAlert2
- ⚙️ **TypeScript** support for both frontend and smart contract

---

## 🧱 Smart Contract (Anchor)

Written in Rust using the Anchor framework.

### 📜 Program ID

```rust
declare_id!("H17VxY33ssugCtupfKJkNSawepVgh4RWsz7fk6CsCiA4");
````

### 🧾 `Note` Account Structure

```rust
#[account]
#[derive(InitSpace)]
pub struct Note {
    pub author: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
    pub created_at: i64,
    pub last_updated: i64,
}
```

### 🔧 Instructions

* **create\_note(title, content)**
  Creates a new note. PDA: `["note", author_pubkey, title]`

* **update\_note(content)**
  Only the author can update the note content.

* **delete\_note()**
  Deletes and closes the note account.

### ❗ Errors

```rust
#[error_code]
pub enum NotesError {
    TitleTooLong,
    ContentTooLong,
    TitleIsEmpty,
    ContentIsEmpty,
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
├── types/              # Shared TypeScript types (e.g., note.d.ts)
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
git clone https://github.com/t9fiction/Solana-crud-note
cd solana-notes-dapp
```

### 2. Install Dependencies

Run the following command to install required Solana + Anchor dependencies:

```bash
npm install @project-serum/anchor \
            @solana/wallet-adapter-base \
            @solana/wallet-adapter-react \
            @solana/wallet-adapter-react-ui \
            @solana/wallet-adapter-wallets \
            @solana/web3.js
```

Also install:

```bash
npm install sweetalert2 tailwindcss postcss autoprefixer
```

Then initialize Tailwind:

```bash
npx tailwindcss init -p
```

> Or simply run `npm install` if the `package.json` is already set up.

### 3. Set Up Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## 🧪 Running the App

### Start Development Server

```bash
npm run dev
```

Go to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run start
```

---

## 📦 Smart Contract Setup (Anchor)

### 1. Navigate to contract folder

```bash
cd solana/notes_app
```

### 2. Build & Deploy

```bash
anchor build
anchor deploy
```

Update `declare_id!` in `lib.rs` with the new program ID from deployment.

---

## 🔐 Wallet Support

* Phantom
* Solflare
* Backpack
* Ledger (via Wallet Adapter)

---

## 📸 Screenshots

> You can add UI screenshots here showing the connected wallet, note creation form, and the on-chain display.

---

## 📚 Resources

* [Anchor Book](https://book.anchor-lang.com/)
* [Solana Docs](https://docs.solana.com/)
* [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
* [SweetAlert2](https://sweetalert2.github.io/)

---

## 📄 License

MIT License © 2025 Sohail

---

## 🙌 Credits

* Built with ❤️ by Sohail using Anchor, Solana, and modern frontend tooling.

```

---

Let me know if you want to:

- Add **CI/CD instructions** (e.g., with GitHub Actions or Vercel)
- Prepare for **Vercel deployment**
- Include instructions for **custom devnet validator**
- Add `note.d.ts` type in `/types` for reference

Happy BUIDLing 🛠️⚡