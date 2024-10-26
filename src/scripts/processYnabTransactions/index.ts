// import { isWeekend, isAfter } from "date-fns";

// import { groupBy } from "lodash";
import { ACCOUNT_IDS, CATEGORY_IDS } from "../../constants/index.js";
import { YnabService } from "../../services/YnabService.js";
import * as ynab from "ynab";
import { isWeekend } from "date-fns";
// import { processTransport } from "./processors/index.js";
import { logger } from "../../services/LoggerService";

export async function processYnabTransactions({
  apiKey = process.env.YNAB_API_KEY,
}: {
  apiKey?: string | undefined;
} = {}) {
  if (!apiKey) throw new Error("No API key provided");
  const ynabService = new YnabService(new ynab.API(apiKey), "GBP", logger);
  ynabService.isDryRun = false;

  logger.info(`Processing YNAB transactions: isDryRun:${ynabService.isDryRun}`);
  // const unapprovedTransactions = await ynabService.getUnapprovedTransactions();
  // const categoryGroups = await ynabService.getCategoryGroups();
  // const flattened = categoryGroups.flatMap((group) => group.categories);
  // // const short = flattened.filter((category) => {
  // //   return category.goal_target < category.goal_under_funded;
  // // });
  // const accounts = await ynabService.getAccounts();

  // const grouped = groupBy(categoryGroups, "name");

  // const transactions = await ynabService.getTransactions();

  const matchedTransactions = await ynabService.getMatchedTransactions();
  if (matchedTransactions.length > 0) {
    await ynabService.approveTransactions(matchedTransactions);
  }

  const unapprovedTransactions = await ynabService.getUnapprovedTransactions();

  const groceriesTransactions = unapprovedTransactions.filter(
    (transaction) => transaction.category_id === CATEGORY_IDS.GROCERIES
  );
  if (groceriesTransactions.length > 0) {
    await ynabService.approveTransactions(groceriesTransactions);
  }

  const tflTransactions = unapprovedTransactions.filter(
    (transaction) => transaction.payee_name === "Transport For London"
  );
  const processedTflTransactions = processTransport(tflTransactions);
  await ynabService.updateTransactions(processedTflTransactions);
  logger.info(`✅ Done processing YNAB transactions`);
}

// SG_TODO Write tests
// SG_TODO Sort out logger, to csv? To firebase? To google sheet?

// SG_TODO Auto assign Underfunded. Filter out all Priority Goals parent category
// and for categories where the underfunded is more than the goal, only assign budgeted to the goal amount.

export function processTransport(
  transactions: ynab.TransactionDetail[]
): ynab.TransactionDetail[] {
  // SG_TODO maybe add filter in here for tfl?
  return transactions.map((transaction) => {
    return {
      ...transaction,
      approved: true,
      flag_color: "blue",
      category_id: getCategory(
        transaction.account_id,
        transaction.amount,
        transaction.date
      ),
    };
  });

  function getCategory(accountId: string, amount: number, date: string) {
    if (accountId === ACCOUNT_IDS.AMEX) return CATEGORY_IDS.TRANSPORT_LUCIA;
    if (accountId !== ACCOUNT_IDS.CURRENT && accountId !== ACCOUNT_IDS.CHASE) {
      throw new Error("Unexpected account for TFL");
    }
    if (isWeekend(new Date(date))) return CATEGORY_IDS.TRANSPORT_STEVEN;
    if (Math.abs(amount) > 2_500) return CATEGORY_IDS.MOBILITY_STEVEN;
    return CATEGORY_IDS.TRANSPORT_ZOE;
  }
}
