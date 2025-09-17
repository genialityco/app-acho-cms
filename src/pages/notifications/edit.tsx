import React, { useState, useEffect, useRef } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box, Group, Button } from "@mantine/core";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IconPhoto, IconVideo } from "@tabler/icons-react";
import { getQuillConfig, useQuillVideoHandlers } from "../../components/quill"; // Adjust path as needed
import axios from "axios";

export const NotificationTemplateEdit: React.FC = () => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

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
      body: "",
      data: {}, // JSON field for additional data
      isSent: false,
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      body: (value) => (value.length < 10 ? "Body is too short" : null),
    },
  });

  // Extract data from backend
  const data = queryResult?.data;

  // Pre-populate form fields with existing data
  useEffect(() => {
    if (data) {
      const { title, body, data: templateData, isSent } = data.data;
      setFieldValue("title", title);
      setFieldValue("body", body);
      setFieldValue("data", templateData || {});
      setFieldValue("isSent", isSent || false);
    }
  }, [data, setFieldValue]);

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
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        {/* Title */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter notification template title"
          {...getInputProps("title")}
          error={errors.title}
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
              onChange={(value) => setFieldValue("body", value)}
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

          {errors.body && (
            <Text mt="xs" size="xs" color="red">
              {errors.body}
            </Text>
          )}
        </Box>

        {/* Additional Data */}
        <TextInput
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value"}'
          {...getInputProps("data")}
        />
      </form>
    </Edit>
  );
};