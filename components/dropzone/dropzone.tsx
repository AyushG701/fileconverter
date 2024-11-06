import React, { useState, useRef, useEffect } from "react";
import DropzoneUploader from "./DropzoneUploader";
import FileActions from "./FileActions";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { Action } from "@/types";
// interface Action {
//   file_name: string;
//   file_size: number;
//   from: string;
//   to: string | null;
//   file_type: string;
//   file: File;
//   is_converted: boolean;
//   is_converting: boolean;
//   is_error: boolean;
// }

const Dropzone: React.FC = () => {
  // State management
  const { toast } = useToast();
  const [is_hover, setIsHover] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [is_loaded, setIsLoaded] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const ffmpegRef = useRef<any>(null); // Adjust type according to your usage
  const [defaultValues, setDefaultValues] = useState<string>("video");

  const extensions = {
    image: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "ico",
      "tif",
      "tiff",
      "svg",
      "raw",
      "tga",
    ],
    video: [
      "mp4",
      "m4v",
      "mp4v",
      "3gp",
      "3g2",
      "avi",
      "mov",
      "wmv",
      "mkv",
      "flv",
      "ogv",
      "webm",
      "h264",
      "264",
      "hevc",
      "265",
    ],
    audio: ["mp3", "wav", "ogg", "aac", "wma", "flac", "m4a"],
  };

  // Event handlers
  const handleUpload = (data: File[]): void => {
    handleExitHover();
    setFiles(data);
    const tmp: Action[] = [];
    data.forEach((file) => {
      tmp.push({
        file_name: file.name,
        file_size: file.size,
        from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
        to: null,
        file_type: file.type,
        file,
        is_converted: false,
        is_converting: false,
        is_error: false,
      });
    });
    setActions(tmp);
  };

  const handleHover = (): void => setIsHover(true);
  const handleExitHover = (): void => setIsHover(false);

  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
      setIsReady(false);
      setIsConverting(false);
    } else checkIsReady();
  }, [actions]);

  const checkIsReady = (): void => {
    let tmp_is_ready: boolean = true;
    actions.forEach((action) => {
      if (!action.to) tmp_is_ready = false;
    });
    setIsReady(tmp_is_ready);
  };

  return (
    <div className="space-y-6">
      {actions.length ? (
        <FileActions
          actions={actions}
          setActions={setActions}
          is_loaded={is_loaded}
          setIsLoaded={setIsLoaded}
          ffmpegRef={ffmpegRef}
          defaultValues={defaultValues}
          setDefaultValues={setDefaultValues}
          extensions={extensions}
        />
      ) : (
        <DropzoneUploader
          handleUpload={handleUpload}
          handleHover={handleHover}
          handleExitHover={handleExitHover}
        />
      )}
    </div>
  );
};

export default Dropzone;
