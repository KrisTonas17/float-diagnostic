
"use client"
import {useState} from "react"
import {useRouter} from "next/navigation"

export default function Diagnostic(){
 const r=useRouter()
 const [val,setVal]=useState("")
 return(
  <div>
   <h2>Diagnostic</h2>
   <input value={val} onChange={e=>setVal(e.target.value)} placeholder="enter anything"/>
   <br/><br/>
   <button onClick={()=>{sessionStorage.setItem("demo",val);r.push("/results")}}>
    Generate Results
   </button>
  </div>
 )
}
