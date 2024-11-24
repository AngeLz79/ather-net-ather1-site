import { Attachment as AttachmentTyping } from "@/types/ather"

interface AttachmentProp {
    attachment: AttachmentTyping
}
  
const Attachment: React.FC<AttachmentProp> = ({
    attachment
}) => {
    return (
        <div className="chatlog__attachment">
        {attachment.contentType?.includes("image/") ? (
            <div>
                <img
                    src={`https://zero.ather1.net/${attachment.url}`} 
                    className="chatlog__attachment-media" 
                    alt={"image"}
                />
            </div>
        ) : attachment.contentType?.includes("video/") ? (
            <div>
                <video src={`https://zero.ather1.net/${attachment.url}`} controls={true} className="chatlog__attachment-media" />
            </div>
        ) : (
            <div className="chatlog__attachment-generic">
                <a href={`https://zero.ather1.net/${attachment.url}`}>{`${attachment.name || attachment.url}`}</a>
            </div>
        )}
        </div>
    )
}


export default Attachment