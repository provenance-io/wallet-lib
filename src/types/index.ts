import React, { ReactNode } from 'react';

export type GlobalProps = {
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  children?: ReactNode;
} & React.AllHTMLAttributes<HTMLElement>;
