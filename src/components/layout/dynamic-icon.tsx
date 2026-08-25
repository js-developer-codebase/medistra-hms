import React from "react";
import * as Icons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = "h-4 w-4" }) => {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.Circle;
  return <IconComponent className={className} />;
};

export default DynamicIcon;
