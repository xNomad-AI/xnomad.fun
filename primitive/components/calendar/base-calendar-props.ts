import { ReactNode } from "react";

import { CalendarDateSwitchProps } from "./date-switch";
import { CalendarPanelProps } from "./panel";

export interface BaseCalendarProps
  extends CalendarPanelProps,
    CalendarDateSwitchProps {
  maskContent?: ReactNode;
  withTimeSelect?: boolean;
}
