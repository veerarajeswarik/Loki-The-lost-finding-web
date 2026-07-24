import { Laptop, IdCard, BookOpen, Backpack, Shirt, KeyRound, Package } from 'lucide-react';

const MAP = {
  electronics: Laptop,
  'ID cards': IdCard,
  books: BookOpen,
  accessories: Backpack,
  clothing: Shirt,
  keys: KeyRound,
  other: Package,
};

export default function CategoryIcon({ category, className = 'h-5 w-5', strokeWidth = 1.75 }) {
  const Icon = MAP[category] || Package;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
