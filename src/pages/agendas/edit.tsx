import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack, UseSelect, MultiSelect } from "@mantine/core";
import EditSessionsForm from "./editSessionsForm";
import type { ICategory } from "../../interfaces";
import {DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";

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
      _id: "",
      eventId: {
        name: "",
      },
      title: "a",
      sessions: [],
      startDate: new Date().toString(),
      status: "",
      category: {
        id: "",
      },
      content: "",
    },
    transformValues: (values) => {
      let respuesta = {
        ...values,
        eventId: values?.eventId?._id ? values?.eventId?._id : eventId,
      };
      return respuesta;
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

  //console.log("Query_result,", queryResult?.data?.data);
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
      title: "",
      startDateTime: "2024-09-27T18:10:00.000Z",
      endDateTime: "2024-09-27T18:10:00.000Z",
      speakers: [],
    };

    setFieldValue("sessions", [...values.sessions, newSession]);
  };

  // Function to remove a session by index
  const removeSession = (index) => {
    const updatedSessions = values.sessions.filter((_, i) => i !== index);
    setFieldValue("sessions", updatedSessions);
  };

  /** SPEAKERS */

  // Function to remove a speaker by index
  const removeSpeaker = (indexSession,indexSpeaker) => {
    console.log('removespeaker',indexSession,indexSpeaker)
    const updatedSpeakers = values.sessions[indexSession].speakers.filter((_, i) => i !== indexSpeaker);
    
    let updatedSessions = values.sessions;
    updatedSessions[indexSession].speakers =  updatedSpeakers;
    setFieldValue("sessions", updatedSessions);
  };

    // Function to add a new speaker to the array
    const addSpeaker = (indexSession) => {
      const addSpeaker = {
      };

      let updatedSessions = values.sessions;
      updatedSessions[indexSession].speakers.push(addSpeaker)
      setFieldValue("sessions", updatedSessions);
    };



  // Fetch categories to allow users to select related categories
  const { selectProps: speakerSelectProps } = useSelect({
    resource: "speakers", // your API endpoint for categories
    optionLabel: "names", // property to display
    optionValue: "_id", // property to use as value
    //defaultValue: values?.categories.map(category => category.id), // pre-select related categories
  });

  //console.log("getInputProps", values);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <Text mt={8} label="Name" placeholder="Nombre">
          {queryResult?.data?.data?._id}
        </Text>
        <Text mt={8} label="Name" placeholder="Nombre">
          {queryResult?.data?.data?.eventId?.name}
        </Text>

        {<TextInput mt={8} label="title" placeholder="title" {...getInputProps("title")} />}

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
            <Stack
              key={session._id}
              spacing="sm"
              sx={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}
            >
              <TextInput
                label="Title"
                placeholder="Enter session title"
                {...getInputProps(`values.sessions.${index}.title`)}
                required
              />

              <Group>
{/* Speakers for each session */}

  <>
    {values?.sessions[index]?.speakers && (values?.sessions[index]?.speakers.map((speaker, speakerIndex) => (
      <div key={speakerIndex} style={{ marginLeft: "20px", marginBottom: "10px" }}>
        <span>{speaker._id} {speakerIndex} </span>
        <Select label={`Speaker ${speakerIndex}`}
          {...getInputProps(`sessions.${index}.speakers.${speakerIndex}._id`)}
          {...speakerSelectProps}
          //defaultValue={speaker._id} // Pre-select the current speaker
        />
        <Button color="red" onClick={() => removeSpeaker(index,speakerIndex)}>
        x
      </Button>
      </div>
    )))}
    <button type="button" onClick={() => addSpeaker(index)}>
    Add Speaker
  </button>
  </>


              </Group>

              <Group grow>
                <DateTimePicker
                  label="Start Date and Time"
                  placeholder="Select start date and time"
                  {...getInputProps(`sessions.${index}.startDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.startDateTime`).value
                      ? dayjs(getInputProps(`sessions.${index}.startDateTime`).value).toDate()
                      : null
                  } // Format date correctly
                  onChange={(value) => getInputProps(`sessions.${index}.startDateTime`).onChange(value)} // Ensure change updates value
                  required
                />

                <DateTimePicker
                  label="End Date and Time"
                  placeholder="Select end date and time"
                  {...getInputProps(`sessions.${index}.endDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.endDateTime`).value
                      ? dayjs(getInputProps(`sessions.${index}.endDateTime`).value).toDate()
                      : null
                  } // Format date correctly
                  onChange={(value) => getInputProps(`sessions.${index}.endDateTime`).onChange(value)} // Ensure change updates value
                />
              </Group>

              <Button color="red" onClick={() => removeSession(index)}>
                Remove Session
              </Button>
            </Stack>
          ))}

          <Group position="apart">
            <Button color="green" onClick={addSession}>
              Add New Session
            </Button>
          </Group>
        </Stack>
      </form>
    </Edit>
  );
};
