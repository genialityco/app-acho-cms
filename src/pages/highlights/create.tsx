import React from "react";
import { Create, useForm } from "@refinedev/mantine";
import { TextInput, Textarea, Box, Button } from "@mantine/core";

export const HighlightCreate: React.FC = () => {
  const { saveButtonProps, getInputProps, errors } = useForm({
    initialValues: {
      name: "",
      description: "",
      imageUrl: "",
      vimeoUrl: "",
      organizationId: "66f1d236ee78a23c67fada2a", 
      eventId: "",
    },
    validate: {
      name: (value) => (value.length < 3 ? "Name is too short" : null),
      description: (value) => (value.length < 10 ? "Description is too short" : null),
      vimeoUrl: (value) => (!value.startsWith("https://") ? "Invalid URL" : null),
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        <TextInput
          mt="sm"
          label="Name"
          placeholder="Enter highlight name"
          {...getInputProps("name")}
          error={errors.name}
        />
        <Textarea
          mt="sm"
          label="Description"
          placeholder="Enter highlight description"
          {...getInputProps("description")}
          error={errors.description}
        />
        <TextInput
          mt="sm"
          label="Video URL"
          placeholder="Enter Vimeo video URL"
          {...getInputProps("vimeoUrl")}
          error={errors.vimeoUrl}
        />
        {/* <TextInput
          mt="sm"
          label="Image URL"
          placeholder="Enter image URL"
          {...getInputProps("imageUrl")}
        /> */}
      </form>
    </Create>
  );
};
