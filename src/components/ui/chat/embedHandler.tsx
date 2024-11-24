import { Embed as EmbedTyping } from "@/types/ather"
import Embed from "./embed"

interface EmbedProps {
    embeds: EmbedTyping[]
}
  
const EmbedHandler: React.FC<EmbedProps> = ({
    embeds
}) => {
    return (
        <div className="chatlog__embeds">
            {embeds.map((embed,index) => (
                <Embed key={index} embed={embed}/>
            ))}
        </div>
    )
}


export default EmbedHandler