import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("problems").collect();
  },
});

export const getById = query({
  args: { problemId: v.id("problems") },
  handler: async (ctx, { problemId }) => {
    return await ctx.db.get(problemId);
  },
});

const twoSumStarter = [
  "function twoSum(nums, target) {",
  "  // your code here",
  "}",
  "",
  "console.log(twoSum([2, 7, 11, 15], 9)); // test call — edit or add your own",
].join(String.fromCharCode(10));

const reverseStringStarter = [
  "function reverseString(s) {",
  "  // your code here",
  "}",
  "",
  'console.log(reverseString(["h","e","l","l","o"])); // test call — edit or add your own',
].join(String.fromCharCode(10));

const isValidStarter = [
  "function isValid(s) {",
  "  // your code here",
  "}",
  "",
  'console.log(isValid("()[]{}")); // test call — edit or add your own',
].join(String.fromCharCode(10));

const fizzBuzzStarter = [
  "function fizzBuzz(n) {",
  "  // your code here",
  "}",
  "",
  "console.log(fizzBuzz(5)); // test call — edit or add your own",
].join(String.fromCharCode(10));

const isPalindromeStarter = [
  "function isPalindrome(s) {",
  "  // your code here",
  "}",
  "",
  'console.log(isPalindrome("A man, a plan, a canal: Panama")); // test call — edit or add your own',
].join(String.fromCharCode(10));

const PROBLEMS = [
  {
    title: "Two Sum",
    difficulty: "EASY" as const,
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    exampleInput: "nums = [2,7,11,15], target = 9",
    exampleOutput: "[0,1]",
    starterCode: twoSumStarter,
  },
  {
    title: "Reverse String",
    difficulty: "EASY" as const,
    description:
      "Write a function that reverses a string. The input string is given as an array of characters.",
    exampleInput: '["h","e","l","l","o"]',
    exampleOutput: '["o","l","l","e","h"]',
    starterCode: reverseStringStarter,
  },
  {
    title: "Valid Parentheses",
    difficulty: "EASY" as const,
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid (every open bracket is closed by the same type, in the correct order).",
    exampleInput: 's = "()[]{}"',
    exampleOutput: "true",
    starterCode: isValidStarter,
  },
  {
    title: "FizzBuzz",
    difficulty: "EASY" as const,
    description:
      "Given an integer n, return a string array where for each i from 1 to n: if i is divisible by 3 and 5 print 'FizzBuzz', by 3 print 'Fizz', by 5 print 'Buzz', otherwise the number itself.",
    exampleInput: "n = 5",
    exampleOutput: '["1","2","Fizz","4","Buzz"]',
    starterCode: fizzBuzzStarter,
  },
  {
    title: "Palindrome Check",
    difficulty: "MEDIUM" as const,
    description:
      "Given a string s, return true if it is a palindrome considering only alphanumeric characters and ignoring case, false otherwise.",
    exampleInput: 's = "A man, a plan, a canal: Panama"',
    exampleOutput: "true",
    starterCode: isPalindromeStarter,
  },
];

// Run this once from the Convex dashboard (Functions tab) to populate
// sample problems. Safe to re-run — it skips seeding if problems already exist.
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("problems").collect();
    if (existing.length > 0) {
      return `Already seeded (${existing.length} problems exist). Skipped.`;
    }
    for (const p of PROBLEMS) {
      await ctx.db.insert("problems", p);
    }
    return `Seeded ${PROBLEMS.length} problems.`;
  },
});

// Clears all existing problems and re-inserts fresh ones — use this when
// starter code templates change (like adding test calls).
export const reseed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("problems").collect();
    for (const p of existing) {
      await ctx.db.delete(p._id);
    }
    for (const p of PROBLEMS) {
      await ctx.db.insert("problems", p);
    }
    return `Reseeded ${PROBLEMS.length} problems.`;
  },
});
