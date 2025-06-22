"use client";
import React, { useEffect } from "react";
import { AnchorProvider, Program, Idl } from "@project-serum/anchor";
import Swal from "sweetalert2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { IDL, PROGRAM_ID } from "@/constants";

// Define Task interface for TypeScript
interface Task {
  publicKey: PublicKey;
  author: PublicKey;
  title: string;
  description: string;
  isCompleted: boolean;
  created_at: number;
}

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [updateTaskData, setUpdateTaskData] = React.useState<Task | null>(null);
  const [updateDescription, setUpdateDescription] = React.useState("");

  /**
   * Fetches the Anchor program using the provided IDL and PROGRAM_ID.
   * If the wallet is not connected, it prompts the user to connect their wallet.
   * Handles errors gracefully and returns the program instance if successful.
   * @returns {Promise<Program | null>} The Anchor program instance or null if an error occurs.
   */
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

  /**
   * Generates the Program Derived Address (PDA) for a task based on the title.
   * @param title The title of the task.
   * @returns {Promise<PublicKey | null>} The PDA for the task or null if wallet is not connected.
   */
  const getSeeds = async (title: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }
    const [taskAddress] = await PublicKey.findProgramAddressSync(
      [Buffer.from("task"), wallet.publicKey.toBuffer(), Buffer.from(title)],
      PROGRAM_ID
    );
    return taskAddress;
  };

  /**
   * Loads tasks from the blockchain using the Anchor program.
   * Filters tasks by the connected wallet's public key.
   * Displays a loading spinner while fetching tasks and handles errors gracefully.
   */
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
      const _tasks = await program.account.task.all([
        {
          memcmp: {
            offset: 8, // Discriminator offset for Anchor accounts
            bytes: wallet.publicKey ? wallet.publicKey.toBase58() : "",
          },
        },
      ]);
      const formattedTasks: Task[] = _tasks
        .filter((task) => task.account.createdAt !== undefined)
        .map((task) => ({
          publicKey: task.publicKey,
          author: task.account.author,
          title: task.account.title,
          description: task.account.description,
          isCompleted: task.account.isCompleted,
          created_at: task.account.createdAt.toNumber(),
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

  /**
   * Creates a new task on the blockchain using the Anchor program.
   * Validates input and handles errors gracefully.
   * Reloads the tasks list upon successful creation.
   */
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const program = await getProgram();
    if (!program) return;

    if (!wallet.publicKey || !wallet.signTransaction) {
      Swal.fire({
        icon: "error",
        title: "Wallet Not Connected",
        text: "Please connect your wallet to create a task.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "No Title",
        text: "Task title cannot be empty.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "No Description",
        text: "Task description cannot be empty.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (title.length > 100) {
      Swal.fire({
        icon: "warning",
        title: "Title Too Long",
        text: "Task title cannot exceed 100 characters.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (description.length > 1000) {
      Swal.fire({
        icon: "warning",
        title: "Description Too Long",
        text: "Task description cannot exceed 1000 characters.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setIsSubmitting(true);
    Swal.fire({
      title: "Creating Task",
      text: "Please wait while your task is being created...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const taskAddress = await getSeeds(title);
      if (!taskAddress) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to generate task address. Please try again later.",
          confirmButtonColor: "#2563eb",
        });
        setIsSubmitting(false);
        return;
      }

      await program.methods
        .createTask(title, description)
        .accounts({
          author: wallet.publicKey,
          task: taskAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      Swal.fire({
        icon: "success",
        title: "Task Created",
        text: "Your task has been created successfully.",
        confirmButtonColor: "#2563eb",
      });
      setTitle("");
      setDescription("");
      setShowCreateForm(false);
      await loadTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create task. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
    }
    setIsSubmitting(false);
  };

  /**
   * Updates an existing task on the blockchain using the Anchor program.
   * Validates input and handles errors gracefully.
   * Reloads the tasks list upon successful update.
   */
  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const program = await getProgram();
    if (!program) return;

    if (!wallet.publicKey || !wallet.signTransaction) {
      Swal.fire({
        icon: "error",
        title: "Wallet Not Connected",
        text: "Please connect your wallet to update a task.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!updateTaskData) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No task selected for update.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!updateDescription.trim()) {
      Swal.fire({
        icon: "warning",
        title: "No Description",
        text: "Task description cannot be empty.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (updateDescription.length > 1000) {
      Swal.fire({
        icon: "warning",
        title: "Description Too Long",
        text: "Task description cannot exceed 1000 characters.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setIsSubmitting(true);
    Swal.fire({
      title: "Updating Task",
      text: "Please wait while your task is being updated...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const taskAddress = await getSeeds(updateTaskData.title);
      if (!taskAddress) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to generate task address. Please try again later.",
          confirmButtonColor: "#2563eb",
        });
        setIsSubmitting(false);
        return;
      }

      await program.methods
        .updateTask(updateDescription)
        .accounts({
          author: wallet.publicKey,
          task: taskAddress,
        })
        .rpc();

      Swal.fire({
        icon: "success",
        title: "Task Updated",
        text: "Your task has been updated successfully.",
        confirmButtonColor: "#2563eb",
      });
      setShowUpdateModal(false);
      setUpdateTaskData(null);
      setUpdateDescription("");
      await loadTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update task. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
    }
    setIsSubmitting(false);
  };

  /**
   * Marks a task as completed on the blockchain using the Anchor program.
   * Validates input and handles errors gracefully.
   * Reloads the tasks list upon successful completion.
   */
  const markTaskAsCompleted = async (task: Task) => {
    console.log("Marking task as completed:", task);
    if (task.isCompleted) {
      Swal.fire({
        icon: "warning",
        title: "Task Already Completed",
        text: "This task is already marked as completed.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const program = await getProgram();
    if (!program) return;

    if (!wallet.publicKey || !wallet.signTransaction) {
      Swal.fire({
        icon: "error",
        title: "Wallet Not Connected",
        text: "Please connect your wallet to mark a task as completed.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Mark as Completed",
      text: `Are you sure you want to mark "${task.title}" as completed?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    Swal.fire({
      title: "Marking Task as Completed",
      text: "Please wait while we update your task...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const taskAddress = await getSeeds(task.title);
      if (!taskAddress) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to generate task address. Please try again later.",
          confirmButtonColor: "#2563eb",
        });
        setIsSubmitting(false);
        return;
      }

      await program.methods
        .completeTask()
        .accounts({
          author: wallet.publicKey,
          task: taskAddress,
        })
        .rpc();

      Swal.fire({
        icon: "success",
        title: "Task Marked as Completed",
        text: `Task "${task.title}" has been marked as completed.`,
        confirmButtonColor: "#2563eb",
      });
      await loadTasks();
    } catch (error) {
      console.error("Error marking task as completed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark task as completed. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
    }
    setIsSubmitting(false);
  };

  /**
   * Deletes a task from the blockchain using the Anchor program.
   * Validates input and handles errors gracefully.
   * Reloads the tasks list upon successful deletion.
   */
  const deleteTask = async (task: Task) => {
    console.log("Deleting task:", task);
    const program = await getProgram();
    if (!program) return;

    if (!wallet.publicKey || !wallet.signTransaction) {
      Swal.fire({
        icon: "error",
        title: "Wallet Not Connected",
        text: "Please connect your wallet to delete a task.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Delete Task",
      text: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    Swal.fire({
      title: "Deleting Task",
      text: "Please wait while we delete your task...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const taskAddress = await getSeeds(task.title);
      if (!taskAddress) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to generate task address. Please try again later.",
          confirmButtonColor: "#2563eb",
        });
        setIsSubmitting(false);
        return;
      }

      await program.methods
        .deleteTask()
        .accounts({
          author: wallet.publicKey,
          task: taskAddress,
        })
        .rpc();

      Swal.fire({
        icon: "success",
        title: "Task Deleted",
        text: `Task "${task.title}" has been deleted successfully.`,
        confirmButtonColor: "#2563eb",
      });
      setShowUpdateModal(false);
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete task. Please try again later.",
        confirmButtonColor: "#2563eb",
      });
    }
    setIsSubmitting(false);
  };

  /**
   * Opens the update modal with the selected task's data.
   */
  const openUpdateModal = (task: Task) => {
    setUpdateTaskData(task);
    setUpdateDescription(task.description);
    setShowUpdateModal(true);
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
            Manage your tasks securely on the Solana blockchain
          </p>
        </header>

        {/* Wallet Connection Status */}
        {!wallet.connected && (
          <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-sm text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to view, create, or manage tasks.
            </p>
          </div>
        )}

        {/* Tasks Section */}
        {wallet.connected && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Tasks</h2>
              <div className="flex gap-3">
                <button
                  onClick={loadTasks}
                  disabled={loading || isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? "Loading..." : "Refresh Tasks"}
                </button>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  disabled={loading || isSubmitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {showCreateForm ? "Close Form" : "Create Task"}
                </button>
              </div>
            </div>

            {/* Create Task Form */}
            {showCreateForm && (
              <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
                <form onSubmit={createTask} className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title (max 100 chars)"
                      maxLength={100}
                      className="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {title.length}/100 characters
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter task description (max 1000 chars)"
                      maxLength={1000}
                      rows={5}
                      className="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-y transition-all duration-200"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {description.length}/1000 characters
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? "Creating..." : "Create Task"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitle("");
                        setDescription("");
                        setShowCreateForm(false);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Task Modal */}
            {/* Update Task Modal */}
            {showUpdateModal && updateTaskData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg pt-10 pb-6 px-6 w-full max-w-md shadow-lg">
                  {/* Delete Button (X) in top right corner */}
                  
                  
                  <h3 className="text-xl font-semibold mb-4">Update Task: {updateTaskData.title}</h3>
                  <form onSubmit={updateTask} className="space-y-4">
                    <div>
                      <label
                        htmlFor="updateDescription"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="updateDescription"
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        placeholder="Enter task description (max 1000 chars)"
                        maxLength={1000}
                        rows={5}
                        className="mt-1 w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-y transition-all duration-200"
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {updateDescription.length}/1000 characters
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !updateDescription.trim()}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isSubmitting ? "Updating..." : "Update Task"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUpdateModal(false);
                          setUpdateTaskData(null);
                          setUpdateDescription("");
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
            {/* Tasks List */}
            {!loading && tasks.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <div
                    key={task.publicKey.toBase58()}
                    className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Delete Button (X) in top right corner of each task card */}
                    <button
                      onClick={() => deleteTask(task)}
                      disabled={loading || isSubmitting}
                      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-white hover:text-red-500  disabled:text-gray-400 disabled:dark:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 group z-10"
                      title="Delete Task"
                    >
                      <svg 
                        className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <h3 className="text-xl font-semibold mb-3 line-clamp-1 pr-8">
                      {task.title}
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-3">
                      {task.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>
                        Author: {task.author.toBase58().slice(0, 8)}...
                      </p>
                      <p>Completed: {task.isCompleted ? "Yes" : "No"}</p>
                      <p>
                        Created: {new Date(task.created_at * 1000).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => openUpdateModal(task)}
                        disabled={loading || isSubmitting || task.isCompleted}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => markTaskAsCompleted(task)}
                        disabled={loading || isSubmitting || task.isCompleted}
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {task.isCompleted ? "Completed" : "Mark as Completed"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Built with Solana and Anchor
        </footer>
      </div>
    </div>
  );
}