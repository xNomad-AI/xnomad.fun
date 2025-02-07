import BigNumber from "bignumber.js";

export function noExponents(_value: BigNumber | number | string | undefined) {
  const value = BigNumber(_value ?? "");
  const data = String(value).split(/[eE]/);
  if (data.length == 1) return data[0];

  let z = "";
  const sign = value.lt(0) ? "-" : "";
  const str = data[0].replace(".", "");
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
}

export function toIntl(value: BigNumber, dp = 2, decimal = 4) {
  if (value?.isNaN() || !value) {
    return "--";
  }

  let result = "";
  if (value.isZero()) {
    result = `${value.toFormat(dp)}`;
  } else if (value.gt(BigNumber(1e8))) {
    result = `${value.div(BigNumber(1e9)).toFormat(dp)}B`;
  } else if (value.gt(BigNumber(1e6))) {
    result = `${value.div(BigNumber(1e6)).toFormat(dp)}M`;
  } else if (value.gt(BigNumber(1e3))) {
    result = `${value.div(BigNumber(1e3)).toFormat(dp)}K`;
  } else if (value.gt(1)) {
    result = value.toFormat(dp);
  } else if (value.gt(0.0001)) {
    result = value.toFormat(decimal);
  } else if (value.gt(0)) {
    result = "<0.0001";
  } else {
    result = `${value.toFixed(dp)}`;
  }
  return result;
}
