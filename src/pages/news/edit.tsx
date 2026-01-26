import React, { useState, useEffect, useRef } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box, Group, Button } from "@mantine/core";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX, IconVideo } from "@tabler/icons-react";
import axios from "axios";
import { Dropzone as DocDropzone } from "@mantine/dropzone";
import { v4 as uuidv4 } from "uuid";
import { getQuillConfig, useQuillVideoHandlers } from "../../components/quill";
import { DateTimePicker } from "@mantine/dates";

type DocItem = { id: string; name: string; type: string; url: string };

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

const normalizeDocs = (docs: any): DocItem[] => {
  if (!Array.isArray(docs)) return [];
  return docs
    .map((d: any) => ({
      id: typeof d?.id === "string" && d.id ? d.id : uuidv4(),
      name: typeof d?.name === "string" ? d.name : "document",
      type: typeof d?.type === "string" ? d.type : "application/octet-stream",
      url: typeof d?.url === "string" ? d.url : "",
    }))
    .filter((d: DocItem) => d.url);
};

export const NewsEdit: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docLoading, setDocLoading] = useState(false);

  const [hasScheduledAt, setHasScheduledAt] = useState(false);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  // Ref para ReactQuill
  const quillRef = useRef<ReactQuill>(null);

  const {
    insertVideoFromFile,
    insertVideoFromUrl,
    insertImageFromFile,
    insertImageFromUrl,
  } = useQuillVideoHandlers(quillRef);

  const { modules, formats } = getQuillConfig();

  const {
    saveButtonProps,
    getInputProps,
    setFieldValue,
    refineCore: { queryResult },
    errors,
  } = useForm({
    refineCoreProps: {
      warnWhenUnsavedChanges: false,
    },
    initialValues: {
      title: "",
      content: "",
      organizationId: "",
      featuredImage: "",
      scheduledAt: null as Date | null,
      publishedAt: null as Date | null,
      documents: [] as DocItem[],
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      content: (value) => (value.length < 10 ? "Content is too short" : null),
    },
  });

  // Cargar valores desde API cuando queryResult esté listo
  useEffect(() => {
    const data = queryResult?.data?.data;
    if (!data) return;

    const {
      title,
      content,
      organizationId,
      featuredImage,
      scheduledAt,
      publishedAt,
      documents: docsFromApi,
    } = data;

    setFieldValue("title", title || "");
    setFieldValue("content", content || "");
    setFieldValue("organizationId", organizationId || "");
    setFieldValue("featuredImage", featuredImage || "");

    const initialDocs = normalizeDocs(docsFromApi);
    setDocuments(initialDocs);
    setFieldValue("documents", initialDocs);

    if (scheduledAt) {
      setHasScheduledAt(true);
      setFieldValue("scheduledAt", new Date(scheduledAt));
    } else {
      setHasScheduledAt(false);
      setFieldValue("scheduledAt", null);
    }

    if (publishedAt) {
      setFieldValue("publishedAt", new Date(publishedAt));
    } else {
      setFieldValue("publishedAt", null);
    }
  }, [queryResult?.data?.data, setFieldValue]);

  // Editor handlers
  const handleImageUploadInEditor = async () => {
    try {
      setLoadingImage(true);
      await insertImageFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/image",
        { "Content-Type": "multipart/form-data" },
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload the image.");
    } finally {
      setLoadingImage(false);
    }
  };

  const handleVideoUploadInEditor = async () => {
    try {
      setLoadingVideo(true);
      await insertVideoFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/document",
        { "Content-Type": "multipart/form-data" },
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload the video.");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleImageUrlInEditor = () =>
    insertImageFromUrl("Ingresa la URL de la imagen:");

  const handleVideoUrlInEditor = () =>
    insertVideoFromUrl("Ingresa la URL del video (YouTube, Vimeo, etc.):");

  // Featured image upload
  const handleFeaturedImageUpload = async () => {
    if (featuredImageFiles.length === 0) {
      alert("No files selected!");
      return;
    }

    const formData = new FormData();
    featuredImageFiles.forEach((file) => formData.append("file", file));

    try {
      setLoadingImage(true);
      const response = await axios.post(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setFieldValue("featuredImage", response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading featured image:", error);
      alert("Failed to upload the featured image.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Docs upload
  const handleDocUpload = async () => {
    if (docFiles.length === 0) {
      alert("No documents selected!");
      return;
    }

    setDocLoading(true);

    const uploadedDocs: DocItem[] = [];

    for (const file of docFiles) {
      const formData = new FormData();
      const sanitizedFileName = sanitizeFileName(file.name);

      // Recreate file with sanitized name
      const sanitizedFile = new File([file], sanitizedFileName, {
        type: file.type,
      });

      formData.append("file", sanitizedFile);

      try {
        const response = await axios.post(
          "https://lobster-app-uy9hx.ondigitalocean.app/upload/document",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        const url =
          response.data.url ||
          response.data.documentUrl ||
          response.data.imageUrl;

        if (!url) continue;

        uploadedDocs.push({
          id: uuidv4(),
          name: sanitizedFileName,
          type: file.type || "application/octet-stream",
          url,
        });
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Failed to upload a document.");
      }
    }

    const newDocs = [...documents, ...uploadedDocs];
    setDocuments(newDocs);
    setFieldValue("documents", newDocs);

    setDocFiles([]);
    setDocLoading(false);
  };

  const handleScheduledAtChange = (value: Date | null) => {
    setFieldValue("scheduledAt", value);
  };

  const handlePublishedAtChange = (value: Date | null) => {
    setFieldValue("publishedAt", value);
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter news title"
          {...getInputProps("title")}
          error={errors.title}
        />

        <Box mt="sm">
          <Text fw={500} size="sm" c="gray.7">
            Content
          </Text>

          <Group gap="xs" mb="sm">
            <Button
              type="button"
              size="xs"
              variant="light"
              leftSection={<IconPhoto size="1rem" />}
              onClick={handleImageUploadInEditor}
              loading={loadingImage}
            >
              Subir Imagen
            </Button>

            <Button
              type="button"
              size="xs"
              variant="light"
              leftSection={<IconVideo size="1rem" />}
              onClick={handleVideoUploadInEditor}
              loading={loadingVideo}
            >
              Subir Video
            </Button>

            <Button
              type="button"
              size="xs"
              variant="outline"
              leftSection={<IconPhoto size="1rem" />}
              onClick={handleImageUrlInEditor}
            >
              Imagen URL
            </Button>

            <Button
              type="button"
              size="xs"
              variant="outline"
              leftSection={<IconVideo size="1rem" />}
              onClick={handleVideoUrlInEditor}
            >
              Video URL
            </Button>
          </Group>

          <Box style={{ minHeight: "350px" }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={getInputProps("content").value || ""}
              onChange={(value) => setFieldValue("content", value)}
              modules={modules}
              formats={formats}
              style={{
                height: "300px",
                marginBottom: "40px",
                backgroundColor: "white",
              }}
              placeholder="Escribe aquí tu contenido..."
            />
          </Box>

          {errors.content && (
            <Text mt="xs" size="xs" c="red">
              {errors.content}
            </Text>
          )}

          {hasScheduledAt && (
            <DateTimePicker
              mt="sm"
              label="Scheduled At"
              placeholder="Select date and time for notification"
              value={getInputProps("scheduledAt").value}
              onChange={handleScheduledAtChange}
              error={errors.scheduledAt}
              minDate={new Date()}
              clearable
              description="Leave empty to send immediately, or select a future date/time to schedule"
            />
          )}

          <DateTimePicker
            mt="sm"
            label="Fecha de publicación"
            placeholder="Selecciona fecha y hora de publicación"
            value={getInputProps("publishedAt").value}
            onChange={handlePublishedAtChange}
            error={errors.publishedAt}
            clearable
            description="Define cuándo debe quedar visible/publicada la noticia"
          />
        </Box>

        <Box mt="sm">
          <Text fw={500} size="sm" mb="xs">
            Featured Image
          </Text>

          <Dropzone
            onDrop={(files) => setFeaturedImageFiles(files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group justify="center" gap="xl" style={{ minHeight: 120 }}>
              <Dropzone.Accept>
                <IconUpload size="2rem" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size="2rem" stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size="2rem" stroke={1.5} />
              </Dropzone.Idle>

              <div>
                {featuredImageFiles.length > 0 ? (
                  <Text size="sm">
                    {featuredImageFiles.map((file) => file.name).join(", ")}
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    Drag files here or click to upload
                  </Text>
                )}
              </div>
            </Group>
          </Dropzone>

          <Button
            type="button"
            mt="sm"
            fullWidth
            disabled={featuredImageFiles.length === 0}
            loading={loadingImage}
            onClick={handleFeaturedImageUpload}
          >
            Upload Featured Image
          </Button>

          {getInputProps("featuredImage").value && (
            <img
              src={getInputProps("featuredImage").value}
              alt="Featured"
              style={{
                marginTop: "10px",
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          )}
        </Box>

        <Box mt="md">
          <Text fw={500} size="sm" mb="xs">
            Documentos
          </Text>

          <DocDropzone
            onDrop={(files) => setDocFiles(files)}
            maxSize={10 * 1024 ** 2}
            accept={[
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-powerpoint",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/plain",
              "video/*",
            ]}
          >
            <Group justify="center" gap="xl" style={{ minHeight: 80 }}>
              <IconUpload size="2rem" stroke={1.5} />
              <div>
                {docFiles.length > 0 ? (
                  <Text size="sm">
                    {docFiles.map((file) => file.name).join(", ")}
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    Arrastra o haz click para cargar documentos y videos
                  </Text>
                )}
              </div>
            </Group>
          </DocDropzone>

          <Button
            type="button"
            mt="sm"
            fullWidth
            disabled={docFiles.length === 0}
            loading={docLoading}
            onClick={handleDocUpload}
          >
            Subir Documentos/Videos
          </Button>

          {documents.length > 0 && (
            <Box mt="sm">
              <Text size="sm" fw={500}>
                Documentos cargados:
              </Text>

              {documents.map((doc) => (
                <Group key={doc.id || doc.url} gap={8}>
                  <Text size="sm">{doc.name}</Text>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Text size="xs" c="blue">
                      Ver
                    </Text>
                  </a>
                </Group>
              ))}
            </Box>
          )}
        </Box>
      </form>
    </Edit>
  );
};
