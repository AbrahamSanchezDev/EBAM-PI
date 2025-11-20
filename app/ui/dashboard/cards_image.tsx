import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';


const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};


export function CardImage({
  title,
  value,
  type,
  skipCheck = false, // Default to false, can be overridden
}: {
  title: string;
  value: string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
  skipCheck?: boolean; // Optional prop to skip the image check
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          rounded-xl bg-white px-4 py-8 text-center text-xl break-words line-clamp-3`}
        style={{ minHeight: "4rem" }}
      >
        {skipCheck ? (
          <Image src={value} alt="" className="mx-auto max-h-40 rounded-lg" />
        ) : (
          /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value) ? (
            <Image src={value} alt="" className="mx-auto max-h-40 rounded-lg" />
          ) : (
            "cargando..."
          )
        )}
      </p>
    </div>
  );
}
