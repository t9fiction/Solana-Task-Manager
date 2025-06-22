
type Task = {
    author: PublicKey;       // Solana pubkey
    title: string;           // max 100 chars
    description: string;         // max 1000 chars
    is_completed: boolean;    // boolean
    created_at: number;      // i64 (timestamp)
  };