/**
 * 統一アイコンシステム
 * すべて Tabler Icons の一色一筆書きスタイル
 */
import {
  IconUser,
  IconCalendar,
  IconMessageCircle,
  IconShoppingBag,
  IconPackage,
  IconCoin,
  IconStar,
  IconChartBar,
  IconTicket,
  IconHeart,
  IconMapPin,
  IconClock,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconPlus,
  IconSearch,
  IconBell,
  IconBuildingStore,
  IconDiamond,
  IconShirt,
  IconBarbell,
  IconShoe,
  IconPalette,
  IconHeadphones,
  IconBowl,
  IconWallet,
  IconSparkles,
  IconPhone,
  IconBolt,
  IconSend,
  IconX,
  IconMenu2,
  IconChevronRight,
  IconChevronDown,
  IconLogin,
  IconLogout,
  IconSettings,
  IconHome,
  IconInfoCircle,
  IconCreditCard,
  IconTrendingUp,
  IconReceipt,
  IconBrandLine,
  IconBrandGoogle,
  IconBrandX,
  IconBrandInstagram,
  IconBrandFacebook,
  IconRefresh,
  IconHourglass,
  IconBrush,
} from '@tabler/icons-react';

export type IconProps = {
  className?: string;
  size?: number;
  stroke?: number;
};

const wrap = (TablerIcon: typeof IconUser) => ({ className, size = 24, stroke = 1.5 }: IconProps) => (
  <TablerIcon className={className} size={size} stroke={stroke} />
);

// === COMMON ICONS ===
export const UserIcon = wrap(IconUser);
export const CalendarIcon = wrap(IconCalendar);
export const ChatIcon = wrap(IconMessageCircle);
export const BagIcon = wrap(IconShoppingBag);
export const PackageIcon = wrap(IconPackage);
export const CoinIcon = wrap(IconCoin);
export const StarIcon = wrap(IconStar);
export const ChartIcon = wrap(IconChartBar);
export const TicketIcon = wrap(IconTicket);
export const HeartIcon = wrap(IconHeart);
export const MapPinIcon = wrap(IconMapPin);
export const ClockIcon = wrap(IconClock);
export const CheckIcon = wrap(IconCheck);
export const ArrowRightIcon = wrap(IconArrowRight);
export const ArrowLeftIcon = wrap(IconArrowLeft);
export const PlusIcon = wrap(IconPlus);
export const SearchIcon = wrap(IconSearch);
export const BellIcon = wrap(IconBell);
export const StoreIcon = wrap(IconBuildingStore);
export const SparklesIcon = wrap(IconSparkles);
export const PhoneIcon = wrap(IconPhone);
export const BoltIcon = wrap(IconBolt);
export const SendIcon = wrap(IconSend);
export const CloseIcon = wrap(IconX);
export const MenuIcon = wrap(IconMenu2);
export const ChevronRightIcon = wrap(IconChevronRight);
export const ChevronDownIcon = wrap(IconChevronDown);
export const LoginIcon = wrap(IconLogin);
export const LogoutIcon = wrap(IconLogout);
export const SettingsIcon = wrap(IconSettings);
export const HomeIcon = wrap(IconHome);
export const InfoIcon = wrap(IconInfoCircle);
export const CardIcon = wrap(IconCreditCard);
export const TrendingUpIcon = wrap(IconTrendingUp);
export const ReceiptIcon = wrap(IconReceipt);
export const RefreshIcon = wrap(IconRefresh);
export const HourglassIcon = wrap(IconHourglass);

// === PRODUCT/CATEGORY ICONS ===
export const DiamondIcon = wrap(IconDiamond);
export const ShirtIcon = wrap(IconShirt);
export const LipstickIcon = wrap(IconBrush);
export const BarbellIcon = wrap(IconBarbell);
export const ShoeIcon = wrap(IconShoe);
export const PaletteIcon = wrap(IconPalette);
export const HeadphonesIcon = wrap(IconHeadphones);
export const BowlIcon = wrap(IconBowl);
export const WalletIcon = wrap(IconWallet);

// === SOCIAL ===
export const LineIcon = wrap(IconBrandLine);
export const GoogleIcon = wrap(IconBrandGoogle);
export const XIcon = wrap(IconBrandX);
export const InstagramIcon = wrap(IconBrandInstagram);
export const FacebookIcon = wrap(IconBrandFacebook);

// === PRODUCT TYPE MAPPING ===
export const productIconMap = {
  diamond: DiamondIcon,
  shirt: ShirtIcon,
  lipstick: LipstickIcon,
  bag: BagIcon,
  jewelry: DiamondIcon,
  ring: DiamondIcon,
  necklace: DiamondIcon,
  fitness: BarbellIcon,
  shoe: ShoeIcon,
  food: BowlIcon,
  electronics: HeadphonesIcon,
  handmade: PaletteIcon,
  wallet: WalletIcon,
  store: StoreIcon,
  package: PackageIcon,
  sparkles: SparklesIcon,
};

export type ProductIconType = keyof typeof productIconMap;

// Component that takes a string and renders the right icon
export const ProductIcon = ({ type, className, size = 24, stroke = 1.5 }: { type: ProductIconType } & IconProps) => {
  const Icon = productIconMap[type] || PackageIcon;
  return <Icon className={className} size={size} stroke={stroke} />;
};
