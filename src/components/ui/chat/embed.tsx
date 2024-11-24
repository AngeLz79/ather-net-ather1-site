import { Embed as EmbedTyping } from "@/types/ather";

import TextHandler from "./textHander"

interface EmbedProps {
    embed: EmbedTyping;
}

function intToRGB(colorInt: number) {
    const red = (colorInt >> 16) & 255;
    const green = (colorInt >> 8) & 255;
    const blue = colorInt & 255;
    return [red, green, blue];
}  
  
const Embed: React.FC<EmbedProps> = ({
    embed
}) => {
    return (
        <div key={Math.random()} className="chatlog__embed">
            {embed.color ? (
            <div 
                className="chatlog__embed-color-pill"
                style={{ backgroundColor: `rgba(${intToRGB(embed.color).join(',')}, 255)` }}
            />
            ) : (
            <div className="chatlog__embed-color-pill--default" />
            )}
            <div className="chatlog__embed-content-container">
                <div className="chatlog__embed-text">
                {embed.url ? (
                    <a href={embed.url} className="chatlog__embed-title-link">
                    <div className="chatlog__markdown chatlog__markdown-preserve">
                        <TextHandler text={embed.title}/>
                    </div>
                    </a>
                ) : (
                    <span className="chatlog__embed-title-link">
                    <div className="chatlog__markdown chatlog__markdown-preserve">
                        <TextHandler text={embed.title}/>
                    </div>
                    </span>
                )}
                {embed.description && (
                    <div className="chatlog__embed-description">
                    <div className="chatlog__markdown chatlog__markdown-preserve">
                        <TextHandler text={embed.description}/>
                    </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}


export default Embed