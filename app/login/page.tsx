'use client'
import Image from "next/image";
import logo from '../assets/ralogo.png'

const page = () => {
  return (
   <>
    <div>
      <Image src={logo} alt="RA logo" width={300} height={300} />
      <form action="">
        <input type="text" />
        <input type="text" />
        <button>LOGIN</button>
      </form>
    </div>
   </>
  )
}

export default page