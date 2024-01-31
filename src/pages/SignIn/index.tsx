import { useEffect } from 'react'
import { Button, Input } from '@material-tailwind/react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { postRequest } from '@/api'

const SignIn = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const checkUserToken = async () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('user-token')
                try {
                    const response = await postRequest({
                        url: '/auth/verify-token',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    navigate('/talkroom')
                } catch (err) {
                    console.log(err)
                }
            }
        }
        checkUserToken()
    }, [navigate])

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const signInForm = new FormData(event.currentTarget)
        try {
            const response = await postRequest({
                url: '/auth/login',
                data: {
                    email: signInForm.get('email'),
                    password: signInForm.get('password'),
                },
            })
            localStorage.setItem('user-token', response.token)
            navigate('/talkroom')

            toast.success('Login Successfully', {
                position: 'top-right',
            })
        } catch (err) {
            toast.error(err.response.data.errors[0].msg, {
                position: 'top-right',
            })
        }
    }
    return (
        <div className="rounded rounded-lg px-[20px] md:px-[47px] pt-[34px] md:pt-[50px] pb-[34px] md:pb-[94px] bg-publicPageWhite text-publicPageBlack flex flex-col gap-[34px] items-center w-full md:w-[480px] xl:w-[640px]">
            <div className="text-[33px] font-semibold">Welcome Back</div>
            <div className="flex gap-[10px]">
                <i className="fab fa-google border-[1px] border-publicPageBorder rounded rounded-full w-[40px] h-[40px] flex items-center justify-center text-[17px] font-bold" />
                <i className="fab fa-apple border-[1px] border-publicPageBorder rounded rounded-full w-[40px] h-[40px] flex items-center justify-center text-[17px] font-bold" />
            </div>
            <div className="flex items-center justify-between w-full gap-3 text-sm">
                <div className="border-t-[0.5px] flex-1 border-publicPageBorder" />
                <div>or use email</div>
                <div className="border-t-[0.5px] flex-1 border-publicPageBorder" />
            </div>
            <form
                className="flex flex-col gap-[10px] w-full"
                onSubmit={handleSignIn}
            >
                <div className="flex flex-col gap-[20px] w-full">
                    <Input
                        name="email"
                        crossOrigin={null}
                        className=" !border-gray-400 focus:!border-gray-400 rounded-[33px] text-publicPageBlack"
                        placeholder="name@mail.com"
                        labelProps={{
                            className: 'before:content-none after:content-none',
                        }}
                        icon={
                            <i className="fas fa-envelope text-publicPageBlack" />
                        }
                    />
                    <Input
                        name="password"
                        type="password"
                        crossOrigin={null}
                        className=" !border-gray-400 focus:!border-gray-400 rounded-[33px] text-publicPageBlack"
                        placeholder="********"
                        labelProps={{
                            className: 'before:content-none after:content-none',
                        }}
                        icon={
                            <i className="fas fa-lock text-publicPageBlack" />
                        }
                    />
                </div>
                <Link
                    to="/forgotpwd"
                    className="text-sm mb-[40px] w-fit p-1 text-publicPageBlack"
                >
                    Forgot Password?
                </Link>
                <div className="flex flex-col w-full gap-[20px]">
                    <Button
                        type="submit"
                        className="bg-[#A8184C] text-md font-medium rounded-[33px]"
                    >
                        Login
                    </Button>
                    <div className="text-sm text-center">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="underline text-[#A8184C] font-semibold"
                        >
                            Sign up now
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SignIn
