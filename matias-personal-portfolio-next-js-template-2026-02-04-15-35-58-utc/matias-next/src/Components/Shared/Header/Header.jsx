'use client'
import React from 'react'
import RanderHeader from './RanderHeader'
import Banner from '@/Components/Banner'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()
  return (
    <>
      {pathname === "/" ? (

        <div className={`bg-banner_image bg-no-repeat bg-center bg-cover bg-fixed relative overflow-hidden`}>
          <RanderHeader />
          <Banner />
        </div>
      ) : (
        <RanderHeader />
      )}
    </>
  )
}

export default Header