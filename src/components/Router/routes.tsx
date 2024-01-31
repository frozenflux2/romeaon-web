import ForgotPassword from '@/pages/ForgotPassword'
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'

import TalkRoom from '@/pages/TalkRoom'

export interface _PathRouteProps {
    path: string
    name?: string
    element?: JSX.Element
}

export const publicRoutes: _PathRouteProps[] = [
    {
        path: '/signin',
        name: 'signin',
        element: <SignIn />,
    },
    {
        path: '/signup',
        name: 'signup',
        element: <SignUp />,
    },
    {
        path: '/forgotpwd',
        name: 'forgotpwd',
        element: <ForgotPassword />,
    },
]

export const privateRoutes: _PathRouteProps[] = [
    {
        path: '/talkroom',
        name: 'talkroom',
        element: <TalkRoom />,
    },
]
