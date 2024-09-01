import * as ynab from "ynab";
import { BUDGET_IDS } from "../constants";

type Status = "Updated" | "Reconciled";

export class YnabService {
  ynabAPI: ynab.api;
  budgetId: BudgetId;
  isDryRun: boolean;
  logger: {
    log: (...data: any[]) => void;
  };

  constructor(
    ynabAPI: ynab.api,
    budgetName: BudgetName,
    logger: {
      log: (...data: any[]) => void;
    }
  ) {
    this.ynabAPI = ynabAPI;
    this.budgetId = BUDGET_IDS[budgetName];
    this.isDryRun = false;
    this.logger = logger;
  }

  async getBudgets() {
    const response = await this.ynabAPI.budgets.getBudgets();
    return response.data.budgets;
  }

  async getAccounts() {
    const response = await this.ynabAPI.accounts.getAccounts(this.budgetId);
    return response.data.accounts;
  }

  async getTransactions() {
    const response = await this.ynabAPI.transactions.getTransactions(
      this.budgetId
    );
    return response.data.transactions;
  }

  async getTransactionsByAccount(accountId: AccountId) {
    const response = await this.ynabAPI.transactions.getTransactionsByAccount(
      this.budgetId,
      accountId
    );
    return response.data.transactions;
  }

  async getTransactionsByCategory(categoryId: CategoryId) {
    const response = await this.ynabAPI.transactions.getTransactionsByCategory(
      this.budgetId,
      categoryId
    );
    return response.data.transactions;
  }

  async getTransactionsByFlagColor(color: ynab.TransactionFlagColor) {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(
      (transaction) => transaction.flag_color === color
    );
  }

  async getCategories() {
    const response = await this.ynabAPI.categories.getCategories(this.budgetId);
    return response;
  }

  async getCategoryGroups() {
    const response = await this.ynabAPI.categories.getCategories(this.budgetId);
    return response.data.category_groups;
  }

  async updateMonthCategory({
    month = "current",
    categoryId,
    category,
  }: {
    month: string;
    categoryId: CategoryId;
    category: ynab.Category;
  }) {
    if (!this.isDryRun) {
      await this.ynabAPI.categories.updateMonthCategory(
        this.budgetId,
        month,
        categoryId,
        { category }
      );
    }
    this.logger.log(
      `✅ Updated ${category.name} to ${pounds(category.budgeted)}`
    );
  }

  // async createTransactions(transactions) {
  //   const response = await this.ynabAPI.transactions.createTransactions(
  //     this.budgetId,
  //     { transactions }
  //   );
  //   return response.data.transactions;
  // }

  // async createTransaction(transaction) {
  //   const response = await this.ynabAPI.transactions.createTransaction(
  //     this.budgetId,
  //     { transaction }
  //   );
  //   this.print("Created", response.data.transaction);
  //   return response.data.transaction;
  // }

  async getUnapprovedTransactions() {
    const response = await this.ynabAPI.transactions.getTransactionsByType(
      this.budgetId,
      "unapproved"
    );
    return response.data.transactions;
  }

  async getUnReconciledTransactions() {
    const allTransactions = await this.getTransactions();
    return allTransactions.filter(
      (transaction) => transaction.cleared !== "reconciled"
    );
  }

  async getMatchedTransactions() {
    const unapprovedTransactions = await this.getUnapprovedTransactions();
    return unapprovedTransactions.filter(
      (transaction) => transaction.matched_transaction_id
    );
  }

  async updateTransactions(transactions: ynab.TransactionDetail[]) {
    if (!transactions.length) return;
    if (this.isDryRun) {
      transactions.forEach((transaction) => this.print("Updated", transaction));
    } else {
      const result = await this.ynabAPI.transactions.updateTransactions(
        this.budgetId,
        { transactions }
      );
      if (!result.data.transactions) {
        this.logger.log("No result");
        return;
      }
      result.data.transactions.forEach((transaction) =>
        this.print("Updated", transaction)
      );
    }
  }

  async approveTransactions(transactions: ynab.TransactionDetail[]) {
    if (!transactions.length) return;
    const update: ynab.TransactionDetail[] = transactions.map((transaction) => {
      return {
        ...transaction,
        flag_color: "blue",
        approved: true,
      };
    });
    if (!this.isDryRun) {
      await this.ynabAPI.transactions.updateTransactions(this.budgetId, {
        transactions: update,
      });
    }
    transactions.forEach(
      ({ id, account_name, amount, category_name, date, memo, payee_name }) => {
        // SG_TODO subtransactions?
        // SG_TODO flag all processed transactions?
        this.logger.log(
          `${this.isDryRun ? "Dry-run: " : ""}Approved: ${date} ${pounds(
            amount
          )}, ${account_name}, ${category_name}, ${payee_name}, ${memo}, ${id}`
        );
      }
    );
  }

  async reconcileTransaction(transaction: ynab.TransactionDetail) {
    const update: ynab.TransactionDetail = {
      ...transaction,
      flag_color: "blue",
      approved: true,
      cleared: "reconciled",
    };
    if (!this.isDryRun) {
      await this.ynabAPI.transactions.updateTransactions(this.budgetId, {
        transactions: [update],
      });
    }
    this.print("Reconciled", transaction);
  }

  async deleteTransactions(transactions: ynab.TransactionDetail[]) {
    const update: ynab.TransactionDetail[] = transactions.map((transaction) => {
      return {
        ...transaction,
        flag_color: "red",
        deleted: true,
      };
    });
    await this.ynabAPI.transactions.updateTransactions(this.budgetId, {
      transactions: update,
    });
    transactions.forEach(
      ({ account_name, amount, category_name, date, memo, payee_name }) => {
        // SG_TODO subtransactions?
        // SG_TODO flag all processed transactions?
        this.logger.log(
          `Deleted: ${date} £${ynab.utils.convertMilliUnitsToCurrencyAmount(
            amount
          )}, ${account_name}, ${category_name}, ${payee_name}, ${memo}`
        );
      }
    );
  }

  print(
    status: Status,
    {
      date,
      amount,
      account_name,
      category_name,
      payee_name,
      memo,
      id,
    }: ynab.TransactionDetail
  ) {
    this.logger.log(
      `${this.isDryRun ? "Dry-run: " : ""}${status}: ${date} ${pounds(
        amount
      )}, ${account_name}, ${category_name}, ${payee_name}, ${memo}, ${id}`
    );
  }

  async getBudgetMonths() {
    return this.ynabAPI.months.getBudgetMonths(this.budgetId);
  }

  async getBudgetMonth(month: string) {
    const res = await this.ynabAPI.months.getBudgetMonth(this.budgetId, month);
    return res.data.month;
  }

  async getMonthCategoryById(month: string, categoryId: CategoryId) {
    return this.ynabAPI.categories.getMonthCategoryById(
      this.budgetId,
      month,
      categoryId
    );
  }
}

export function pounds(amount: number) {
  const string = `${ynab.utils
    .convertMilliUnitsToCurrencyAmount(amount)
    .toFixed(2)}`;
  if (string.includes("-")) return string.replace("-", "-£");
  return `£${string}`;
}
