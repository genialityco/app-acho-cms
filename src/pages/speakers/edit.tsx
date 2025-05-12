import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack, MultiSelect, Badge, Textarea, Switch,useMantineTheme } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import ArrayTagInput from "./arrayTagInput";
import type { ICategory } from "../../interfaces";
import { DateField } from "@refinedev/mantine";
import { DatePicker } from "@mantine/dates";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useState } from "react";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import axios from 'axios';

// const resource = {
//   sessions: [
//     { id: 1, title: "Session 1", startDateTime: new Date(), endDateTime: new Date(), speakers: ["1"] },
//     { id: 2, title: "Session 2", startDateTime: new Date(), endDateTime: new Date(), speakers: ["2", "3"] },
//   ],
// };

const speakersList = [
  { id: "1", name: "Speaker One" },
  { id: "2", name: "Speaker Two" },
  { id: "3", name: "Speaker Three" },
];

// const handleFormSubmit = (updatedSessions) => {
//   console.log("Updated Sessions:", updatedSessions);
// };

export const SpeakerEdit: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    saveButtonProps,
    getInputProps,
    values,
    setFieldValue,
    refineCore: { query: queryResult },
    errors,
  } = useForm({
    refineCoreProps: {
      redirect: false,
    },
    initialValues: {
      _id: "",
      names: "NN",
      description: "Good Speaker",
      location: "Planet Earth",
      isInternational: false,
      imageUrl: "",
      eventId: "6807d5a91c2e1e14b22da8b0",
    },
    transformValues: (values) => {
      return values;
      // let respuesta =       {
      //   ...values,
      //   eventId: values?.eventId?._id?values?.eventId?._id:eventId
      // }
      // return respuesta
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

  const [inputValue, setInputValue] = useState("");

  const theme = useMantineTheme();

  const sanitizeFileName = (fileName) => {
    // Remove or replace any characters that are not letters, numbers, dots, hyphens, or underscores
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  };

      // Handle file upload
      const handleFileUpload = async () => {
        if (files.length === 0) {
            alert("No files selected!");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
          const sanitizedFileName = sanitizeFileName(file.name);
          const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });
          formData.append("file", sanitizedFile); // Append the file to FormData
        });

        try {
            setLoading(true);
            const response = await axios.post('https://lobster-app-uy9hx.ondigitalocean.app/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('yupi subio',response.data.imageUrl);
            getInputProps("imageUrl").onChange(response.data.imageUrl)

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload the file.');
        } finally {
            setLoading(false);
        }
    };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && inputValue.trim()) {
      const newValue = [...values.authors, inputValue.trim()];
      getInputProps(`authors`).onChange(newValue);
      setInputValue("");
    }
  };
  const removeTag = (tagToRemove) => {
    const newValue = values.authors.filter((tag) => tag !== tagToRemove);
    getInputProps(`authors`).onChange(newValue);
  };


  //console.log('getInputProps,',  getInputProps("title"))

  // const { selectProps } = useSelect<ICategory>({
  //   resource: "categories",
  //   defaultValue: queryResult?.data?.data.category.id,
  // });



  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <TextInput
          mt={8}
          label="eventId"
          placeholder="6807d5a91c2e1e14b22da8b0"
          {...getInputProps("eventId")}
          disabled
        />
        <TextInput mt={8} label="Nombre Completo" placeholder="names" {...getInputProps("names")} />
        <Textarea mt={8} label="Descripción" placeholder="description" {...getInputProps("description")} />

        <TextInput mt={8} label="Pais/Ubicación" placeholder="location" {...getInputProps("location")} />
        <p></p>
        <Switch label="isInternational" placeholder="isInternational" {...getInputProps("isInternational")} />

        <TextInput mt={8} label="imageUrl" placeholder="imageUrl" {...getInputProps("imageUrl")} />

        {values.imageUrl && <img style={{ width: "200px" }} src={values.imageUrl} />}

        <Dropzone
        onDrop={(files) => {console.log('accepted files', files);setFiles(files)}}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={3 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
       
      >
        <Group position="center" spacing="xl" style={{minHeight: 'rem(220)', pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              size="3.2rem"
              stroke={1.5}
              color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size="3.2rem"
              stroke={1.5}
              color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size="3.2rem" stroke={1.5} />
          </Dropzone.Idle>
  
          <div>
          {/* Display Selected Files */}
          {files.length > 0 && (
            <div style={{ marginTop: 10,marginBottom:10 }}>
              <Text size="l" color="dimmed">Archivo seleccionado para subir:</Text>
              <Text size="xl" >{files.map((file) => file.name).join(", ")} </Text>
            </div>
          )}    
          
          {files.length <= 0 && (
            <>
            <Text size="l" >
              Arrastra o haz click para cargar el archivo
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              El archivo no debe exceder los 10MB
            </Text>
            </>
          )} 
          </div>
        </Group>
      </Dropzone>                   

    <Button disabled={(!(files.length > 0))} style={{ width: "100%" }} onClick={handleFileUpload} loading={loading} >
    Upload
</Button>

        {/*
   
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

    */}

        {/*}
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
        */}
      </form>
    </Edit>
  );
};
