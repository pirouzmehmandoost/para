'use client'

import { usePathname } from 'next/navigation'
import SelectionDisplayModal from '@components/ui/SelectionDisplayModal'

const Home = () => {
  const pathname = usePathname()

  return (
    <main className='flex flex-col w-full h-full'>
      {!pathname?.startsWith('/projects/') && <SelectionDisplayModal />}
    </main>
  )
}

export default Home