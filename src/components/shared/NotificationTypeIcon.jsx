import {
  AlertTriangle,
  Award,
  Bell,
  BookOpenCheck,
  CircleCheck,
  GraduationCap,
  MessageSquareText,
  Settings,
  ShoppingCart,
  Star,
  WalletCards,
} from "lucide-react";

const ICONS = {
  course: BookOpenCheck,
  sale: ShoppingCart,
  warning: AlertTriangle,
  withdrawal: WalletCards,
  certificate: Award,
  quiz: CircleCheck,
  review: Star,
  message: MessageSquareText,
};

const NotificationTypeIcon = ({ kind, category, compact = false }) => {
  const Icon = compact
    ? Bell
    : ICONS[kind] || (category === "academic" ? GraduationCap : Settings);
  return <Icon size={compact ? 17 : 18} aria-hidden="true" />;
};

export default NotificationTypeIcon;
