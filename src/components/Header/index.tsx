import { useContext, useState } from 'react'
import {
    Button,
    Drawer,
    List,
    ListItem,
    ListItemPrefix,
} from '@material-tailwind/react'

import { ThemeContext } from '@/contexts'
import { ThemeContextInterface } from '@/types'
import useWidth from '@/hooks/useSize'

import HOME from '../../assets/talkroom/home.svg'
import CHARACTERS from '../../assets/talkroom/characters.svg'
import SETTINGS from '../../assets/talkroom/settings.svg'
import UPGRADE from '../../assets/talkroom/upgrade.svg'
import SUPPORT from '../../assets/talkroom/support.svg'
import HOME_WHITE from '../../assets/talkroom/home_white.svg'
import CHARACTERS_WHITE from '../../assets/talkroom/characters_white.svg'
import SETTINGS_WHITE from '../../assets/talkroom/settings_white.svg'
import UPGRADE_WHITE from '../../assets/talkroom/upgrade_white.svg'
import SUPPORT_WHITE from '../../assets/talkroom/support_white.svg'
import LOGO from '../../assets/logo.svg'

const Header = () => {
    const { darkTheme, toggleTheme } = useContext(
        ThemeContext
    ) as ThemeContextInterface
    const width = useWidth()[0]
    const [isOpen, setIsOpen] = useState(false)
    const openDrawer = () => setIsOpen(true)
    const closeDrawer = () => setIsOpen(false)
    return (
        <div className="flex items-center justify-between px-[35px] py-[12px] border-b border-[#CECECE] bg-publicDashboardBg">
            {width >= 720 ? (
                <div className="text-xl text-publicDashboardText">
                    Personalized AI Sommelier
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <img alt="" src={LOGO} />
                    <div className="text-xl text-publicDashboardText">
                        Romeaon
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <Button
                    variant="text"
                    className="text-[16px] md:text-[20px] p-0"
                    onClick={toggleTheme}
                >
                    {darkTheme ? (
                        <i className="text-white fas fa-sun " />
                    ) : (
                        <i className="text-black fas fa-moon" />
                    )}
                </Button>
                <Button
                    onClick={openDrawer}
                    variant="text"
                    className="text-[16px] md:text-[20px] p-0 text-publicSidebarText block md:hidden"
                >
                    <i className="fas fa-bars" />
                </Button>
            </div>
            <Drawer
                placement="top"
                onClose={closeDrawer}
                open={isOpen}
                className="bg-publicSidebarBg"
                size={500}
            >
                <div className="flex items-center justify-between px-[35px] py-[12px] border-b border-[#CECECE] md:w-[calc(100vw-250px)] w-[100vw] bg-publicDashboardBg">
                    {width >= 720 ? (
                        <div className="text-xl text-publicDashboardText">
                            Personalized AI Sommelier
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <img alt="" src={LOGO} />
                            <div className="text-xl text-publicDashboardText">
                                Romeaon
                            </div>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <Button
                            variant="text"
                            className="text-[16px] md:text-[20px] p-0"
                            onClick={toggleTheme}
                        >
                            {darkTheme ? (
                                <i className="text-white fas fa-sun " />
                            ) : (
                                <i className="text-black fas fa-moon" />
                            )}
                        </Button>
                        <Button
                            onClick={closeDrawer}
                            variant="text"
                            className="text-[20px] md:text-[20px] p-0 text-publicSidebarText block md:hidden"
                        >
                            <i className="fas fa-close" />
                        </Button>
                    </div>
                </div>
                <List>
                    <ListItem className="py-[23px] text-publicSidebarText">
                        <ListItemPrefix>
                            <img
                                src={!darkTheme ? HOME : HOME_WHITE}
                                alt=""
                                className="h-[25px]"
                            />
                        </ListItemPrefix>
                        Home
                    </ListItem>
                    <ListItem className="py-[23px] text-publicSidebarText">
                        <ListItemPrefix>
                            <img
                                src={!darkTheme ? CHARACTERS : CHARACTERS_WHITE}
                                alt=""
                                className="h-[25px]"
                            />
                        </ListItemPrefix>
                        Characters
                    </ListItem>
                    <ListItem className="py-[23px] text-publicSidebarText">
                        <ListItemPrefix>
                            <img
                                src={!darkTheme ? SETTINGS : SETTINGS_WHITE}
                                alt=""
                                className="h-[25px]"
                            />
                        </ListItemPrefix>
                        Settings
                    </ListItem>
                    <hr className="my-2 border-blue-gray-50" />
                    <ListItem className="py-[23px] text-publicSidebarText">
                        <ListItemPrefix>
                            <img
                                src={!darkTheme ? UPGRADE : UPGRADE_WHITE}
                                alt=""
                                className="h-[25px]"
                            />
                        </ListItemPrefix>
                        Upgrade
                    </ListItem>
                    <ListItem className="py-[23px] text-publicSidebarText">
                        <ListItemPrefix>
                            <img
                                src={!darkTheme ? SUPPORT : SUPPORT_WHITE}
                                alt=""
                                className="h-[25px]"
                            />
                        </ListItemPrefix>
                        Support
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Header
