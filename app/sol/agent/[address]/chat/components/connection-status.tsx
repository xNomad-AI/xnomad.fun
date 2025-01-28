import clsx from "clsx";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity } from "lucide-react";
import { apiClient } from "../lib/api";
import { Tooltip } from "@/primitive/components";

export default function ConnectionStatus() {
  const [queryTime, setQueryTime] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const start = performance.now();
      const data = await apiClient.getAgents();
      const end = performance.now();
      setQueryTime(end - start);
      return data;
    },
    refetchInterval: 5_000,
    retry: 1,
    refetchOnWindowFocus: "always",
  });

  const connected = query?.isSuccess && !query?.isError;
  const isLoading = query?.isRefetching || query?.isPending;

  return (
    <SidebarMenuItem>
      <Tooltip
        content={
          connected ? (
            <div className='flex items-center gap-1'>
              <Activity className='size-4' />
              <span>{queryTime?.toFixed(2)} ms</span>
            </div>
          ) : null
        }
      >
        <SidebarMenuButton>
          <div className='flex flex-col gap-1 select-none transition-all duration-200'>
            <div className='flex items-center gap-1'>
              <div
                className={clsx([
                  "h-2.5 w-2.5 rounded-full",
                  isLoading
                    ? "bg-muted-foreground"
                    : connected
                    ? "bg-green-600"
                    : "bg-red-600",
                ])}
              />
              <span
                className={clsx([
                  "text-xs",
                  isLoading
                    ? "text-muted-foreground"
                    : connected
                    ? "text-green-600"
                    : "text-red-600",
                ])}
              >
                {isLoading
                  ? "Connecting..."
                  : connected
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </Tooltip>
    </SidebarMenuItem>
  );
}
