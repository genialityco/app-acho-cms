import React, { useState } from "react";
import { Create, useForm } from "@refinedev/mantine";
import {
  TextInput,
  Textarea,
  Box,
  Button,
  Group,
  Text,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto } from "@tabler/icons-react";
import axios from "axios";

export const HighlightCreate: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const { saveButtonProps, getInputProps, setFieldValue, errors } = useForm({
    initialValues: {
      name: "",
      description: "",
      imageUrl: "",
      vimeoUrl: "https://player.vimeo.com/video/",
      organizationId: "66f1d236ee78a23c67fada2a",
      eventId: "6807d5a91c2e1e14b22da8b0",
      transcription: "", // Campo para la transcripción
    },
    validate: {
      name: (value) => (value.length < 3 ? "Name is too short" : null),
      description: (value) => (value.length < 5 ? "Description is too short" : null),
      vimeoUrl: (value) => (!value.startsWith("https://") ? "Invalid URL" : null),
      transcription: (value) => (value.length < 10 ? "Transcription is too short" : null),
    },
  });

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

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
      const imageUrl = response.data.imageUrl;
      setFieldValue("imageUrl", imageUrl);
      setUploadedImage(imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        {/* Nombre del highlight */}
        <TextInput
          mt="sm"
          label="Name"
          placeholder="Enter highlight name"
          {...getInputProps("name")}
          error={errors.name}
        />

        {/* Descripción */}
        <Textarea
          mt="sm"
          label="Description"
          placeholder="Enter highlight description"
          {...getInputProps("description")}
          error={errors.description}
        />

        {/* URL de Vimeo */}
        <TextInput
          mt="sm"
          label="Video URL"
          placeholder="Enter Vimeo video URL"
          {...getInputProps("vimeoUrl")}
          error={errors.vimeoUrl}
        />

        {/* Organization ID */}
        <TextInput
          mt="sm"
          label="Organization ID"
          placeholder="Enter organization ID"
          {...getInputProps("organizationId")}
        />

        {/* Event ID */}
        <TextInput
          mt="sm"
          label="Event ID"
          placeholder="Enter event ID"
          {...getInputProps("eventId")}
        />

        {/* Campo para Transcripción */}
        <Textarea
          mt="sm"
          label="Transcript"
          placeholder="Enter video transcription (WEBVTT format)"
          minRows={6}
          {...getInputProps("transcription")}
          error={errors.transcription}
        />

        {/* Dropzone para la imagen */}
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Image Upload
          </Text>
          <Dropzone
            onDrop={(files) => handleFileUpload(files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120 }}>
              <IconPhoto size="2rem" stroke={1.5} />
              <div>
                <Text size="sm" color="dimmed">
                  Drag files here or click to upload
                </Text>
              </div>
            </Group>
          </Dropzone>
          <Button
            mt="sm"
            fullWidth
            disabled={loadingImage}
            loading={loadingImage}
            onClick={() => alert("Uploading image...")}
          >
            Upload Image
          </Button>
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded"
              style={{
                marginTop: "10px",
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </form>
    </Create>
  );
};
