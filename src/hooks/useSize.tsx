import { useState, useEffect } from 'react'

const useSize = () => {
    // Handler to update the state when scrolling occurs
    const [windowSize, setWindowSize] = useState([
        window.innerWidth,
        window.innerHeight,
    ])

    useEffect(() => {
        const handleResize = () =>
            setWindowSize([window.innerWidth, window.innerHeight])
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, []) // Empty array ensures that effect is only run on mount and unmount

    return windowSize
}

export default useSize
