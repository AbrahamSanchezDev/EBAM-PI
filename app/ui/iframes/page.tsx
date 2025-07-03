import { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";
import { Youtube } from "@/app/ui/iframes/youtube";


export const metadata: Metadata = {
  title: 'Customers',
};

export default function Page() {
  
  return (<main>
<p>Customers Page</p>
<h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>

APIs

</h1>

<Youtube  title="MI YOUTUBE VIDEO" url="AiIBKcd4m5Q?si=Sgx4Zb-4RVB4hJnm"/>

<Youtube  title="MI YOUTUBE VIDEO 2" url="FHhZPp08s74?si=E46y0ddVjGjU1X-o"/>


<Youtube  title="MI YOUTUBE VIDEO 3" url="bUkJLkoh3kA?si=scHi4dP9esCFMegt"/>

<iframe src="https://abrahamsanchezdev.github.io/Resume/" frameborder="0"></iframe>


</main>) 
}
