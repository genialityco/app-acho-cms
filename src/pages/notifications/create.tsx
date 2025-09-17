import React, { useState, useRef } from "react";
import { Create, useForm } from "@refinedev/mantine";
import { TextInput, Textarea, Box, Text, Group, Button } from "@mantine/core";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IconPhoto, IconVideo } from "@tabler/icons-react";
import { getQuillConfig, useQuillVideoHandlers } from "../../components/quill"; // Adjust path as needed
import axios from "axios";

export const NotificationTemplateCreate: React.FC = () => {
  const [dataError, setDataError] = useState<string | null>(null);
  const [bodyLength, setBodyLength] = useState(0); // Estado para contar caracteres del body
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const maxTitleLength = 50;
  const maxBodyLength = 250;

  // Ref for ReactQuill
  const quillRef = useRef<ReactQuill>(null);

  // Use custom hook for video and image handlers
  const {
    insertVideoFromFile,
    insertVideoFromUrl,
    insertImageFromFile,
    insertImageFromUrl,
  } = useQuillVideoHandlers(quillRef);

  // Get Quill configuration
  const { modules, formats } = getQuillConfig();

  const { saveButtonProps, getInputProps, setFieldValue, errors } = useForm({
    initialValues: {
      title: "",
      body: "",
      data: {},
      isSent: false,
      organizationId: "66f1d236ee78a23c67fada2a",
    },
    validate: {
      title: (value) => {
        if (value.length < 3) return "Title is too short";
        if (value.length > maxTitleLength) return `Title cannot exceed ${maxTitleLength} characters`;
        return null;
      },
      body: (value) => {
        const text = value.replace(/<[^>]+>/g, ""); // Strip HTML tags for length validation
        if (text.length < 10) return "Body is too short";
        if (text.length > maxBodyLength) return `Body cannot exceed ${maxBodyLength} characters`;
        return null;
      },
    },
  });

  const handleBodyChange = (value: string) => {
    setFieldValue("body", value);
    const text = value.replace(/<[^>]+>/g, ""); // Strip HTML tags for counting
    setBodyLength(text.length);
  };

  const handleDataChange = (value: string) => {
    try {
      const parsedData = JSON.parse(value);
      setFieldValue("data", parsedData);
      setDataError(null);
    } catch {
      setDataError("Invalid JSON format. Please correct the input.");
    }
  };

  // Handler for uploading images in the editor
  const handleImageUploadInEditor = async () => {
    try {
      setLoadingImage(true);
      await insertImageFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/image",
        { "Content-Type": "multipart/form-data" }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload the image.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Handler for uploading videos in the editor
  const handleVideoUploadInEditor = async () => {
    try {
      setLoadingVideo(true);
      await insertVideoFromFile(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/document",
        { "Content-Type": "multipart/form-data" }
      );
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload the video.");
    } finally {
      setLoadingVideo(false);
    }
  };

  // Handler for inserting image from URL
  const handleImageUrlInEditor = () => {
    insertImageFromUrl("Enter the image URL:");
  };

  // Handler for inserting video from URL
  const handleVideoUrlInEditor = () => {
    insertVideoFromUrl("Enter the video URL (YouTube, Vimeo, etc.):");
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        {/* Title */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter notification template title"
          {...getInputProps("title")}
          error={errors.title}
          maxLength={maxTitleLength}
        />

        {/* Body */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Body
          </Text>

          {/* Buttons for inserting media in the editor */}
          <Group spacing="xs" mb="sm">
            <Button
              size="xs"
              variant="light"
              leftIcon={<IconPhoto size="1rem" />}
              onClick={handleImageUploadInEditor}
              loading={loadingImage}
            >
              Upload Image
            </Button>
            <Button
              size="xs"
              variant="light"
              leftIcon={<IconVideo size="1rem" />}
              onClick={handleVideoUploadInEditor}
              loading={loadingVideo}
            >
              Upload Video
            </Button>
            <Button
              size="xs"
              variant="outline"
              leftIcon={<IconPhoto size="1rem" />}
              onClick={handleImageUrlInEditor}
            >
              Image URL
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

          {/* ReactQuill with VideoBlot configuration */}
          <Box style={{ minHeight: "350px" }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={getInputProps("body").value || ""}
              onChange={handleBodyChange}
              modules={modules}
              formats={formats}
              style={{
                height: "300px",
                marginBottom: "40px",
                backgroundColor: "white",
              }}
              placeholder="Write your notification content here..."
            />
          </Box>

          <Text size="xs" align="right" mt="xs" color={bodyLength > maxBodyLength ? "red" : "gray"}>
            {bodyLength}/{maxBodyLength} characters
          </Text>
          {errors.body && (
            <Text mt="xs" size="xs" color="red">
              {errors.body}
            </Text>
          )}
        </Box>

        {/* Additional Data */}
        <Textarea
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value", "route": "/home"}'
          onChange={(event) => handleDataChange(event.currentTarget.value)}
          error={dataError}
        />
        {dataError && (
          <Text mt="xs" size="xs" color="red">
            {dataError}
          </Text>
        )}
      </form>
    </Create>
  );
};