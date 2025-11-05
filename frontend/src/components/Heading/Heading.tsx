import React, { JSX } from "react";

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({
  level = 1,
  children,
  className = "",
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const levelStyles: Record<HeadingLevel, string> = {
    1: "text-2xl font-medium leading-relaxed",
    2: "text-xl font-medium leading-relaxed",
    3: "text-lg font-medium leading-relaxed",
    4: "text-base font-medium leading-relaxed",
  };

  return (
    <Tag className={` ${levelStyles[level]} ${className}`}>{children}</Tag>
  );
};

export default Heading;
