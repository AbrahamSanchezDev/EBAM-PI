import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import { fetchCardData } from "@/app/lib/data";

// const iconMap = {
//   collected: BanknotesIcon,
//   customers: UserGroupIcon,
//   pending: ClockIcon,
//   invoices: InboxIcon,
// };

// export default async function CardWrapper() {
//     const {
//     numberOfInvoices,
//     numberOfCustomers,
//     totalPaidInvoices,
//     totalPendingInvoices,
//   } = await fetchCardData();
//   return (
//     <>
//       {/* NOTE: Uncomment this code in Chapter 9 */}

//       {/* <Card title="Collected" value={totalPaidInvoices} type="collected" />
//       <Card title="Pending" value={totalPendingInvoices} type="pending" />
//       <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
//       <Card
//         title="Total Customers"
//         value={numberOfCustomers}
//         type="customers"
//       /> */}
//     </>
//   );
// }

export function Spotify({ title, url }: { title: string; url: string }) {
  //   const Icon = iconMap[type];

  return (
    <div className="rounded-xl p-2 shadow-sm bg-black text-white">
      <div className="flex p-4 ">
        {/* {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null} */}
        <h3 className="ml-2 text-sm font-medium color">{title}</h3>
      </div>
      <div
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl bg-black text-white`}
      >
        <iframe
          style={{ borderRadius: "12px" }}
          src={`https://open.spotify.com/embed/track/${url}?utm_source=generator`}
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
