import {
  DefaultTableColumnRender,
  DefaultTableHeadRender,
  DefaultTableRowRender,
  DefaultTableTitleRender,
} from './default-render';
import { TableProps } from './type';

type AllFiled = keyof TableProps;

type PickTableFiled<T extends AllFiled> = Extract<AllFiled, T>;

export type NullableField = PickTableFiled<
  | 'loadingHeight'
  | 'columnGap'
  | 'paddingLeftRight'
  | 'overScanCount'
  | 'itemSize'
  | 'titleRender'
  | 'columnRender'
  | 'headRender'
  | 'rowRender'
  | 'virtualHeight'
>;

export type NullableProps = Required<Pick<TableProps, NullableField>>;

export const defaultProps = {
  loadingHeight: 560,
  columnGap: 16,
  paddingLeftRight: 16,
  itemSize: 56,
  overScanCount: 10,
  virtualHeight: 560,
  titleRender: DefaultTableTitleRender,
  columnRender: DefaultTableColumnRender,
  headRender: DefaultTableHeadRender,
  rowRender: DefaultTableRowRender,
} satisfies NullableProps;
