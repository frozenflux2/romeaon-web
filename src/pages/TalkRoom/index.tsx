import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import IdleVideo from '@assets/talkroom/idle.mp4'
import { IconButton } from '@material-tailwind/react'
import {
    PlayIcon,
    ChatBubbleOvalLeftIcon,
    DocumentTextIcon,
} from '@heroicons/react/20/solid'
import { postRequest } from '@/api'
import useSize from '@/hooks/useSize'

const TalkRoom = () => {
    const navigate = useNavigate()
    const windowSize = useSize()

    useEffect(() => {
        const checkUserToken = async () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('user-token')
                try {
                    const response = await postRequest({
                        url: '/auth/verify-token',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        } as any,
                    })
                    navigate('/talkroom')
                } catch (err) {
                    navigate('/signin')
                }
            }
        }
        checkUserToken()
    }, [navigate])
    return (
        <div className="h-[calc(100vh-55px)] bg-publicDashboardBg relative">
            <video
                id="talk-video"
                loop
                autoPlay
                playsInline
                className="absolute w-full h-full"
            />
            <video
                id="idle-video"
                src={IdleVideo}
                loop
                autoPlay
                muted
                playsInline
                className="absolute w-full h-full"
            />
            <div
                className="absolute flex items-center justify-center w-full gap-4 md:gap-10"
                style={{
                    bottom: `${
                        windowSize[0] > 720
                            ? (windowSize[1] -
                                  ((windowSize[0] - 250) * 550) / 1120) /
                              2
                            : (windowSize[1] - (windowSize[0] * 628) / 1120) / 2
                    }px`,
                }}
            >
                <IconButton className="rounded-full bg-[#A8184C] w-8 h-8 md:w-10 md:h-10">
                    <PlayIcon color="white" className="w-4 h-4 md:w-6 md:h-6" />
                </IconButton>
                <IconButton className="rounded-full bg-[#A8184C] w-8 h-8 md:w-10 md:h-10">
                    <DocumentTextIcon
                        color="white"
                        className="w-4 h-4 md:w-6 md:h-6"
                    />
                </IconButton>
                <IconButton className="rounded-full bg-[#A8184C] w-8 h-8 md:w-10 md:h-10">
                    <ChatBubbleOvalLeftIcon
                        color="white"
                        className="w-4 h-4 md:w-6 md:h-6"
                    />
                </IconButton>
            </div>
        </div>
    )
}

export default TalkRoom
