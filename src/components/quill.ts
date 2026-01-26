import { Quill } from "react-quill";
import axios from "axios";

/**
 * VideoBlot: guarda un wrapper <div> con un <video> + <source>
 * Mucho más compatible con iOS que usar solo <video src="...">
 */
const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "div";
  static className = "videoWrap";

  static create(value: { url: string; width?: string; height?: string }) {
    const node = super.create() as HTMLDivElement;

    // wrapper styles
    node.style.position = "relative";
    node.style.width = "100%";
    node.style.margin = "10px auto";

    // video element
    const video = document.createElement("video");
    video.setAttribute("width", value.width || "100%");
    video.setAttribute("height", value.height || "315");
    video.setAttribute("controls", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "metadata");

    // autoplay en iOS solo suele funcionar si está muted
    // si NO quieres autoplay, puedes quitar las siguientes dos líneas:
    video.muted = true;
    // video.autoplay = true;

    video.style.maxWidth = "100%";
    video.style.display = "block";

    const source = document.createElement("source");
    source.setAttribute("src", value.url);

    // Si tu backend siempre te manda mp4, deja fijo.
    // Si no, podrías intentar inferir el type por mimetype en backend.
    source.setAttribute("type", "video/mp4");

    video.appendChild(source);
    node.appendChild(video);

    // Persistir data
    node.setAttribute("data-url", value.url);
    node.setAttribute("data-width", value.width || "100%");
    node.setAttribute("data-height", value.height || "315");

    return node;
  }

  static value(node: HTMLElement) {
    return {
      url: node.getAttribute("data-url") || "",
      width: node.getAttribute("data-width") || "100%",
      height: node.getAttribute("data-height") || "315",
    };
  }
}

Quill.register(VideoBlot);

/**
 * OJO: Esto es para YouTube/Vimeo (iframe).
 * Pero nuestro VideoBlot es <video>, no sirve para YouTube/Vimeo.
 * Así que: si quieres YouTube/Vimeo, crea otro blot iframe.
 * Por ahora, dejamos esto solo si lo usas aparte.
 */
export const convertToEmbedUrl = (url: string) => {
  let embedUrl = url;

  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return embedUrl;
};

export const useQuillVideoHandlers = (quillRef: {
  current: { getEditor: () => any } | null;
}) => {
  const insertVideoFromFile = async (
    uploadEndpoint: string | URL,
    headers: Record<string, string> = {},
  ) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "video/*");
    input.click();

    return new Promise<string | null>((resolve, reject) => {
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post(
            uploadEndpoint.toString(),
            formData,
            {
              headers: { ...headers },
            },
          );

          const rawUrl =
            response.data?.url ??
            response.data?.documentUrl ??
            response.data?.videoUrl ??
            response.data?.fileUrl;

          const videoUrl =
            typeof rawUrl === "string" &&
            rawUrl.trim() !== "" &&
            rawUrl !== "null"
              ? rawUrl
              : null;

          if (!videoUrl) {
            console.error("Upload video response:", response.data);
            throw new Error(
              "El backend no devolvió la URL del video (url/documentUrl).",
            );
          }

          const quill = quillRef.current?.getEditor();
          if (!quill) throw new Error("Quill editor not found");

          const range = quill.getSelection() || { index: 0 };

          quill.insertEmbed(range.index, "video", {
            url: videoUrl,
            width: "100%",
            height: "315",
          });

          quill.setSelection(range.index + 1);
          resolve(videoUrl);
        } catch (error: any) {
          reject(
            new Error(
              `Video upload failed: ${
                error.response?.data?.message || error.message
              }`,
            ),
          );
        }
      };
    });
  };

  // Handler para insertar video desde URL
  const insertVideoFromUrl = (
    promptText = "Ingresa la URL del video (YouTube, Vimeo, etc.):",
  ) => {
    const url = prompt(promptText);
    if (!url) return null;

    // Para no romper, lo insertamos como link en vez de video.
    // Si necesitas iframe, te hago el blot aparte.
    const quill = quillRef.current?.getEditor();
    if (!quill) return null;

    const range = quill.getSelection() || { index: 0 };
    quill.insertText(range.index, url, "link", url);
    quill.setSelection(range.index + url.length + 1);
    return url;
  };

  const insertImageFromFile = async (
    uploadEndpoint: string | URL,
    headers: Record<string, string> = {},
  ) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    return new Promise<string | null>((resolve, reject) => {
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post(
            uploadEndpoint.toString(),
            formData,
            {
              headers: { ...headers },
            },
          );

          const imageUrl = response.data?.imageUrl || response.data?.url;
          if (!imageUrl)
            throw new Error("El backend no devolvió la URL de la imagen.");

          const quill = quillRef.current?.getEditor();
          if (!quill) throw new Error("Quill editor not found");

          const range = quill.getSelection() || { index: 0 };
          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1);
          resolve(imageUrl);
        } catch (error: any) {
          reject(
            new Error(
              `Image upload failed: ${
                error.response?.data?.message || error.message
              }`,
            ),
          );
        }
      };
    });
  };

  const insertImageFromUrl = (promptText = "Ingresa la URL de la imagen:") => {
    const url = prompt(promptText);
    if (!url) return null;

    const quill = quillRef.current?.getEditor();
    if (!quill) return null;

    const range = quill.getSelection() || { index: 0 };
    quill.insertEmbed(range.index, "image", url);
    quill.setSelection(range.index + 1);
    return url;
  };

  return {
    insertVideoFromFile,
    insertVideoFromUrl,
    insertImageFromFile,
    insertImageFromUrl,
  };
};

export const getQuillConfig = () => ({
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  },
  formats: [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "video",
  ],
});

export default VideoBlot;
