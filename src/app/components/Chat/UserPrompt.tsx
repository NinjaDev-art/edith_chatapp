// import { FiEdit3 } from "react-icons/fi";
const UserPrompt = ({ prompt }: { prompt: string }) => {

  return (
    <div className="pl-20 flex justify-end">
      <div className="flex items-start justify-between h-full gap-4 py-2 md:py-4 md:px-6 px-4 rounded-l-lg rounded-tr-lg w-fit bg-inputBg group text-mainFont">
        <span className="flex-1 text-lg">{prompt}</span>
        {/* <button className="p-0 text-transparent transition-colors duration-100 ease-linear bg-transparent border-none group-hover:text-mainFont">
        <FiEdit3 size={20} />
      </button> */}
      </div>
    </div>
  )
}

export default UserPrompt