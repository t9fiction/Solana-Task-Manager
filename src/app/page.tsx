"use client";
import React, { useEffect } from "react";
import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import Swal from "sweetalert2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { IDL, PROGRAM_ID } from "@/constants";

// Define Task interface for TypeScript
interface Task {
  publicKey: PublicKey;
  author: PublicKey;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: number;
}

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);

  const getProgram = async () => {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        Swal.fire({
          icon: "error",
          title: "Wallet Not Connected",
          text: "Please connect your wallet to use this app.",
          confirmButtonColor: "#2563eb",
        });
        return null;
      }
      const provider = new AnchorProvider(
        connection,
        wallet as unknown as AnchorProvider["wallet"],
        AnchorProvider.defaultOptions()
      );
      const _program = new Program(IDL as Idl, PROGRAM_ID, provider);
      console.log("Program loaded:", _program);
      return _program;
    } catch (error) {
      console.error("Error fetching program:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch the program. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
      return null;
    }
  };

  const loadTasks = async () => {
    const program = await getProgram();
    if (!program) return;

    setLoading(true);
    Swal.fire({
      title: "Loading Tasks",
      text: "Please wait while we fetch your tasks...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setTasks([]);
    try {
      const _tasks = await program.account.task.all();
      const formattedTasks: Task[] = _tasks.map((task) => ({
        publicKey: task.publicKey,
        author: task.account.author,
        title: task.account.title,
        description: task.account.description,
        is_completed: task.account.is_completed,
        created_at: task.account.created_at,
      }));
      setTasks(formattedTasks);
      Swal.close();
    } catch (error) {
      console.error("Error loading tasks:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load tasks. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
    }
    setLoading(false);
  };


  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [wallet.connected, wallet.publicKey?.toBase58()]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Solana Task Manager
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            View your tasks stored securely on the Solana blockchain
          </p>
        </header>

        {/* Wallet Connection Status */}
        {!wallet.connected && (
          <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-sm text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to view your tasks.
            </p>
          </div>
        )}

        {/* Tasks Section */}
        {wallet.connected && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Tasks</h2>
              <button
                onClick={loadTasks}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Loading..." : "Refresh Tasks"}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading tasks...
                </p>
              </div>
            )}

            {/* No Tasks Found */}
            {!loading && tasks.length === 0 && (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <p>No tasks found. Create a task to get started!</p>
              </div>
            )}

            {/* Tasks List */}
            {!loading && tasks.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <div
                    key={task.publicKey.toBase58()}
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="text-xl font-semibold mb-3 line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-3">
                      {task.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>
                        Author: {task.author.toBase58().slice(0, 8)}...
                      </p>
                      <p>Completed: {task.is_completed ? "Yes" : "No"}</p>
                      <p>
                        Created: {new Date(task.created_at * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Built with Solana and Anchor
        </footer>
      </div>
    </div>
  );
}