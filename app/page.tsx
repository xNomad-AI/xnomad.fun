import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Page() {
  const cookieStore = cookies();
  const chain = cookieStore.get("chain")?.value ?? "solana";
  redirect(`/${chain}`);
}
