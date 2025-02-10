import BigNumber from "bignumber.js";

export function dealSmallNumber(_number: number | string) {
  const number = BigNumber(_number);
  if (number.lt(1) && number.gt(0)) {
    const exponential = number.toString().split("e");
    if (exponential.length > 1) {
      const decimal = Math.abs(parseInt(exponential[1]));
      const nonZeroString = (parseFloat(exponential[0]) * 100).toFixed(0);
      return { decimal, nonZeroString };
    } else {
      const decimalArray = number.toString().split(".")[1].split("");
      let decimal = 0;
      let nonZeroDecimalArray: string[] = [];
      for (const num of decimalArray) {
        if (num === "0") {
          decimal++;
        } else {
          nonZeroDecimalArray = decimalArray.slice(decimal);
          break;
        }
      }
      const nonZeroString = nonZeroDecimalArray.join("").slice(0, 4);
      return { decimal: decimal + 1, nonZeroString };
    }
  }
  return { decimal: 0, nonZeroString: "" };
}
