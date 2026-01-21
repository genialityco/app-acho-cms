import { Quill } from "react-quill";
import axios from "axios";

// Registrar el blot de video personalizado para Quill
const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "video";

  static create(value: { url: any; width: any; height: any }) {
    let node = super.create();
    node.setAttribute("src", value.url);
    node.autoplay = true;
    node.muted = true;
    node.playsInline = true;
    node.loop = true;
    node.setAttribute("width", value.width || "100%");
    node.setAttribute("height", value.height || "315");
    node.style.maxWidth = "100%";
    node.style.display = "block";
    node.style.margin = "10px auto";
    return node;
  }

  static value(node: { getAttribute: (arg0: string) => any }) {
    return {
      url: node.getAttribute("src"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}

// Registrar el blot
Quill.register(VideoBlot);

// Función helper para convertir URLs a formato embed
export const convertToEmbedUrl = (url: string) => {
  let embedUrl = url;

  // Convertir URLs de YouTube a formato embed
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    if (videoId) {
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  return embedUrl;
};

// Hook personalizado para manejo de videos en ReactQuill
export const useQuillVideoHandlers = (quillRef: {
  current: { getEditor: () => any };
}) => {
  // Handler para insertar video desde archivo
  const insertVideoFromFile = async (
    uploadEndpoint: string | URL,
    headers = {},
  ) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "video/*");
    input.click();

    return new Promise((resolve, reject) => {
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const formData = new FormData();
        formData.append("file", file); // Ensure 'file' matches server expectation

        try {
          const response = await axios.post(
            uploadEndpoint.toString(),
            formData,
            {
              headers: {
                ...headers,
                // Axios automatically sets Content-Type for FormData, so no need to specify
              },
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
          if (quill && videoUrl) {
            const range = quill.getSelection() || { index: 0 };
            quill.insertEmbed(range.index, "video", {
              url: videoUrl,
              width: "100%",
              height: "315",
            });
            quill.setSelection(range.index + 1);
            resolve(videoUrl);
          } else {
            reject(
              new Error("No video URL received or Quill editor not found"),
            );
          }
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
    if (url) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const embedUrl = convertToEmbedUrl(url);

        // Usar el blot personalizado de video
        quill.insertEmbed(range?.index || 0, "video", {
          url: embedUrl,
          width: "100%",
          height: "315",
        });

        // Mover el cursor después del video
        quill.setSelection((range?.index || 0) + 1);
        return embedUrl;
      }
    }
    return null;
  };

  // Handler para insertar imagen desde archivo
  const insertImageFromFile = async (
    uploadEndpoint: string | URL,
    headers = {},
  ) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    return new Promise((resolve, reject) => {
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const formData = new FormData();
        formData.append("file", file); // Ensure 'file' matches server expectation

        try {
          const response = await axios.post(
            uploadEndpoint.toString(),
            formData,
            {
              headers: {
                ...headers,
                // Axios automatically sets Content-Type for FormData
              },
            },
          );

          const imageUrl = response.data.imageUrl || response.data.url;

          const quill = quillRef.current?.getEditor();
          if (quill && imageUrl) {
            const range = quill.getSelection() || { index: 0 };
            quill.insertEmbed(range.index, "image", imageUrl);
            quill.setSelection(range.index + 1);
            resolve(imageUrl);
          } else {
            reject(
              new Error("No image URL received or Quill editor not found"),
            );
          }
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

  // Handler para insertar imagen desde URL
  const insertImageFromUrl = (promptText = "Ingresa la URL de la imagen:") => {
    const url = prompt(promptText);
    if (url) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        quill.insertEmbed(range?.index || 0, "image", url);
        return url;
      }
    }
    return null;
  };

  return {
    insertVideoFromFile,
    insertVideoFromUrl,
    insertImageFromFile,
    insertImageFromUrl,
  };
};

// Configuración predeterminada para ReactQuill con soporte de video
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
