import { Button, FormItem, FormValue } from "@/primitive/components";
import { useRef, useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { TokenInputBuy, TokenValue } from "../token-input";
import { CancelButton } from "../cancel-button";

export function AnalyzeInput({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage, generateMessageId } =
    useChatContext();
  const [form, setForm] = useState<{
    token: FormValue<TokenValue>;
  }>({
    token: {
      value: {
        ca: "",
        ticker: "",
        logo: "",
      },
      required: true,
      isInValid: false,
      errorMsg: "",
    },
  });
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <span className='font-bold text-size-16'>Analyze</span>
        <FormItem label={"Token"} {...form.token}>
          <TokenInputBuy
            className='!bg-background'
            value={form.token.value}
            onChange={(value) => {
              setForm({
                ...form,
                token: {
                  ...form.token,
                  value,
                  isInValid: false,
                },
              });
            }}
          />
        </FormItem>
        <div className='w-full flex justify-end items-center gap-16'>
          <CancelButton
            onClick={() => {
              deleteMessageById(message.id);
            }}
          />
          <Button
            size='s'
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) {
                return;
              }
              let allValid = true;
              const newForm = { ...form };
              if (!form.token.value.ca) {
                allValid = false;
                newForm.token = {
                  ...newForm.token,
                  isInValid: true,
                  errorMsg: "Token address is required",
                };
              }
              if (!allValid) {
                setForm(newForm);
                return;
              }
              addAndSendMessage(
                `Help me analyze this token: $${form.token.value.ticker}(${form.token.value.ca})`
              );
              deleteMessageById(message.id);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </ChatContentContainer>
  );
}
