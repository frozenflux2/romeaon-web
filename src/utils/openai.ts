import { OPENAI_API_KEY, OPENAI_MODEL } from '@/constants'

export enum ROLE {
    SYSTEM = 'system',
    USER = 'user',
    ASSISTANT = 'assistant',
}

export type messageType = {
    role: ROLE
    content: any
}

export const getOpenAIChatCompletion = async (messages: messageType[]) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 100,
        }),
    })

    if (!response.ok) {
        console.error(
            `[ERROR] OpenAI API request failed with status ${response.status}`
        )
        return ''
    } else {
        const data = await response.json()
        return data.choices[0].message.content.trim()
    }
}
