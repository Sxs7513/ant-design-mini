import { IBaseProps } from '../_base';

/**
 * @description 手风琴，内部由多个 CollapseItem 组成。
 */
export interface ICollapseProps extends IBaseProps {
  uid?: string;
  /**
   * @description 当前激活的索引
   * @default []
   */
  name?: string[];
  /**
   * @description collapse 切换时的回调
   */

  onChange?: (index: string[]) => void;
  /**
   * @description 是否是手风琴模式，仅一个内容被展开
   */

  accordion?: boolean;
}
export declare const CollapseDefaultProps: Partial<ICollapseProps>;
