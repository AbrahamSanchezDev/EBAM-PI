"use client";
import { lusitana } from '@/app/ui/fonts';
import { MyCalendar } from '../../componentes/MyCalendar';

export default function Page() {


  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Calendario
      </h1>
     
     
      <div className="mt-6">
        <MyCalendar />
      </div>

       
    </main>
  );
}

