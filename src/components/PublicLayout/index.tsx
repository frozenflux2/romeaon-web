import { useContext } from 'react'
import { Button } from '@material-tailwind/react'

import { ThemeContext } from '@/contexts'
import { ThemeContextInterface } from '@/types'
import { ILayoutProps } from '@/constants/types'

import Logo from '../../assets/logo.svg'
import BG from '../../assets/signin/bg.jpg'

const PublicLayout: React.FC<ILayoutProps> = ({ children }) => {
    const { darkTheme, toggleTheme } = useContext(
        ThemeContext
    ) as ThemeContextInterface
    return (
        <div
            className="px-[20px] lg:px-[40px] xl:px-[60px] pt-[30px] pb-[60px] md:pb-[100px] w-full h-full md:h-screen text-white bg-cover"
            style={{
                backgroundImage: `url(${BG})`,
            }}
        >
            <div className="flex items-end justify-between">
                <div className="text-[20px] md:text-[28px] flex gap-2">
                    <img src={Logo} alt="logo" />
                    Romeaon
                </div>
                <Button
                    variant="text"
                    className="text-[16px] md:text-[20px] p-0"
                    onClick={toggleTheme}
                >
                    {darkTheme ? (
                        <i className="text-white fas fa-sun " />
                    ) : (
                        <i className="text-white fas fa-moon" />
                    )}
                </Button>
            </div>
            <div className="flex flex-col justify-between w-full md:flex-row gap-[90px] md:gap-0">
                <div className="pt-[80px] md:pt-[120px]">
                    <h1 className="text-[43px] md:text-[73px] font-bold">
                        My
                        <br />
                        SuperSomm
                    </h1>
                    <h6 className="text-[16px] md:text-[24px] font-medium pt-4">
                        Your personalized AI Sommelier
                        <br />
                        Converse with a AI Sommelier in Real Time
                    </h6>
                </div>
                <div className="md:pr-8">{children}</div>
            </div>
        </div>
    )
}

export default PublicLayout
