
import Link from "next/link"

export default function Page(){
 return(
  <div>
    <h1>Float Diagnostic</h1>
    <p>Live diagnostic app is running.</p>
    <Link href="/diagnostic">Start Diagnostic</Link>
  </div>
 )
}
