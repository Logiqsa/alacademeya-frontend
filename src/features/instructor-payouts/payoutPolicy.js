export const withdrawableBalances = (balances = []) =>
  balances.filter((balance) => Number(balance?.available) > 0);

export const canRequestWithdrawal = ({
  balances = [],
  suspended = false,
  loading = false,
} = {}) =>
  !suspended && !loading && withdrawableBalances(balances).length > 0;
