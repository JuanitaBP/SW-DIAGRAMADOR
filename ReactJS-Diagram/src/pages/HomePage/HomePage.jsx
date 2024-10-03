import React from 'react'
import { Header } from './Header';
import { HomeBoardScreen } from './HomeBoardScreen';


export const HomePage = () => {

  return (
    <div className='grid justify-items-center h-screen pt-0' 
    style={{ backgroundColor: '#232946' }} // Cambia el color aquí
  >
     <Header />
      <div className='w-3/4 border-1 '>
          <HomeBoardScreen />
       
      </div>
    </div>
  )
}
