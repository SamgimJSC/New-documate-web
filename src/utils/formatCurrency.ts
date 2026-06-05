export const formatKRW = (amount: number): string => {
  return amount.toLocaleString("ko-KR") + "원";
};

export const formatJPY = (amount: number): string => {
  return "¥" + amount.toLocaleString("ja-JP");
};
