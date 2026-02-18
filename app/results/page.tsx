
"use client"
import {useEffect,useState} from "react"

export default function Results(){
 const [v,setV]=useState("")
 useEffect(()=>{setV(sessionStorage.getItem("demo")||"")},[])
 return(
  <div>
   <h2>Results</h2>
   <p>Your input: {v}</p>
  </div>
 )
}
