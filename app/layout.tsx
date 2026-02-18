
export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html>
      <body style={{fontFamily:"Arial",padding:40}}>
        {children}
      </body>
    </html>
  )
}
