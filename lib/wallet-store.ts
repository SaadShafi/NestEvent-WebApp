"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AVATARS } from "./data";
import { uid } from "./utils";

/* ------------------------------------------------------------------ */
/* Types (mirrors the mobile app's BankAccount / Transaction / PaymentMethod) */
/* ------------------------------------------------------------------ */

export interface BankAccount {
  id: string;
  holder: string;
  number: string;
  bankName?: string;
  routing?: string;
  /** "Checking" / "Savings" (Settings → Bank Accounts form). */
  accountType?: string;
  isDefault: boolean;
}

export type TransactionStatus = "completed" | "pending";

export interface WalletTransaction {
  id: string;
  name: string;
  avatar: string;
  role: string;
  /** Signed: positive = money in, negative = money out. */
  amount: number;
  at: string;
  status: TransactionStatus;
}

export type CardBrand = "mastercard" | "visa" | "paypal" | "stripe" | "applepay" | "googlepay";

export interface PaymentCard {
  id: string;
  brand: CardBrand;
  label: string;
  last4?: string;
  fee?: string;
}

/* ------------------------------------------------------------------ */
/* Seed data (from the mobile mock: BANK_ACCOUNTS, TRANSACTIONS, PAYMENT_METHODS) */
/* ------------------------------------------------------------------ */

const SEED_BALANCE = 24554.96;

const SEED_BANKS: BankAccount[] = [
  { id: "ba1", holder: "Martin Press", number: "MW05015154889189199110", bankName: "Chase Bank", routing: "CHASUS33", isDefault: true },
];

const SEED_CARDS: PaymentCard[] = [
  { id: "pm_card", brand: "mastercard", label: "Debit/Credit Card", last4: "1121" },
  { id: "pm_paypal", brand: "paypal", label: "PayPal", fee: "No Fee" },
  { id: "pm_stripe", brand: "stripe", label: "Stripe", fee: "No Fee" },
  { id: "pm_apple", brand: "applepay", label: "Apple Pay", fee: "No Fee" },
  { id: "pm_google", brand: "googlepay", label: "Google Pay", fee: "No Fee" },
  { id: "pm_mc", brand: "mastercard", label: "Mastercard", fee: "Charge %10" },
];

/** ISO timestamp `daysAgo` days back at hour:minute (local time). */
const at = (daysAgo: number, hour: number, minute: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const tx = (
  id: string,
  name: string,
  img: number,
  role: string,
  amount: number,
  status: TransactionStatus,
  when: string,
): WalletTransaction => ({ id, name, avatar: AVATARS[img % AVATARS.length], role, amount, at: when, status });

const seedTransactions = (): WalletTransaction[] => [
  tx("t1", "Alfredo Kenter", 0, "Promoter", 5125, "completed", at(0, 1, 24)),
  tx("t2", "Anika Vaccaro", 1, "Manager", -5125, "completed", at(0, 1, 20)),
  tx("t3", "Chance Dokidis", 2, "Manager", 5125, "completed", at(0, 1, 12)),
  tx("t4", "Jordyn Bator", 3, "Promoter", -5125, "completed", at(0, 0, 58)),
  tx("t5", "Wilson Korsgaard", 4, "Promoter", -5125, "completed", at(0, 0, 41)),
  tx("t6", "Cheyenne Bergson", 0, "Promoter", 5125, "completed", at(1, 21, 10)),
  tx("t7", "Alfredo Kenter", 1, "Manager", 5125, "completed", at(1, 18, 5)),
  tx("t8", "Anika Vaccaro", 2, "Manager", -5125, "completed", at(2, 14, 30)),
  tx("t9", "Chance Dokidis", 3, "Rental", 5125, "completed", at(3, 9, 15)),
  tx("t10", "Alfredo Kenter", 4, "Promoter", 5125, "pending", at(0, 1, 24)),
  tx("t11", "Anika Vaccaro", 0, "Manager", -5125, "pending", at(0, 1, 5)),
  tx("t12", "Jordyn Bator", 1, "Promoter", -5125, "pending", at(1, 22, 40)),
];

/* ------------------------------------------------------------------ */
/* Store */
/* ------------------------------------------------------------------ */

export interface WalletState {
  hydrated: boolean;
  balance: number;
  bankAccounts: BankAccount[];
  cards: PaymentCard[];
  transactions: WalletTransaction[];

  setHydrated: () => void;
  addBankAccount: (a: Omit<BankAccount, "id" | "isDefault">, isDefault?: boolean) => BankAccount;
  removeBankAccount: (id: string) => void;
  setDefaultBank: (id: string) => void;
  /** Deducts from the balance immediately and records a pending bank transfer. */
  withdraw: (amount: number, bankId: string) => void;
  /** Credits the balance and records a completed deposit. */
  deposit: (amount: number, cardId: string) => void;
  reset: () => void;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const initial = () => ({
  balance: SEED_BALANCE,
  bankAccounts: SEED_BANKS,
  cards: SEED_CARDS,
  transactions: seedTransactions(),
});

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initial(),

      setHydrated: () => set({ hydrated: true }),

      addBankAccount: (a, isDefault) => {
        const makeDefault = isDefault ?? get().bankAccounts.length === 0;
        const account: BankAccount = { ...a, id: uid("ba"), isDefault: makeDefault };
        set((s) => ({
          bankAccounts: [...s.bankAccounts.map((b) => (makeDefault ? { ...b, isDefault: false } : b)), account],
        }));
        return account;
      },

      removeBankAccount: (id) =>
        set((s) => {
          const rest = s.bankAccounts.filter((b) => b.id !== id);
          if (rest.length && !rest.some((b) => b.isDefault)) rest[0] = { ...rest[0], isDefault: true };
          return { bankAccounts: rest };
        }),

      setDefaultBank: (id) => set((s) => ({ bankAccounts: s.bankAccounts.map((b) => ({ ...b, isDefault: b.id === id })) })),

      withdraw: (amount, bankId) =>
        set((s) => {
          const bank = s.bankAccounts.find((b) => b.id === bankId);
          const value = round2(amount);
          return {
            balance: round2(s.balance - value),
            transactions: [
              {
                id: uid("t"),
                name: "Withdrawal",
                avatar: "",
                role: bank ? `Bank transfer · ${maskAccount(bank.number)}` : "Bank transfer",
                amount: -value,
                at: new Date().toISOString(),
                status: "pending",
              },
              ...s.transactions,
            ],
          };
        }),

      deposit: (amount, cardId) =>
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          const value = round2(amount);
          return {
            balance: round2(s.balance + value),
            transactions: [
              {
                id: uid("t"),
                name: "Deposit",
                avatar: "",
                role: card ? `Wallet · ${card.label}` : "Wallet",
                amount: value,
                at: new Date().toISOString(),
                status: "completed",
              },
              ...s.transactions,
            ],
          };
        }),

      reset: () => set(initial()),
    }),
    {
      name: "nest-wallet",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        balance: s.balance,
        bankAccounts: s.bankAccounts,
        cards: s.cards,
        transactions: s.transactions,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/* Helpers (ported from features/organizer/wallet/utils.ts + organizer/utils.ts) */
/* ------------------------------------------------------------------ */

/** "**** 9110": last 4 characters of an account number / IBAN. */
export function maskAccount(number: string) {
  const clean = number.replace(/\s+/g, "");
  return `**** ${clean.slice(-4)}`;
}

/** Keep only digits and a single decimal point with at most 2 decimals ("12.345" → "12.34"). */
export function sanitizeAmount(v: string) {
  const cleaned = v.replace(/[^0-9.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

/** Parse a "$150" / "150.50" style money input into a number (0 when invalid). */
export function parseMoney(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** "+$5,125" / "-$5,125.50" */
export function signedAmount(amount: number) {
  const abs = Math.abs(amount);
  const txt = abs.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(abs) ? 0 : 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? "-" : "+"}$${txt}`;
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Today - 1:24 AM" / "Aug 29, 2026 - 9:10 PM" */
export function transactionTime(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = sameDay(d, new Date()) ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${day} - ${time}`;
}
