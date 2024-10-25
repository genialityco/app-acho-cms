import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack, MultiSelect, Badge, useMantineTheme } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import ArrayTagInput from "./arrayTagInput";
import type { ICategory } from "../../interfaces";
import { DateField } from "@refinedev/mantine";
import { DatePicker } from "@mantine/dates";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { useState } from "react";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";

function generateFirebaseId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 24; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    id += chars[randomIndex];
  }
  return id;
}

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

/*
"_id": "670ed4f0dd7cd216bbe00091",
        "title": "Quantum Physics Insights",
        "category": "Science",
        "topic": "Quantum Physics",
        "institution": "MIT",
        "authors": [
          "John Doe",
          "Jane Smith"
        ],
        "votes": 11,
        "urlPdf": "https://firebasestorage.googleapis.com/v0/b/global-auth-49737.appspot.com/o/b69ffc15-fabc-483b-aba7-1c24c9cd62f4.pdf?alt=media&token=eff69385-cd8e-437e-a81e-f1921fb008fb",
        "eventId": "66f1e0b57c2e2fbdefa21271",
        "createdAt": "2024-10-15T20:47:44.515Z",
        "updatedAt": "2024-10-16T14:06:33.348Z",
        "__v": 1,
        "voters": [
          "670848c20ebe6b389db58f4e"
        ]
*/

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
      _id: "",
      title: "Quantum Physics Insights",
      category: "Science",
      topic: "Quantum Physics",
      institution: "MIT",
      urlPdf: "",
      authors: [],
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

  // Handle file upload
  const handleFileUpload = async () => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file); // Append the file to FormData
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
        <TextInput mt={8} label="eventId" placeholder="66f1e0b57c2e2fbdefa21271" {...getInputProps("eventId")} />
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

          <Button disabled={(!(files.length > 0))} style={{ width: "100%" }} onClick={handleFileUpload} loading={loading} disabled={files.length === 0}>
            Subir Archivo
          </Button>
        </div>
      </form>
    </Edit>
  );
};
