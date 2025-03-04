import { IBaseFormItemPropsWithOutFocus } from '../_base';
/**
 * @description 开关。
 */

export interface ISwitchProps extends IBaseFormItemPropsWithOutFocus<boolean> {
  /**
   * @description 是否勾选
   */
  checked?: boolean;
  /**
   * @description 是否受控模式
   * @default false
   */
  controlled?: boolean;
  /**
   * @description 尺寸
   * @default medium
  */
  size?: 'medium' | 'small' | 'x-small';
}
export declare const SwitchDefaultProps: Partial<ISwitchProps>;
