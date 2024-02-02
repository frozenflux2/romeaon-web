import { DEEPGRAM_API_KEY } from '@/constants'
import {
    createClient,
    LiveClient,
    LiveConnectionState,
    LiveTranscriptionEvent,
    LiveTranscriptionEvents,
} from '@deepgram/sdk'

let intervalId: NodeJS.Timeout

type TranscriptReceivedEventHandler = (
    data: LiveTranscriptionEvent
) => Promise<void>

export const getDeepgramLiveConnection = (
    transcriptReceivedEventHandler: TranscriptReceivedEventHandler
): LiveClient => {
    const deepgram = createClient(DEEPGRAM_API_KEY)
    const deepgramLive = deepgram.listen.live({
        language: 'en-US',
        smart_format: true,
        model: 'nova',
        interim_results: true,
        endpointing: 100,
        no_delay: true,
        utterance_end_ms: 1000,
    })

    deepgramLive.on(LiveTranscriptionEvents.Open, () => {
        console.log(`[DEBUG] Deepgram Live Websocket connection open!`)
        intervalId = setInterval(() => {
            // console.log('keepAlive')
            if (
                deepgramLive.getReadyState() === LiveConnectionState.CLOSING ||
                deepgramLive.getReadyState() === LiveConnectionState.CLOSED
            ) {
                clearInterval(intervalId)
            } else {
                deepgramLive.keepAlive()
            }
        }, 3000)
    })

    deepgramLive.on(LiveTranscriptionEvents.Close, async (msg) => {
        console.log(
            `[DEBUG] Deepgram Live CONNNECTION CLOSED: ${Object.keys(msg)}`
        )
        Object.keys(msg).map((el) => console.log('debug: ', el, msg[el]))
        clearInterval(intervalId)
        deepgramLive.finish()
    })

    deepgramLive.on(LiveTranscriptionEvents.Error, async (err) => {
        console.log(`[ERROR] Deepgram Live CONNNECTION ERROR: ${err}`)
    })

    deepgramLive.on(LiveTranscriptionEvents.Metadata, async (data) => {
        console.log(`[DEBUG] Deepgram Live CONNNECTION Metadata: ${data}`)
        Object.keys(data).map((el) => console.log('metadata: ', el, data[el]))
    })

    deepgramLive.on(LiveTranscriptionEvents.Warning, async (war) => {
        console.log(`[DEBUG] Deepgram Warning: ${war}`)
    })

    deepgramLive.on(
        LiveTranscriptionEvents.Transcript,
        transcriptReceivedEventHandler
    )

    return deepgramLive
}
