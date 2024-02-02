import { Avatar } from '@material-tailwind/react'
import { ROLE, type messageType } from '@/utils/openai'

const ChatBox = ({ role, content }: messageType) => {
    if (role === ROLE.USER) {
        return (
            <div className="flex items-end gap-3 p-4">
                <div className="flex flex-col items-center flex-1 gap-1 p-2 text-sm text-white rounded bg-black/40">
                    {typeof content === 'object' ? (
                        <>
                            <img src={content[1].image_url.url} alt="" />
                            <div className="w-full text-right">
                                {content[0].text}
                            </div>
                        </>
                    ) : (
                        <div className="w-full text-right">{content}</div>
                    )}
                </div>
                <Avatar
                    src="https://docs.material-tailwind.com/img/face-2.jpg"
                    alt="avatar"
                    size="sm"
                />
            </div>
        )
    } else if (role === ROLE.ASSISTANT) {
        return (
            <div className="flex items-end gap-3 p-4">
                <Avatar
                    src="https://i.ibb.co/RYh2S73/avatar.png"
                    alt="avatar"
                    size="sm"
                />
                <div className="flex items-center flex-1 p-2 text-sm text-white rounded bg-black/40">
                    {content}
                </div>
            </div>
        )
    } else return <></>
}

export default ChatBox
