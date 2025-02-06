import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack, MultiSelect, Badge, useMantineTheme, Loader } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import ArrayTagInput from "./arrayTagInput";
import type { ICategory } from "../../interfaces";
import { DateField } from "@refinedev/mantine";
import { DatePicker } from "@mantine/dates";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useState } from "react";
import { Dropzone, DropzoneProps,PDF_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";



export const PosterEdit: React.FC = () => {
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
      _id:"",
      title: "Investigacion Geniality"+(new Date().toString()),
      category: "Science",
      topic: "Quantum Physics",
      institution: "MIT",
      urlPdf: "",
      authors: [],
      eventId:"67a20a31bbf5dd91c12d15c4"
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

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const theme = useMantineTheme();

  const sanitizeFileName = (fileName) => {
    // Remove or replace any characters that are not letters, numbers, dots, hyphens, or underscores
    return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  };

  // Handle file upload
  const handleFileUpload = async (files) => {
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
      const response = await axios.post("https://lobster-app-uy9hx.ondigitalocean.app/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("yupi subio", response.data.imageUrl);
      getInputProps("urlPdf").onChange(response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const [inputValue, setInputValue] = useState("");
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

  console.log("Query_result,", queryResult?.data?.data);
  //console.log('getInputProps,',  getInputProps("title"))

  // const { selectProps } = useSelect<ICategory>({
  //   resource: "categories",
  //   defaultValue: queryResult?.data?.data.category.id,
  // });

  console.log("getInputProps", values);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <TextInput mt={8} label="eventId" placeholder="67a20a31bbf5dd91c12d15c4" {...getInputProps("eventId")} />
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

        <div>
          <Text>Autores</Text>
          <Group spacing="xs">
            {values.authors.map((tag, index) => (
              <Badge
                key={index}
                variant="filled"
                color="blue"
                rightSection={
                  <span onClick={() => removeTag(tag)} style={{ cursor: "pointer", marginLeft: 4 }}>
                    x
                  </span>
                }
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

        <div id="PosterFile">
          <TextInput mt={8} label="ARCHIVO POSTER" placeholder="urlPdf" {...getInputProps("urlPdf")} />

          <Text>
            <a target="_blank" href={values?.urlPdf}>
              {values?.urlPdf}
            </a>
          </Text>

          <Dropzone
            onDrop={(files) => {
              console.log("accepted files", files);
              setFiles(files);
              handleFileUpload(files);
            }}
            onReject={(files) => console.log("rejected files", files)}
            maxSize={3 * 1024 ** 4}
            accept={PDF_MIME_TYPE}
          >
            <Group position="center" spacing="xl" style={{ minHeight: "rem(220)", pointerEvents: "none" }}>
              <Dropzone.Accept>
                <IconUpload
                  size="3.2rem"
                  stroke={1.5}
                  color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size="3.2rem" stroke={1.5} color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size="3.2rem" stroke={1.5} />
              </Dropzone.Idle>


              <div>
              {loading && <Loader color="blue" />}
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

          {/* <Button disabled={(!(files.length > 0))} style={{ width: "100%" }} onClick={handleFileUpload} loading={loading} disabled={files.length === 0}>
             Subir Archivo
           </Button>
           */}
        </div>
      </form>
    </Edit>
  );
};
