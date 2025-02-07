import { ApiResponseError } from "@/primitive/api";
import { message } from "@/primitive/components";

export function onError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _error: any,
  isSell = false,
  fallbackMessage = "trade failed"
) {
  const error = _error.error ? _error.error : _error;
  if (error.errorMessage) {
    message(error.errorMessage, { type: "error" });
    return;
  }
  if (error.message?.toLowerCase().includes("user rejected the request")) {
    message("User Rejected", { type: "error" });
  } else if (error instanceof ApiResponseError) {
    message(error.data.msg, { type: "error" });
  } else if (typeof error === "string") {
    message(error, { type: "error" });
  } else {
    const errorMsg = isSell
      ? "Please increase your slippage and try again!"
      : error?.msg ||
        error?.data?.msg ||
        error?.message ||
        error.toString() ||
        fallbackMessage;
    const hasReason = errorMsg?.toLowerCase().includes("reason:");
    const hasContractCall = errorMsg?.toLowerCase().includes("contract call");
    if (hasReason && hasContractCall) {
      message(
        errorMsg.split(".")[0].split("reason:")[1].split("Contract Call")[0],
        { type: "error" }
      );
    } else if (hasReason) {
      message(errorMsg.split(".")[0].split("reason:")[1], { type: "error" });
    } else {
      message(errorMsg.split(".")[0], { type: "error" });
    }
    console.log({ error });
  }
}
