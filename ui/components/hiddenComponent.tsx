import React from "react";

interface HiddenComponentProps {
  condition: boolean;
  children: React.ReactNode;
}

const HiddenComponent: React.FC<HiddenComponentProps> = ({
  condition,
  children,
}) => {
  if (!condition) {
    return null;
  }
  return <>{children}</>;
};

export default HiddenComponent;
