import { Routes, Route, Navigate } from 'react-router-dom'

import NotFound from '@/pages/404'
import PublicLayout from '../PublicLayout'
import PrivateLayout from '../PrivateLayout'

import type { _PathRouteProps } from './routes'
import {
    publicRoutes as publicList,
    privateRoutes as privateList,
} from './routes'

const RouterSetup = () => {
    const publicRouteFactory = (routes: _PathRouteProps[]) =>
        routes.map((routeProps) => {
            // // console.log(routeProps)
            return (
                <Route
                    {...routeProps}
                    key={routeProps.path as string}
                    element={<PublicLayout>{routeProps.element}</PublicLayout>}
                />
            )
        })
    const privateRouteFactory = (routes: _PathRouteProps[]) =>
        routes.map((routeProps) => {
            // // console.log(routeProps)
            return (
                <Route
                    {...routeProps}
                    key={routeProps.path as string}
                    element={
                        <PrivateLayout>{routeProps.element}</PrivateLayout>
                    }
                />
            )
        })
    return (
        <Routes>
            <Route path="/" element={<Navigate replace to="/talkroom" />} />
            {publicRouteFactory(publicList)}
            {privateRouteFactory(privateList)}
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default RouterSetup
