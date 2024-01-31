import { ReactNode } from 'react'

export interface ILayoutProps {
    children: ReactNode
}

export interface INavItem {
    label: string
    link: string
}
