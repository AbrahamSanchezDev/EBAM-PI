"use client";
// force dynamic rendering to avoid prerender step for this page (helps diagnose prerender errors)
export const dynamic = "force-dynamic";
import { lusitana } from '@/app/ui/fonts';
import { CardEmpty } from '@/app/ui/dashboard/cards_empty';
import { MyCalendar } from '../../componentes/MyCalendar';

export default function Page() {
  // Simulación de datos, ya que fetchCardData es async y no se puede usar directamente en un componente client
  // Datos locales simulados
  const numberOfInvoices = 12;
  const numberOfCustomers = 5;
  const totalPaidInvoices = 8;
  const totalPendingInvoices = 4;

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Calendario
      </h1>
     
      {/* <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
      
      </div> */}
      {/* Calendario */}
      <div className="mt-6">
        <MyCalendar />
      </div>

       {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardEmpty title="Collected" value={totalPaidInvoices} type="collected" />
        <CardEmpty title="Pending" value={totalPendingInvoices} type="pending" />
        <CardEmpty title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <CardEmpty
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div> */}
    </main>
  );
}