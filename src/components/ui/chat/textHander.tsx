interface textProps {
    text: string | undefined;
}

const TextHandler: React.FC<textProps> = ({
    text
}) => {
    // ... your text handling logic (e.g., markdown processing)
    return (
        <span>{text}</span>
    );
}

export default TextHandler;