import React, { useEffect, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

type LogEventCallback = (event: { message: string }) => void;

interface FFmpegLogComponentProps {
  ffmpegRef: React.MutableRefObject<FFmpeg | null>;
  messageRef: React.MutableRefObject<HTMLDivElement | null>;
}

const FFmpegLogComponent: React.FC<FFmpegLogComponentProps> = ({
  ffmpegRef,
  messageRef,
}) => {
  useEffect(() => {
    if (!ffmpegRef.current || !messageRef.current) return;

    const ffmpeg = ffmpegRef.current;

    // Event listener for FFmpeg log messages
    const logEventHandler: LogEventCallback = ({ message }) => {
      if (messageRef.current) {
        messageRef.current.innerHTML = message; // Update messageRef with new log message
      }
    };

    // Add event listener
    ffmpeg.on("log", logEventHandler);

    // Clean up
    return () => {
      // Remove event listener
      ffmpeg.off("log", logEventHandler);
    };
  }, [ffmpegRef, messageRef]);

  return null; // FFmpegLogComponent does not render anything visible
};

export default FFmpegLogComponent;

// should use this to handle the compoenent not yet decided
{
  /* Include the FFmpegLogComponent */
}
{
  /* <FFmpegLogComponent ffmpegRef={ffmpegRef} messageRef={messageRef} /> */
}
