import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select,Button,  Group, TextInput, Text,Stack,MultiSelect } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";
import EditSessionsForm from "./editSessionsForm";
import type { ICategory } from "../../interfaces";
import {DateField} from  "@refinedev/mantine";
import { DatePicker } from '@mantine/dates';
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";


function generateFirebaseId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
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

export const AgendaEdit: React.FC = () => {
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
      eventId:{
        name:""
      },
      title:"a",
      sessions:[],
      startDate: new Date().toString(),
      status: "",
      category: {
        id: "",
      },
      content: "",
    },
    transformValues: (values) => {
      let respuesta =       {
        ...values,
        eventId: values?.eventId?._id?values?.eventId?._id:eventId
      }
      return respuesta

  }
    // validate: {
    //   title: (value) => (value.length < 2 ? "Too short title" : null),
    //   status: (value) => (value.length <= 0 ? "Status is required" : null),
    //   category: {
    //     id: (value) => (value.length <= 0 ? "Category is required" : null),
    //   },
    //   content: (value) => (value.length < 10 ? "Too short content" : null),
    // },
  });

  console.log("Query_result,", queryResult?.data?.data);
  //console.log('getInputProps,',  getInputProps("title"))

  // const { selectProps } = useSelect<ICategory>({
  //   resource: "categories",
  //   defaultValue: queryResult?.data?.data.category.id,
  // });

//   const onSubmit = (e) => {
//     e.preventDefault();
//     alert('detenido');
//     //onFinish(values);
// };

  // Function to add a new session to the array
  const addSession = () => {
    const newSession = {
      //_id: generateFirebaseId(),
      title: '',
      startDateTime: "2024-09-27T18:10:00.000Z",
      endDateTime: "2024-09-27T18:10:00.000Z",
      speakers: [],
    };

    setFieldValue('sessions', [...values.sessions, newSession]);
  };

  // Function to remove a session by index
  const removeSession = (index) => {
    const updatedSessions = values.sessions.filter((_, i) => i !== index);
    setFieldValue('sessions', updatedSessions);
  };


  console.log('getInputProps',values)

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form >
      <Text mt={8} label="Name" placeholder="Nombre" >{queryResult?.data?.data?._id}</Text>
      <Text mt={8} label="Name" placeholder="Nombre" >{queryResult?.data?.data?.eventId?.name}</Text>

      {<TextInput mt={8} label="title" placeholder="title" {...getInputProps("title")} /> }

       {/* <Select
          mt={8}
          label="Status"
          placeholder="Pick one"
          {...getInputProps("status")}
          data={[
            { label: "Published", value: "published" },
            { label: "Draft", value: "draft" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
        <Text mt={8} weight={500} size="sm" color="#212529">
          Content
        </Text>
        <MDEditor data-color-mode="light" {...getInputProps("content")} />
        {errors.content && (
          <Text mt={2} size="xs" color="red">
            {errors.content}
          </Text>
        )} */}

        <Stack spacing="md">
        {values.sessions.map((session, index) => (
          <Stack key={session._id} spacing="sm" sx={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <TextInput
              label="Title"
              placeholder="Enter session title"
              {...getInputProps(`sessions.${index}.title`)}
              required
            />
            <Group grow>
              <DatePicker
                label="Start Date and Time"
                placeholder="Select start date and time"
                {...getInputProps(`sessions.${index}.startDateTime`)}
                value={getInputProps(`sessions.${index}.startDateTime`).value ? dayjs(getInputProps(`sessions.${index}.startDateTime`).value).toDate() : null} // Format date correctly
                onChange={(value) => getInputProps(`sessions.${index}.startDateTime`).onChange(value)}  // Ensure change updates value
                required
              />
         
              <DatePicker
                label="End Date and Time"
                placeholder="Select end date and time"
                
                {...getInputProps(`sessions.${index}.endDateTime`)}
                value={getInputProps(`sessions.${index}.endDateTime`).value ? dayjs(getInputProps(`sessions.${index}.endDateTime`).value).toDate() : null} // Format date correctly
                onChange={(value) => getInputProps(`sessions.${index}.endDateTime`).onChange(value)}  // Ensure change updates value
 
              />
            </Group>

            <Button color="red" onClick={() => removeSession(index)}>
              Remove Session
            </Button>
          </Stack>
        ))}

        <Group position="apart">
          <Button color="green" onClick={addSession}>
            AAdd New Session
          </Button>
        </Group>
      </Stack>


       </form>
    </Edit>
  );
};



