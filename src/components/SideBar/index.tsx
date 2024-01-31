import {
    Card,
    List,
    ListItem,
    ListItemPrefix,
    Typography,
} from '@material-tailwind/react'
import { useContext } from 'react'

import { ThemeContext } from '@/contexts'
import { ThemeContextInterface } from '@/types'

import HOME from '../../assets/talkroom/home.svg'
import CHARACTERS from '../../assets/talkroom/characters.svg'
import SETTINGS from '../../assets/talkroom/settings.svg'
import UPGRADE from '../../assets/talkroom/upgrade.svg'
import SUPPORT from '../../assets/talkroom/support.svg'
import LOGO from '../../assets/logo.svg'
import HOME_WHITE from '../../assets/talkroom/home_white.svg'
import CHARACTERS_WHITE from '../../assets/talkroom/characters_white.svg'
import SETTINGS_WHITE from '../../assets/talkroom/settings_white.svg'
import UPGRADE_WHITE from '../../assets/talkroom/upgrade_white.svg'
import SUPPORT_WHITE from '../../assets/talkroom/support_white.svg'

const SideBar = () => {
    const { darkTheme, toggleTheme } = useContext(
        ThemeContext
    ) as ThemeContextInterface
    return (
        <Card className="!w-[250px] h-[100vh] rounded-none bg-publicSidebarBg hidden md:block">
            <div className="flex items-center justify-center mt-6 gap-[12px]">
                <img alt="" src={LOGO} />
                <Typography variant="h5" className="text-publicSidebarText">
                    Romeaon
                </Typography>
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
        </Card>
    )
}

export default SideBar
