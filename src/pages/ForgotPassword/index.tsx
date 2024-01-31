import { Button, Input } from '@material-tailwind/react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
    return (
        <div className="rounded rounded-lg px-[20px] md:px-[47px] pt-[34px] md:pt-[50px] pb-[34px] md:pb-[94px] bg-publicPageWhite text-publicPageBlack flex flex-col gap-[34px] items-center w-full md:w-[480px] xl:w-[640px]">
            <div className="text-[33px] font-semibold">
                Forgotten Passwords?
                <div className="text-sm font-normal text-center">
                    No worries! We will send you your reset instructions
                </div>
            </div>
            <div className="w-full border-t" />
            <form className="flex flex-col gap-[10px] w-full">
                <Input
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
                <div className="flex flex-col w-full gap-[20px] mt-[60px]">
                    <Button className="bg-[#A8184C] text-md font-medium rounded-[33px]">
                        Reset Password
                    </Button>
                    <Link to="/signin" className="text-sm text-center">
                        <i className="fas fa-arrow-left" /> Back to Login
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default ForgotPassword
