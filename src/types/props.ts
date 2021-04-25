import type { AllHTMLAttributes, ReactNode } from 'react';

export type GlobalProps = {
  className?: string;
  as?: keyof HTMLElementTagNameMap;
  children?: ReactNode;
} & AllHTMLAttributes<HTMLElement>;
