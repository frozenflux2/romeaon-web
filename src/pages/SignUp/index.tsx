import { Button, Input } from '@material-tailwind/react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { postRequest } from '@/api'

const SignUp = () => {
    const navigate = useNavigate()

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const signUpForm = new FormData(event.currentTarget)
        try {
            const response = await postRequest({
                url: '/auth/signup',
                data: {
                    email: signUpForm.get('email'),
                    password: signUpForm.get('password'),
                    confirmPassword: signUpForm.get('confirmPassword'),
                },
            })
            localStorage.setItem('user-token', response.token)
            navigate('/talkroom')

            toast.success('Sign Up Successfully', {
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
            <div className="text-[33px] font-semibold">Create an Account</div>
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
                onSubmit={handleSignUp}
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
                    <Input
                        name="confirmPassword"
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
                <div className="flex flex-col w-full gap-[20px] mt-[60px]">
                    <Button
                        type="submit"
                        className="bg-[#A8184C] text-md font-medium rounded-[33px]"
                    >
                        Sign Up
                    </Button>
                    <div className="text-sm text-center">
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            className="underline text-[#A8184C] font-semibold"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SignUp
