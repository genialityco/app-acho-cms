import React, { useState } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box, Group, Button } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";

export const NewsEdit: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [featuredImageFiles, setFeaturedImageFiles] = useState<File[]>([]);

  const {
    saveButtonProps,
    getInputProps,
    setFieldValue,
    refineCore: { queryResult },
    errors,
  } = useForm({
    initialValues: {
      title: "",
      content: "",
      organizationId: "",
      featuredImage: "",
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      content: (value) => (value.length < 10 ? "Content is too short" : null),
    },
  });

  // Cargar datos iniciales del backend
  const { data } = queryResult;

  React.useEffect(() => {
    if (data) {
      const { title, content, organizationId, featuredImage } = data.data;
      setFieldValue("title", title);
      setFieldValue("content", content);
      setFieldValue("organizationId", organizationId);
      setFieldValue("featuredImage", featuredImage);
    }
  }, [data, setFieldValue]);

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
      </form>
    </Edit>
  );
};
