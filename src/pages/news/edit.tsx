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

// Importar el VideoBlot y los helpers


export const NewsEdit: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [hasScheduledAt, setHasScheduledAt] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [documents, setDocuments] = useState<
    { id: string; name: string; type: string; url: string }[]
  >([]);
  
  // Ref para ReactQuill
  const quillRef = useRef<ReactQuill>(null);

  // Usar el hook personalizado para manejar videos e imágenes en el editor
  const {
    insertVideoFromFile,
    insertVideoFromUrl,
    insertImageFromFile,
    insertImageFromUrl,
  } = useQuillVideoHandlers(quillRef);

  // Obtener configuración predeterminada de Quill
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
      documents: [] as { id: string; name: string; type: string; url: string }[],
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      content: (value) => (value.length < 10 ? "Content is too short" : null),
    },
  });

  // Actualizar los valores del formulario cuando queryResult esté disponible
  useEffect(() => {
    if (queryResult?.data?.data) {
      const {
        title,
        content,
        organizationId,
        featuredImage,
        scheduledAt,
        documents: docsFromApi,
      } = queryResult.data.data;
      setFieldValue("title", title || "");
      setFieldValue("content", content || "");
      setFieldValue("organizationId", organizationId || "");
      setFieldValue("featuredImage", featuredImage || "");
      const initialDocuments = Array.isArray(docsFromApi) ? docsFromApi : [];
      setFieldValue("documents", initialDocuments);
      setDocuments(initialDocuments);
      if (scheduledAt) {
        setHasScheduledAt(true);
        setFieldValue("scheduledAt", new Date(scheduledAt));
      }
    }
  }, [queryResult?.data?.data, setFieldValue]);

  // Handlers para el editor de texto enriquecido
  const handleImageUploadInEditor = async () => {
    try {
      setLoadingImage(true);
      await insertImageFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/image",
        { 'Content-Type': 'multipart/form-data' }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload the image.');
    } finally {
      setLoadingImage(false);
    }
  };

  const handleVideoUploadInEditor = async () => {
    try {
      setLoadingVideo(true);
      await insertVideoFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/document",
        { 'Content-Type': 'multipart/form-data' }
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload the video.');
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleImageUrlInEditor = () => {
    insertImageFromUrl('Ingresa la URL de la imagen:');
  };

  const handleVideoUrlInEditor = () => {
    insertVideoFromUrl('Ingresa la URL del video (YouTube, Vimeo, etc.):');
  };

  // Manejar la carga de imágenes destacadas
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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFieldValue("featuredImage", response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading featured image:", error);
      alert("Failed to upload the featured image.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Manejar la carga de documentos
  const sanitizeFileName = (fileName: string) =>
    fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const handleDocUpload = async () => {
    if (docFiles.length === 0) {
      alert("No documents selected!");
      return;
    }

    setDocLoading(true);
    const uploadedDocs: { id: string; name: string; type: string; url: string }[] = [];

    for (const file of docFiles) {
      const formData = new FormData();
      const sanitizedFileName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });
      formData.append("file", sanitizedFile);

      try {
        const response = await axios.post(
          "https://lobster-app-uy9hx.ondigitalocean.app/upload/document",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedDocs.push({
          id: uuidv4(),
          name: sanitizedFileName,
          type: file.type,
          url: response.data.url || response.data.documentUrl || response.data.imageUrl,
        });
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Failed to upload a document.");
      }
    }

    const newDocs = [...documents, ...uploadedDocs];
    setDocuments(newDocs);
    setDocFiles([]);
    setDocLoading(false);
    setFieldValue("documents", newDocs);
  };

  const handleScheduledAtChange = (value: Date | null) => {
    setFieldValue("scheduledAt", value);
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        {/* Título */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter news title"
          {...getInputProps("title")}
          error={errors.title}
        />

        {/* Editor de contenido con componente reutilizable */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Content
          </Text>
          
          {/* Botones para insertar media en el editor */}
          <Group spacing="xs" mb="sm">
            <Button
              size="xs"
              variant="light"
              leftIcon={<IconPhoto size="1rem" />}
              onClick={handleImageUploadInEditor}
              loading={loadingImage}
            >
              Subir Imagen
            </Button>
            <Button
              size="xs"
              variant="light"
              leftIcon={<IconVideo size="1rem" />}
              onClick={handleVideoUploadInEditor}
              loading={loadingVideo}
            >
              Subir Video
            </Button>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<IconPhoto size="1rem" />}
              onClick={handleImageUrlInEditor}
            >
              Imagen URL
            </Button>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<IconVideo size="1rem" />}
              onClick={handleVideoUrlInEditor}
            >
              Video URL
            </Button>
          </Group>

          {/* ReactQuill con configuración del VideoBlot */}
          <Box style={{ minHeight: '350px' }}>
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
                backgroundColor: "white"
              }}
              placeholder="Escribe aquí tu contenido..."
            />
          </Box>
          
          {errors.content && (
            <Text mt="xs" size="xs" color="red">
              {errors.content}
            </Text>
          )}
           {/* Fecha programada - Solo mostrar si existe en los datos originales */}
                  {hasScheduledAt && (
                    <DateTimePicker
                      mt="sm"
                      label="Scheduled At"
                      placeholder="Select date and time for notification"
                      value={getInputProps("scheduledAt").value}
                      onChange={handleScheduledAtChange}
                      error={errors.scheduledAt}
                      minDate={new Date()} // No permite fechas pasadas
                      clearable
                      description="Leave empty to send immediately, or select a future date/time to schedule"
                      onPointerEnterCapture={undefined} 
                      onPointerLeaveCapture={undefined}
                    />
                  )}
        </Box>

        {/* Imagen destacada */}
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Featured Image
          </Text>
          <Dropzone
            onDrop={(files) => setFeaturedImageFiles(files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group position="center">
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
                  <Text size="sm" color="dimmed">
                    Drag files here or click to upload
                  </Text>
                )}
              </div>
            </Group>
          </Dropzone>
          <Button
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

        {/* Documentos */}
        <Box mt="md">
          <Text weight={500} size="sm" mb="xs">
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
              "video/*", // Agregamos soporte para videos
            ]}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 80 }}>
              <IconUpload size="2rem" stroke={1.5} />
              <div>
                {docFiles.length > 0 ? (
                  <Text size="sm">
                    {docFiles.map((file) => file.name).join(", ")}
                  </Text>
                ) : (
                  <Text size="sm" color="dimmed">
                    Arrastra o haz click para cargar documentos y videos
                  </Text>
                )}
              </div>
            </Group>
          </DocDropzone>
          <Button
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
              <Text size="sm" weight={500}>Documentos cargados:</Text>
              {documents.map((doc) => (
                <Group key={doc.id || doc.url} spacing={8}>
                  <Text size="sm">{doc.name}</Text>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Text size="xs" color="blue">Ver</Text>
                  </a>
                </Group>
              ))}
            </Box>
          )}
        </Box>

        {/* Campo oculto para documentos */}
        <input
          type="hidden"
          {...getInputProps("documents")}
          value={JSON.stringify(documents)}
        />
      </form>
    </Edit>
  );
};