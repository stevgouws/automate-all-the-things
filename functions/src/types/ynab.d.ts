import * as ynab from "ynab";
import { BUDGET_IDS, ACCOUNT_IDS, CATEGORY_IDS } from "../constants";

declare global {
  type BudgetId = (typeof BUDGET_IDS)[keyof typeof BUDGET_IDS];
  type BudgetName = keyof typeof BUDGET_IDS;
  type AccountId = (typeof ACCOUNT_IDS)[keyof typeof ACCOUNT_IDS];
  type AccountName = keyof typeof ACCOUNT_IDS;
  type CategoryId = (typeof CATEGORY_IDS)[keyof typeof CATEGORY_IDS];
  type CategoryName = keyof typeof CATEGORY_IDS;
  type TransactionDetailWithFixedAccountId = ynab.TransactionDetail & {
    account_id: AccountId;
  };
}
