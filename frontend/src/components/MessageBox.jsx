export default function  MessageBox({
    isMe,
    content="",
}) {

    return (
        
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
        className={`
            max-w-[75%]
            px-4
            py-2
            rounded-2xl
            text-sm
            shadow
            ${
                isMe ?
                "bg-black text-white rounded-br-sm"
                : "bg-white text-black rounded-bl-sm border"
          }
          `}
          >
          {content}
          </div>
          </div>
        );


        // <div className={`message-box ${mode === "received" ? "bg-green-300" : "bg-blue-300" } text-white`}>
        //     {content}
        // </div>
    }