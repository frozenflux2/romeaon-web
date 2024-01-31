import Header from '@components/Header'
import SideBar from '@/components/SideBar'

import { ILayoutProps } from '@/constants/types'

const PrivateLayout: React.FC<ILayoutProps> = ({ children }) => {
    return (
        <div className="flex w-full">
            <SideBar />
            <div className="md:w-[calc(100vw-250px)] w-[100vw]">
                <Header />
                {children}
            </div>
        </div>
    )
}

export default PrivateLayout
