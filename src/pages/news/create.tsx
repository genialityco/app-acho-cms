import React, { useState } from "react";
import { Create, useForm } from "@refinedev/mantine";
import {
  TextInput,
  Textarea,
  Box,
  Text,
  Group,
  Button,
} from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";
import { Dropzone as DocDropzone } from "@mantine/dropzone";
import { v4 as uuidv4 } from "uuid";

export const NewsCreate: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [documents, setDocuments] = useState<
    { id: string; name: string; type: string; url: string }[]
  >([]);

  const { saveButtonProps, getInputProps, setFieldValue, errors } = useForm({
    initialValues: {
      title: "",
      content: "",
      organizationId: "66f1d236ee78a23c67fada2a", // Default organization ID
      featuredImage: "",
      documents: [],
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      content: (value) => (value.length < 10 ? "Content is too short" : null),
    },
  });

  // Manejar la carga de imágenes
  const handleImageUpload = async () => {
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
      console.error("Error uploading image:", error);
      alert("Failed to upload the image.");
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

    setDocuments((prev) => [...prev, ...uploadedDocs]);
    setDocFiles([]);
    setDocLoading(false);
    setFieldValue("documents", [...documents, ...uploadedDocs]);
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        {/* Título */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter news title"
          {...getInputProps("title")}
          error={errors.title}
        />

        {/* Contenido */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Content
          </Text>
          <MDEditor data-color-mode="light" {...getInputProps("content")} />
          {errors.content && (
            <Text mt="xs" size="xs" color="red">
              {errors.content}
            </Text>
          )}
        </Box>

        {/* Imagen destacada */}
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Featured Image
          </Text>
          <Dropzone
            onDrop={(files) => setFeaturedImageFiles(files)}
            maxSize={3 * 1024 ** 2} // Tamaño máximo: 3 MB
            accept={IMAGE_MIME_TYPE}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120 }}>
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
            onClick={handleImageUpload}
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
                    Arrastra o haz click para cargar documentos (PDF, Word, Excel, etc.)
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
            Subir Documentos
          </Button>
          {documents.length > 0 && (
            <Box mt="sm">
              <Text size="sm" weight={500}>Documentos cargados:</Text>
              {documents.map((doc) => (
                <Group key={doc.id} spacing={8}>
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
        <input type="hidden" {...getInputProps("documents")} value={JSON.stringify(documents)} />
      </form>
    </Create>
  );
};
