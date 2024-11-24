import { Attachment as AttachmentTyping } from "@/types/ather"
import Attachment from "./attachment"

interface AttachmentProp {
    attachments: AttachmentTyping[]
}
  
const AttachmentHandler: React.FC<AttachmentProp> = ({
    attachments
}) => {
    return (
        <div>
            {attachments.map((attachment)=>(
                <Attachment key={attachment.id} attachment={attachment}/>
            ))}
        </div>
    )
}


export default AttachmentHandler