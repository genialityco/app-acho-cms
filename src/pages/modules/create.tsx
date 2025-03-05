import { useState } from 'react';
import { Create, useForm, useSelect } from "@refinedev/mantine";
import { Select, TextInput, Text, Badge, Group } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import ArrayTagInput from "./arrayTagInput";
export const ModuleCreate: React.FC = () => {
  const { saveButtonProps, values, getInputProps, errors } = useForm({
    initialValues: {
      "eventId":"67b3b49f32966c0e9873115d",
      "title": "Investigacion Geniality"+(new Date().toString()),
      "category": "Science",
      "topic": "Quantum Physics",
      "institution": "MIT",
      "urlPdf":"https://firebasestorage.googleapis.com/v0/b/global-auth-49737.appspot.com/o/certificado_ejemplo-1.pdf?alt=media&token=1aa2097a-d152-469c-b3cd-66dc386138d1",
      authors:[]
    },
    // validate: {
    //   title: (value) => (value.length < 2 ? "Too short title" : null),
    //   status: (value) => (value.length <= 0 ? "Status is required" : null),
    //   category: {
    //     id: (value) => (value.length <= 0 ? "Category is required" : null),
    //   },
    //   content: (value) => (value.length < 10 ? "Too short content" : null),
    // },
  });


  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      const newValue = [...values.authors, inputValue.trim()];
      getInputProps(`authors`).onChange(newValue) 
      setInputValue('');

    }
  };
  const removeTag = (tagToRemove) => {
    const newValue = (values.authors.filter((tag) => tag !== tagToRemove));
    getInputProps(`authors`).onChange(newValue);
  };

  // const { selectProps } = useSelect({
  //   resource: "categories",
  // });

  return (
    <Create saveButtonProps={saveButtonProps}>
    <form >
    <TextInput mt={8} label="eventId" placeholder="eventId" {...getInputProps("eventId")} />
    <TextInput mt={8} label="title" placeholder="title" {...getInputProps("title")} />
    <TextInput mt={8} label="topic" placeholder="topic" {...getInputProps("topic")} />

    <TextInput mt={8} label="institution" placeholder="institution" {...getInputProps("institution")} />
    <Select
        mt={8}
        label="Category"
        placeholder="Pick one"
        {...getInputProps("category")}
        data={[
          { label: "Hematología", value: "Hematología" },
          { label: "Oncología", value: "Oncología" },
        ]}
      />
      <TextInput mt={8} label="urlPdf" placeholder="urlPdf" {...getInputProps("urlPdf")} />
      <div>

      <div>
      <Text>Autores</Text>
      <Group spacing="xs">
        {values.authors.map((tag, index) => (
          <Badge
            key={index}
            variant="filled"
            color="blue"
            rightSection={<span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', marginLeft: 4 }}>x</span>}
          >
            {tag}
          </Badge>
        ))}
        <TextInput
          placeholder="Type and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          sx={{ flexGrow: 1 }}
        />
      </Group>
      </div>
    </div>


     </form>
    </Create>
  );
};
