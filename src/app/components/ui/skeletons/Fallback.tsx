import { memo, useEffect } from 'react'

export const BasicFallback = () => {
  return (
    <div className='flex grow flex-col w-full h-full justify-center items-center text-center text-7xl text-header'>
      Loading...
    </div>
  )
}

interface StyledFallbackProps {
  str?: string
  injectStyle?: string
}

export const StyledFallback = memo(({ str = '', injectStyle = '' }: StyledFallbackProps) => {
  return (
    <div
      role='status'
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-header pointer-events-none ${injectStyle}`}
    >
      {str}
    </div>
  )
})
StyledFallback.displayName = 'StyledFallback'




interface LoadingFallbackProps {
  onLoadingChange: (loading: boolean) => void
}

// Signal the DOM overlay from Suspense without creating a nested React root via Html.
export const LoadingFallback = ({ onLoadingChange }: LoadingFallbackProps) => {
  useEffect(() => {
    onLoadingChange(true)
    return () => onLoadingChange(false)
  }, [onLoadingChange])

  return null
}