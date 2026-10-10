import type { ButtonHTMLAttributes } from "react";
import { Icon } from "../../components/Icon";
import { buttonClass, type ButtonSize, type ButtonVariant } from "../classes";
import type { IconName } from "../../types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Trailing icon — an arrow on a call to action. */
  iconEnd?: IconName;
  block?: boolean;
}

export function Button({
  variant = "primary", size = "md", icon, iconEnd, block, className, children, type = "button", ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, [block && "btn-block", className].filter(Boolean).join(" "))} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
      {iconEnd && <Icon name={iconEnd} />}
    </button>
  );
}
