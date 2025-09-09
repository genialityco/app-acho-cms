import React, { useState } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Textarea, Box, Button, Text, Group } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";

export const HighlightEdit: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    saveButtonProps,
    getInputProps,
    setFieldValue,
    refineCore: { queryResult },
    errors,
  } = useForm({
    initialValues: {
      name: "",
      description: "",
      vimeoUrl: "",
      imageUrl: "",
      organizationId: "",
      eventId: "",
      transcription: "", // Campo para la transcripción
    },
    validate: {
      name: (value) => (value.length < 3 ? "Name is too short" : null),
      description: (value) => (value.length < 10 ? "Description is too short" : null),
      vimeoUrl: (value) => (!value.startsWith("https://") ? "Invalid URL" : null),
      transcription: (value) => (value.length < 10 ? "Transcription is too short" : null),
    },
  });

  const { data } = queryResult;

  React.useEffect(() => {
    if (data) {
      const {
        name,
        description,
        vimeoUrl,
        imageUrl,
        organizationId,
        eventId,
        transcription,
      } = data.data;
      setFieldValue("name", name);
      setFieldValue("description", description);
      setFieldValue("vimeoUrl", vimeoUrl);
      setFieldValue("imageUrl", imageUrl);
      setFieldValue("organizationId", organizationId);
      setFieldValue("eventId", eventId);
      setFieldValue("transcription", transcription); 
    }
    console.log("highlight data", data);
  }, [data, setFieldValue]);

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) {
      alert("No files selected!");
      return;
    }

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("file", file));

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
      setFieldValue("imageUrl", response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        {/* Nombre del Highlight */}
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

        {/* Vimeo URL */}
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

        {/* Campo de Transcripción */}
        <Textarea
          mt="sm"
          label="Transcript"
          placeholder="Enter video transcription (WEBVTT format)"
          minRows={6}
          {...getInputProps("transcription")}
          error={errors.transcription}
        />

        {/* Imagen con Dropzone */}
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Image Upload
          </Text>
          <Dropzone
            onDrop={(files) => setImageFiles(files)}
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
                {imageFiles.length > 0 ? (
                  <Text size="sm">
                    {imageFiles.map((file) => file.name).join(", ")}
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
            disabled={imageFiles.length === 0}
            loading={loadingImage}
            onClick={handleImageUpload}
          >
            Upload Image
          </Button>
          {getInputProps("imageUrl").value && (
            <img
              src={getInputProps("imageUrl").value}
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
    </Edit>
  );
};
