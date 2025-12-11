import { FC, memo, SVGProps, useMemo } from "react";
import * as icons from "lucide-static";

interface DynamicIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

const DynamicIcon: FC<DynamicIconProps> = ({ name, size = 24, ...props }) => {
  const iconSVG = useMemo(() => {
    const iconName = name.charAt(0).toUpperCase() + name.slice(1);
    const iconKey = iconName as keyof typeof icons;

    return icons[iconKey] || icons.HelpCircle;
  }, [name]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      dangerouslySetInnerHTML={{ __html: iconSVG }}
    />
  );
};

export default memo(DynamicIcon);
