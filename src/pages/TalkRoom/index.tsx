import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import IdleVideo from '@assets/talkroom/idle.mp4'
import { Button, IconButton } from '@material-tailwind/react'
import {
    PlayIcon,
    ChatBubbleOvalLeftIcon,
    DocumentTextIcon,
    ChevronDoubleRightIcon,
    XMarkIcon,
    PhotoIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/20/solid'
import { fetchWithRetries, postRequest } from '@/api'
import useSize from '@/hooks/useSize'
import {
    LiveClient,
    LiveConnectionState,
    LiveTranscriptionEvent,
} from '@deepgram/sdk'
import { getDeepgramLiveConnection } from '@/utils/deepgram'
import {
    D_ID_API_KEY,
    D_ID_ENDPOINT,
    D_ID_SOURCE_IMG,
    SYSTEM_PROMPT,
} from '@/constants'
import { ROLE, getOpenAIChatCompletion, type messageType } from '@/utils/openai'
import toast from 'react-hot-toast'
import ChatBox from './Components/Chatbox'

const TalkRoom = () => {
    const navigate = useNavigate()
    const windowSize = useSize()

    const [showCaption, setShowCaption] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)
    const [image, setImage] = useState<string | ArrayBuffer | null>(null)
    const [userInput, setUserInput] = useState('')
    const endOfMessagesRef = useRef<HTMLDivElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const talkVideoRef = useRef<HTMLVideoElement | null>(null)
    const idleVideoRef = useRef<HTMLVideoElement | null>(null)

    const videoIsPlayingRef = useRef<boolean | null>(null)
    const lastBytesReceivedRef = useRef<number | null>(null)
    const statsIntervalIdRef = useRef<number | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const streamIdRef = useRef(null)
    const sessionIdRef = useRef(null)
    const sessionClientAnswerRef = useRef<RTCSessionDescriptionInit | null>(
        null
    )

    const deepgramLive = useRef<LiveClient | null>(null)
    const speechChunk = useRef('')
    const mediaRecorder = useRef<MediaRecorder | null>(null)

    const [messages, setMessages] = useState<messageType[]>([
        {
            role: ROLE.SYSTEM,
            content: SYSTEM_PROMPT,
        },
    ])

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        fileInputRef.current?.click()
    }

    const handleSendMessage = async () => {
        if (
            peerConnectionRef.current?.signalingState === 'stable' ||
            peerConnectionRef.current?.iceConnectionState === 'connected'
        ) {
            if (image) {
                let _messages = [
                    ...messages,
                    {
                        role: ROLE.USER,
                        content: [
                            {
                                type: 'text',
                                text:
                                    userInput ||
                                    `Tell me about the wine in this image`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image,
                                },
                            },
                        ],
                    },
                ]
                setMessages((prev) => [
                    ...prev,
                    {
                        role: ROLE.USER,
                        content: [
                            {
                                type: 'text',
                                text:
                                    userInput ||
                                    `Tell me about the wine in this image`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image,
                                },
                            },
                        ],
                    },
                ])
                const openAIResponse = await getOpenAIChatCompletion(
                    _messages,
                    'gpt-4-vision-preview'
                )
                setMessages((prev) => [
                    ...prev,
                    {
                        role: ROLE.ASSISTANT,
                        content: openAIResponse,
                    },
                ])
                processTalk(openAIResponse)
            } else {
                let _messages = [
                    ...messages,
                    {
                        role: ROLE.USER,
                        content: userInput,
                    },
                ]
                setMessages((prev) => [
                    ...prev,
                    {
                        role: ROLE.USER,
                        content: userInput,
                    },
                ])
                const openAIResponse = await getOpenAIChatCompletion(_messages)
                setMessages((prev) => [
                    ...prev,
                    {
                        role: ROLE.ASSISTANT,
                        content: openAIResponse,
                    },
                ])
                processTalk(openAIResponse)
            }
            setUserInput('')
            setImage(null)
        } else {
            toast.error('Please connect to service first!')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result
                setImage(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleConnection = async () => {
        if (isPlaying) {
            stopAllStreams()
            closePC()
            console.log('close deepgram cuz of stop playing')
            closeDeepgram()
            stopRecorder()
        } else {
            setIsPlaying(true)
            idleVideoRef.current && idleVideoRef.current.play()

            // deepgram connection
            deepgramLive.current = getDeepgramLiveConnection(
                transcriptReceivedEventHandler
            )

            // d-id connection
            setDIDStreamConnection()

            // start recorder
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(async (stream) => {
                    if (!MediaRecorder.isTypeSupported('audio/webm')) {
                        toast(
                            'iOS / Safari Browser not supported. Please use Chrome or Firefox on Desktop or use Android.'
                        )
                        return
                    }

                    mediaRecorder.current = new MediaRecorder(stream, {
                        mimeType: 'audio/webm',
                    })
                    mediaRecorder.current.start(250)
                    mediaRecorder.current.addEventListener(
                        'dataavailable',
                        async (event) => {
                            if (
                                event.data.size > 0 &&
                                deepgramLive.current?.getReadyState() ===
                                    LiveConnectionState.OPEN
                            )
                                deepgramLive.current.send(event.data)
                        }
                    )
                })
                .catch((err) => {
                    console.log('error on media recorder: ', err)
                    toast.error(
                        "Can't find Media device or Permission denied!!"
                    )
                    stopRecorder()
                    closeDeepgram()
                    console.log('close deepgram cuz of no mic')
                })
        }
    }

    const closeDeepgram = () => {
        if (deepgramLive.current) {
            deepgramLive.current.removeAllListeners()
            deepgramLive.current.finish()
            deepgramLive.current = null
        }
    }

    const stopRecorder = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop()
            mediaRecorder.current = null
        }
    }

    const setDIDStreamConnection = async () => {
        const sessionResponse = await fetchWithRetries(
            `${D_ID_ENDPOINT}/talks/streams`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${D_ID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_url: D_ID_SOURCE_IMG,
                }),
            }
        )

        const {
            id: newStreamId,
            offer,
            ice_servers: iceServers,
            session_id: newSessionId,
        } = await sessionResponse.json()
        streamIdRef.current = newStreamId
        sessionIdRef.current = newSessionId

        try {
            const sessionClientAnswer = await createPeerConnection(
                offer,
                iceServers
            )
            sessionClientAnswerRef.current = sessionClientAnswer
        } catch (e) {
            console.log('error during streaming setup', e)
            stopAllStreams()
            closePC()
            console.log('close deepgram cuz of streaming setup failed')
            closeDeepgram()
            stopRecorder()
            return
        }

        const sdpResponse = await fetch(
            `${D_ID_ENDPOINT}/talks/streams/${streamIdRef.current}/sdp`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${D_ID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answer: sessionClientAnswerRef.current,
                    session_id: sessionIdRef.current,
                }),
            }
        )
    }

    const onIceGatheringStateChange = () => {
        console.log(peerConnectionRef.current?.iceGatheringState)
    }

    const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
        console.log('onIceCandidate', event)
        if (event.candidate) {
            const { candidate, sdpMid, sdpMLineIndex } = event.candidate

            fetch(`${D_ID_ENDPOINT}/talks/streams/${streamIdRef.current}/ice`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${D_ID_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidate,
                    sdpMid,
                    sdpMLineIndex,
                    session_id: sessionIdRef.current,
                }),
            })
        }
    }

    const onIceConnectionStateChange = () => {
        console.log(peerConnectionRef.current?.iceConnectionState)
        if (
            peerConnectionRef.current?.iceConnectionState === 'failed' ||
            peerConnectionRef.current?.iceConnectionState === 'closed'
        ) {
            stopAllStreams()
            closePC()
            console.log('close deepgram cuz of peerconnection failed or closed')
            closeDeepgram()
            stopRecorder()
        }
    }

    const onConnectionStateChange = () => {
        console.log(peerConnectionRef.current?.connectionState)
        toast(`Connection State: ${peerConnectionRef.current?.connectionState}`)
    }

    const onSignalingStateChange = () => {
        console.log(peerConnectionRef.current?.signalingState)
        toast(`Sigaling State: ${peerConnectionRef.current?.signalingState}`)
    }

    const onTrack = (event: RTCTrackEvent) => {
        if (!event.track) return

        statsIntervalIdRef.current = window.setInterval(async () => {
            try {
                const stats = await peerConnectionRef.current?.getStats(
                    event.track
                )
                stats?.forEach((report) => {
                    if (
                        report.type === 'inbound-rtp' &&
                        report.mediaType === 'video'
                    ) {
                        const videoStatusChanged =
                            videoIsPlayingRef.current !==
                            report.bytesReceived >
                                (lastBytesReceivedRef.current ?? 0)
                        if (videoStatusChanged) {
                            videoIsPlayingRef.current =
                                report.bytesReceived >
                                (lastBytesReceivedRef.current ?? 0)
                            onVideoStatusChange(event.streams[0])
                        }
                        lastBytesReceivedRef.current = report.bytesReceived
                    }
                })
            } catch (_err) {}
        }, 500)
    }

    const createPeerConnection = async (
        offer: RTCSessionDescriptionInit,
        iceServers: RTCIceServer[]
    ) => {
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = new RTCPeerConnection({ iceServers })
            peerConnectionRef.current.addEventListener(
                'icegatheringstatechange',
                onIceGatheringStateChange,
                true
            )
            peerConnectionRef.current.addEventListener(
                'icecandidate',
                onIceCandidate,
                true
            )
            peerConnectionRef.current.addEventListener(
                'iceconnectionstatechange',
                onIceConnectionStateChange,
                true
            )
            peerConnectionRef.current.addEventListener(
                'connectionstatechange',
                onConnectionStateChange,
                true
            )
            peerConnectionRef.current.addEventListener(
                'signalingstatechange',
                onSignalingStateChange,
                true
            )
            peerConnectionRef.current.addEventListener('track', onTrack, true)
        }

        await peerConnectionRef.current.setRemoteDescription(offer)
        console.log('set remote sdp OK')

        const sessionClientAnswer =
            await peerConnectionRef.current.createAnswer()
        console.log('create local sdp OK')

        await peerConnectionRef.current.setLocalDescription(sessionClientAnswer)
        console.log('set local sdp OK')

        return sessionClientAnswer
    }

    const onVideoStatusChange = (stream: MediaStream) => {
        if (videoIsPlayingRef.current) {
            if (!stream) return
            if (talkVideoRef.current) {
                talkVideoRef.current.srcObject = stream

                // talkVideoRef.current.style.zIndex = '2'
                talkVideoRef.current.style.opacity = '1'
                if (idleVideoRef.current) {
                    // idleVideoRef.current.style.zIndex = '1'
                    idleVideoRef.current.style.opacity = '0'
                }

                // safari hotfix
                if (talkVideoRef.current.paused) {
                    talkVideoRef.current
                        .play()
                        .then(() => {})
                        .catch(() => {})
                }
            }
        } else {
            // play idle video
            if (talkVideoRef.current) {
                // talkVideoRef.current.style.zIndex = '1'
                talkVideoRef.current.style.opacity = '0'
            }
            if (idleVideoRef.current) {
                // idleVideoRef.current.style.zIndex = '2'
                idleVideoRef.current.style.opacity = '1'
            }
        }
    }

    const stopAllStreams = () => {
        if (talkVideoRef.current?.srcObject) {
            const mediaStream: MediaStream = talkVideoRef.current
                .srcObject as MediaStream
            mediaStream.getTracks().forEach((track) => track.stop())
            talkVideoRef.current.srcObject = null
            talkVideoRef.current.style.opacity = '0'
        }

        if (idleVideoRef.current) {
            idleVideoRef.current.style.opacity = '1'
            idleVideoRef.current.pause()
        }

        setIsPlaying(false)
    }

    const closePC = (pc = peerConnectionRef.current) => {
        if (!pc) return
        console.log('stopping peer connection')
        pc.close()
        pc.removeEventListener(
            'icegatheringstatechange',
            onIceGatheringStateChange,
            true
        )
        pc.removeEventListener('icecandidate', onIceCandidate, true)
        pc.removeEventListener(
            'iceconnectionstatechange',
            onIceConnectionStateChange,
            true
        )
        pc.removeEventListener(
            'connectionstatechange',
            onConnectionStateChange,
            true
        )
        pc.removeEventListener(
            'signalingstatechange',
            onSignalingStateChange,
            true
        )
        pc.removeEventListener('track', onTrack, true)
        if (statsIntervalIdRef.current)
            clearInterval(statsIntervalIdRef.current)
        console.log('stopped peer connection')
        if (pc === peerConnectionRef.current) {
            peerConnectionRef.current = null
        }
    }

    const transcriptReceivedEventHandler = async (
        dgOutput: LiveTranscriptionEvent
    ) => {
        let dgJSON = dgOutput
        let words: {
            word: string
            start: number
            end: number
            confidence: number
            punctuated_word: string
        }[] = []
        if (dgJSON.channel) {
            let utterance
            try {
                utterance = dgJSON.channel.alternatives[0].transcript
                words = words.concat(dgJSON.channel.alternatives[0].words)
            } catch (error) {
                console.log(
                    '[WARNING] parsing dgJSON failed. Response from dgLive is:',
                    error
                )
                console.log(dgJSON)
            }
            if (utterance) {
                if (!speechChunk.current) {
                    speechChunk.current = ''
                }
                if (dgJSON.speech_final) {
                    speechChunk.current += utterance + ' '
                    console.log(`[DEBUG] SPEECH_FINAL ${speechChunk}`)
                    // fetch openai response
                    let _messages = [
                        ...messages,
                        {
                            role: ROLE.USER,
                            content: speechChunk.current,
                        },
                    ]
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: ROLE.USER,
                            content: speechChunk.current,
                        },
                    ])
                    const openAIResponse = await getOpenAIChatCompletion(
                        _messages
                    )
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: ROLE.ASSISTANT,
                            content: openAIResponse,
                        },
                    ])
                    processTalk(openAIResponse)
                    speechChunk.current = ''
                    words = []
                } else if (dgJSON.is_final) {
                    speechChunk.current += utterance + ' '
                    console.log(`[DEBUG] IS_FINAL: ${speechChunk}`)
                } else {
                    console.log(`[DEBUG] INTERIM_RESULT: `, utterance)
                }
            }
        } else {
            if (speechChunk.current != '') {
                console.log(
                    `[DEBUG] UTTERANCE_END_MS Triggered: ${speechChunk}`
                )
                speechChunk.current = ''
            } else {
                console.log(
                    `[DEBUG] UTTERANCE_END_MS Not Triggered: ${speechChunk}`
                )
            }
        }
    }

    const processTalk = async (msg: string) => {
        if (
            peerConnectionRef.current?.signalingState === 'stable' ||
            peerConnectionRef.current?.iceConnectionState === 'connected'
        ) {
            const playResponse = await fetchWithRetries(
                `${D_ID_ENDPOINT}/talks/streams/${streamIdRef.current}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${D_ID_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        script: {
                            type: 'text',
                            subtitles: 'false',
                            provider: {
                                type: 'microsoft',
                                voice_id: 'en-US-ChristopherNeural',
                            },
                            ssml: false,
                            input: msg, //send the openAIResponse to D-id
                        },
                        driver_url: 'bank://lively/',
                        config: {
                            stitch: true,
                            fluent: true,
                        },
                        session_id: sessionIdRef.current,
                    }),
                }
            )
        }
    }

    /* disabled for testing
    useEffect(() => {
        const checkUserToken = async () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('user-token')
                if (!token) navigate('/signin')
                try {
                    const response = await postRequest({
                        url: '/auth/verify-token',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        } as any,
                    })
                    // console.log('resp:', response)
                    navigate('/talkroom')
                } catch (err) {
                    navigate('/signin')
                }
            }
        }
        checkUserToken()
    }, [navigate])
    */

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    return (
        <div className="h-[calc(100vh-55px)] bg-publicDashboardBg relative">
            <video
                id="talk-video"
                loop
                autoPlay
                playsInline
                className={`absolute w-full h-full transition-opacity duration-300 ease-in-out opacity-0`}
                ref={talkVideoRef}
            />
            <video
                id="idle-video"
                src={IdleVideo}
                loop
                autoPlay={isPlaying}
                playsInline
                className={`absolute w-full h-full transition-opacity duration-300 ease-in-out opacity-100`}
                ref={idleVideoRef}
            />

            <div
                className={`${
                    openDrawer ? 'opacity-100' : 'opacity-0'
                } absolute bg-white/40 w-[300px] transition-[right, opacity] duration-300 ease-in-out z-[4] backdrop-blur-md`}
                style={{
                    height: `${
                        windowSize[0] > 720
                            ? ((windowSize[0] - 250) * 628) / 1120 + 55 >
                              windowSize[1]
                                ? windowSize[1] - 55
                                : ((windowSize[0] - 250) * 628) / 1120
                            : (windowSize[0] * 628) / 1120
                    }px`,
                    top: `${
                        windowSize[0] > 720
                            ? ((windowSize[0] - 250) * 628) / 1120 + 55 >
                              windowSize[1]
                                ? 0
                                : (windowSize[1] -
                                      55 -
                                      ((windowSize[0] - 250) * 628) / 1120) /
                                  2
                            : (windowSize[1] -
                                  55 -
                                  (windowSize[0] * 628) / 1120) /
                              2
                    }px`,
                    right: `${
                        openDrawer
                            ? ((windowSize[0] - 250) * 628) / 1120 + 55 >
                              windowSize[1]
                                ? (windowSize[0] -
                                      250 -
                                      ((windowSize[1] - 55) / 628) * 1120) /
                                  2
                                : 0
                            : ((windowSize[0] - 250) * 628) / 1120 + 55 >
                              windowSize[1]
                            ? (windowSize[0] -
                                  250 -
                                  ((windowSize[1] - 55) / 628) * 1120) /
                                  2 -
                              300
                            : -300
                    }px`,
                }}
            >
                <div className="h-full overflow-hidden">
                    <div className="flex items-center justify-between h-16 px-2">
                        <IconButton
                            onClick={() => setOpenDrawer(false)}
                            className="w-8 h-8 rounded rounded-full"
                            variant="text"
                        >
                            <ChevronDoubleRightIcon
                                color="black"
                                className="w-4 h-4 md:w-6 md:h-6"
                            />
                        </IconButton>
                    </div>
                    <div className="h-[calc(100%-200px)] rounded mx-2 overflow-y-auto relative">
                        {messages.map((msg, key) => (
                            <ChatBox key={`chat-${key}`} {...msg} />
                        ))}
                        {openDrawer && <div ref={endOfMessagesRef} />}
                    </div>
                    <div className="relative flex flex-col gap-0 px-2 py-3 h-30">
                        {image && (
                            <div className="absolute top-0 -translate-y-[100%]">
                                <div className="relative items-center">
                                    <img
                                        src={image}
                                        alt="Selected"
                                        className="bottom-0 w-20"
                                    />
                                    <button
                                        onClick={() => setImage('')}
                                        className="absolute p-1 rounded-full -top-2 -right-2 bg-black/90"
                                    >
                                        <XMarkIcon
                                            className="w-4"
                                            color="white"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(
                                event: React.KeyboardEvent<HTMLTextAreaElement>
                            ) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            rows={3}
                            placeholder="Type your message here..."
                            className="w-full p-2 text-sm text-white border-b-0 border-white rounded rounded-b-none outline-none resize-none bg-white/0 focus:border-white focus:overflow-hidden focus:ring-0"
                        />
                        <div className="flex items-center justify-between p-2 border border-t-0 rounded-b">
                            <IconButton
                                className="w-6 h-6 rounded-full bg-black/60"
                                onClick={handleButtonClick}
                            >
                                <PhotoIcon className="w-3 h-3" />
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </IconButton>
                            <IconButton
                                className="w-6 h-6 rounded rounded-full bg-black/60"
                                onClick={handleSendMessage}
                            >
                                <PaperAirplaneIcon className="w-3 h-3" />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="absolute flex items-center justify-center w-full gap-4 md:gap-10 z-[3]"
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
                <IconButton
                    className={`rounded-full w-8 h-8 md:w-10 md:h-10 ${
                        isPlaying ? 'bg-[#A8184C]' : 'bg-white/10'
                    } hover:brightness-125`}
                    onClick={handleConnection}
                >
                    <PlayIcon color="white" className="w-4 h-4 md:w-6 md:h-6" />
                </IconButton>
                <IconButton
                    className={`rounded-full ${
                        showCaption ? 'bg-[#A8184C]' : 'bg-white/10'
                    } w-8 h-8 md:w-10 md:h-10 hover:brightness-125`}
                >
                    <DocumentTextIcon
                        color="white"
                        className="w-4 h-4 md:w-6 md:h-6"
                    />
                </IconButton>
                <IconButton
                    className={`rounded-full ${
                        openDrawer ? 'bg-[#A8184C]' : 'bg-white/10'
                    } w-8 h-8 md:w-10 md:h-10 hover:brightness-125`}
                    onClick={() => setOpenDrawer((prev) => !prev)}
                >
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
