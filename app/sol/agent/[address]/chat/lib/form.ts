import { FormValue } from "@/primitive/components";

export function checkForm<T extends Record<string, FormValue<unknown>>>(
  form: T
) {
  if (Object.values(form).some((item) => item.isInValid)) {
    return {
      allValid: false,
      newForm: form,
    };
  }
  let allValid = true;
  const newForm = { ...form };
  for (const _key of Object.keys(newForm)) {
    const key = _key as keyof typeof newForm;
    if (newForm[key].required) {
      if (
        !newForm[key].value ||
        (typeof newForm[key].value === "object" &&
          Object.values(newForm[key].value).some((item) => !item))
      ) {
        const newItem = {
          ...newForm[key],
        };
        allValid = false;
        newItem.isInValid = true;
        newItem.errorMsg = "Required";
        newForm[key] = newItem;
        break;
      }
    }
  }
  return {
    allValid,
    newForm,
  };
}
