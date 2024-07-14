import { useEffect, useRef, useState } from "react";
import { ImSpinner3 } from "react-icons/im";
import { MdClose } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { BiError } from "react-icons/bi";
import { HiOutlineDownload } from "react-icons/hi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Action } from "@/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import bytesToSize from "../../utils/bytes-to-size";
import compressFileName from "../../utils/compress-file-name";
import convertFile from "../../utils/convert";
import fileToIcon from "../../utils/file-to-icon";
import loadFfmpeg from "../../utils/load-ffmpeg";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

interface FileActionsProps {
  actions: Action[];
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
  is_loaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  ffmpegRef: React.MutableRefObject<FFmpeg | null>;
  defaultValues: string;
  setDefaultValues: React.Dispatch<React.SetStateAction<string>>;
  extensions: {
    image: string[];
    video: string[];
    audio: string[];
  };
}

const FileActions: React.FC<FileActionsProps> = ({
  actions,
  setActions,
  is_loaded,
  setIsLoaded,
  ffmpegRef,
  defaultValues,
  setDefaultValues,
  extensions,
}) => {
  const { toast } = useToast();
  const [is_ready, setIsReady] = useState<boolean>(false);
  const [is_converting, setIsConverting] = useState<boolean>(false);
  const [is_done, setIsDone] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("");
  const [is_hover, setIsHover] = useState<boolean>(false);
  const reset = () => {
    setIsDone(false);
    setActions([]);
  };

  const downloadAll = (): void => {
    for (let action of actions) {
      !action.is_error && download(action);
    }
  };

  const download = (action: Action) => {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = action.url!;
    a.download = action.output!;

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(action.url!);
    document.body.removeChild(a);
  };

  const convert = async (): Promise<any> => {
    let tmp_actions = actions.map((elt) => ({
      ...elt,
      is_converting: true,
    }));
    setActions(tmp_actions);
    setIsConverting(true);
    for (let action of tmp_actions) {
      try {
        const { url, output } = await convertFile(ffmpegRef.current!, action);
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: true,
                is_converting: false,
                url,
                output,
              }
            : elt,
        );
        setActions(tmp_actions);
      } catch (err) {
        tmp_actions = tmp_actions.map((elt) =>
          elt === action
            ? {
                ...elt,
                is_converted: false,
                is_converting: false,
                is_error: true,
              }
            : elt,
        );
        setActions(tmp_actions);
      }
    }
    setIsDone(true);
    setIsConverting(false);
  };

  const handleUpload = (data: any[]): void => {
    const tmp: Action[] = [];
    data.forEach((file: any) => {
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

  const updateAction = (file_name: string, to: string) => {
    setActions(
      actions.map((action): Action => {
        if (action.file_name === file_name) {
          return {
            ...action,
            to,
          };
        }
        return action;
      }),
    );
  };

  const checkIsReady = (): void => {
    let tmp_is_ready = true;
    actions.forEach((action: Action) => {
      if (!action.to) tmp_is_ready = false;
    });
    setIsReady(tmp_is_ready);
  };

  const deleteAction = (action: Action): void => {
    setActions(actions.filter((elt) => elt !== action));
  };

  useEffect(() => {
    if (!actions.length) {
      setIsDone(false);
    } else {
      checkIsReady();
    }
  }, [actions]);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
    setIsLoaded(true);
  };

  return (
    <div className="space-y-6">
      {actions.map((action: Action, i: number) => (
        <div
          key={i}
          className="w-full py-4 space-y-2 lg:py-0 relative cursor-pointer rounded-xl border h-fit lg:h-20 px-4 lg:px-10 flex flex-wrap lg:flex-nowrap items-center justify-between"
        >
          {!is_loaded && (
            <div className="h-full w-full -ml-10 cursor-progress absolute rounded-xl">
              Loading...
            </div>
          )}
          <div className="flex gap-4 items-center">
            <span className="text-2xl text-orange-600">
              {fileToIcon(action.file_type)}
            </span>
            <div className="flex items-center gap-1 w-96">
              <span className="text-md font-medium overflow-x-hidden">
                {compressFileName(action.file_name)}
              </span>
              <span className="text-muted-foreground text-sm">
                ({bytesToSize(action.file_size)})
              </span>
            </div>
          </div>

          {action.is_error ? (
            <Badge variant="destructive" className="flex gap-2">
              <span>Error Converting File</span>
              <BiError />
            </Badge>
          ) : action.is_converted ? (
            <Badge variant="default" className="flex gap-2 bg-green-500">
              <span>Done</span>
              <MdDone />
            </Badge>
          ) : action.is_converting ? (
            <Badge variant="default" className="flex gap-2">
              <span>Converting</span>
              <span className="animate-spin">
                <ImSpinner3 />
              </span>
            </Badge>
          ) : (
            <div className="text-muted-foreground text-md flex items-center gap-4">
              <span>Convert to</span>
              <Select
                onValueChange={(value: any) => {
                  if (extensions.audio.includes(value)) {
                    setDefaultValues("audio");
                  } else if (extensions.video.includes(value)) {
                    setDefaultValues("video");
                  }
                  setSelected(value);
                  updateAction(action.file_name!, value);
                }}
                value={selected}
              >
                <SelectTrigger className="w-32 outline-none focus:outline-none focus:ring-0 text-center text-muted-foreground bg-background text-md font-medium">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent className="h-fit">
                  {action.file_type!.includes("image") && (
                    <div className="grid grid-cols-2 gap-2 w-fit">
                      {extensions.image.map((elt, i) => (
                        <div key={i} className="col-span-1 text-center">
                          <SelectItem value={elt} className="mx-auto">
                            {elt}
                          </SelectItem>
                        </div>
                      ))}
                    </div>
                  )}
                  {action.file_type!.includes("video") && (
                    <Tabs defaultValue={defaultValues} className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="video" className="w-full">
                          Video
                        </TabsTrigger>
                        <TabsTrigger value="audio" className="w-full">
                          Audio
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="video">
                        <div className="grid grid-cols-3 gap-2 w-fit">
                          {extensions.video.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="audio">
                        <div className="grid grid-cols-3 gap-2 w-fit">
                          {extensions.audio.map((elt, i) => (
                            <div key={i} className="col-span-1 text-center">
                              <SelectItem value={elt} className="mx-auto">
                                {elt}
                              </SelectItem>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                  {action.file_type!.includes("audio") && (
                    <div className="grid grid-cols-2 gap-2 w-fit">
                      {extensions.audio.map((elt, i) => (
                        <div key={i} className="col-span-1 text-center">
                          <SelectItem value={elt} className="mx-auto">
                            {elt}
                          </SelectItem>
                        </div>
                      ))}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {action.is_converted ? (
            <Button variant="outline" onClick={() => download(action)}>
              Download
            </Button>
          ) : (
            <span
              onClick={() => deleteAction(action)}
              className="cursor-pointer hover:bg-muted rounded-full h-10 w-10 flex items-center justify-center text-2xl text-foreground"
            >
              <MdClose />
            </span>
          )}
        </div>
      ))}
      <div className="flex w-full justify-end">
        {is_done ? (
          <div className="space-y-4 w-fit">
            <Button
              size="lg"
              className="rounded-xl font-semibold relative py-4 text-md flex gap-2 items-center w-full"
              onClick={downloadAll}
            >
              {actions.length > 1 ? "Download All" : "Download"}
              <HiOutlineDownload />
            </Button>
            <Button
              size="lg"
              onClick={reset}
              variant="outline"
              className="rounded-xl"
            >
              Convert Another File(s)
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            disabled={!is_ready || is_converting}
            className="rounded-xl font-semibold relative py-4 text-md flex items-center w-44"
            onClick={convert}
          >
            {is_converting ? (
              <span className="animate-spin text-lg">
                <ImSpinner3 />
              </span>
            ) : (
              <span>Convert Now</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileActions;
