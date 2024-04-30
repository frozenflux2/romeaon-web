import { OPENAI_API_KEY } from '@/constants'

export const transcriptAudio = async (blob: Blob) => {
    const audioBlob = new Blob([blob], { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', 'whisper-1')
    const response = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        }
    )

    if (!response.ok) {
        return ''
    }

    const data = await response.json()
    return data?.text ?? ''
}
