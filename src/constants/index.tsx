import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "8rwZJ58gyv2yY2eUanMYVWohBBLeSAguNDo736k2nDJf"
);

export const IDL = {
  version: "0.1.0",
  name: "task_manager",
  instructions: [
    {
      name: "createTask",
      accounts: [
        { name: "author", isMut: true, isSigner: true },
        { name: "task", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
      ],
    },
    {
      name: "updateTask",
      accounts: [
        { name: "author", isMut: true, isSigner: true },
        { name: "task", isMut: true, isSigner: false },
      ],
      args: [{ name: "description", type: "string" }],
    },
    {
      name: "completeTask",
      accounts: [
        { name: "author", isMut: true, isSigner: true },
        { name: "task", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "deleteTask",
      accounts: [
        { name: "author", isMut: true, isSigner: true },
        { name: "task", isMut: true, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Task",
      type: {
        kind: "struct",
        fields: [
          { name: "author", type: "publicKey" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "isCompleted", type: "bool" },
          { name: "createdAt", type: "i64" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "TitleTooLong",
      msg: "Title can't be more then 100 chars",
    },
    {
      code: 6001,
      name: "DescriptionTooLong",
      msg: "Description can't be more then 1000 chars",
    },
    { code: 6002, name: "TitleIsEmpty", msg: "Title is empty" },
    { code: 6003, name: "DescriptionIsEmpty", msg: "Description is empty" },
    { code: 6004, name: "Unauthorized", msg: "Unauthorized" },
    { code: 6005, name: "TitleNotFound", msg: "Title not found" },
  ],
};
