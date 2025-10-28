import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack } from "@mantine/core";
import EditSessionsForm from "./editSessionsForm";
import type { ICategory } from "../../interfaces";
import { DateTimePicker } from "@mantine/dates";
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
      title: "",
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
        //moduleId: values?.moduleId?._id ?? values?.moduleId?._id,
      };
      console.log("VALUES", values);
      return respuesta;
    },
  });

  // Function to add a new session to the array
  const addSession = () => {
    const newSession = {
      //_id: generateFirebaseId(),
      title: "",
      startDateTime: "2025-11-14T18:10:00.000Z",
      endDateTime: "2025-11-14T18:10:00.000Z",
      speakers: [],
      room: "",
      moduleId: null,
    };

    // Add session without sorting
    const updatedSessions = [...values.sessions, newSession];

    setFieldValue("sessions", updatedSessions);
  };

  // Function to remove a session by index
  const removeSession = (index) => {
    const updatedSessions = values.sessions.filter((_, i) => i !== index);
    setFieldValue("sessions", updatedSessions);
  };

  /** SPEAKERS */

  // Function to remove a speaker by index
  const removeSpeaker = (indexSession, indexSpeaker) => {
    console.log("removespeaker", indexSession, indexSpeaker);
    const updatedSpeakers = values.sessions[indexSession].speakers.filter((_, i) => i !== indexSpeaker);

    let updatedSessions = values.sessions;
    updatedSessions[indexSession].speakers = updatedSpeakers;
    setFieldValue("sessions", updatedSessions);
  };

  // Function to add a new speaker to the array
  const addSpeaker = (indexSession) => {
    const addSpeaker = {};

    let updatedSessions = values.sessions;
    updatedSessions[indexSession].speakers.push(addSpeaker);
    setFieldValue("sessions", updatedSessions);
  };

  // Fetch speakers to allow users to select related categories
  const { selectProps: speakerSelectProps } = useSelect({
    resource: "speakers", // your API endpoint for categories
    optionLabel: "names", // property to display
    optionValue: "_id", // property to use as value
    
    //add really high limit to avoid default pagination in the API
    pagination: {
      pageSize: 1000,
      current:1,
      mode: "server",
    },
    
    // Filter speakers by eventId
    filters: [
      {
        field: "eventId",
        operator: "eq",
        value: values?.eventId?._id || queryResult?.data?.data?.eventId?._id,
      },
    ],
    
    queryOptions: {
      enabled: !!(values?.eventId?._id || queryResult?.data?.data?.eventId?._id), // Only fetch when eventId exists
    },
    //defaultValue: values?.categories.map(category => category.id), // pre-select related categories
  });

  //Fetch categories to allow users to select related categories
  const { selectProps: moduleSelectProps } = useSelect({
    resource: "modules", // your API endpoint for categories
    optionLabel: "title", // property to display
    optionValue: "_id", // property to use as value
    //defaultValue: values?.categories.map(category => category.id), // pre-select related categories
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <Text mt={8} label="ID" placeholder="ID">
          ID: {queryResult?.data?.data?._id}
        </Text>
        <Text mt={8} label="Name" placeholder="Nombre">
          {queryResult?.data?.data?.eventId?.name}
        </Text>

        {<TextInput type="hidden" mt={8} label="" placeholder="title" {...getInputProps("title")} value="{queryResult?.data?.data?.eventId?.name}"/>}

        <Stack spacing="md">
          {values.sessions.map((session, index) => (
            <Stack
              key={index}
              spacing="sm"
              sx={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}
            >
              <Group grow style={{ alignItems: "flex-end" }}>
                <DateTimePicker
                  style={{ maxWidth: "160px" }}
                  label="Start Date and Time"
                  placeholder="Select start date and time"
                  {...getInputProps(`sessions.${index}.startDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.startDateTime`).value
                      ? dayjs(getInputProps(`sessions.${index}.startDateTime`).value).toDate()
                      : null
                  }
                  onChange={(value) => getInputProps(`sessions.${index}.startDateTime`).onChange(value)}
                  required
                />

                <DateTimePicker
                  style={{ maxWidth: "160px" }}
                  label="End Date and Time"
                  placeholder="Select end date and time"
                  {...getInputProps(`sessions.${index}.endDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.endDateTime`).value
                      ? dayjs(getInputProps(`sessions.${index}.endDateTime`).value).toDate()
                      : null
                  }
                  onChange={(value) => getInputProps(`sessions.${index}.endDateTime`).onChange(value)}
                />

                <TextInput
                  style={{ minWidth: "500px" }}
                  label="Title"
                  placeholder="Enter session title"
                  {...getInputProps(`sessions.${index}.title`)}
                  required
                />
                <Button color="blue" onClick={() => removeSession(index)}>
                  Remove
                </Button>
              </Group>

              <Group>
                {values?.sessions[index]?.speakers &&
                  values?.sessions[index]?.speakers.map((speaker, speakerIndex) => (
                    <div
                      key={speakerIndex}
                      style={{ marginLeft: "20px", marginBottom: "10px", display: "flex", alignItems: "flex-end" }}
                    >
                      <Select
                        key={speakerIndex}
                        style={{ display: "inline" }}
                        label={`Speaker ${speakerIndex}`}
                        {...getInputProps(`sessions.${index}.speakers.${speakerIndex}._id`)}
                        data={speakerSelectProps.data}
                        searchable={true}
                        onSearchChange={(search)=>console.log('buscandooo',search)}
                        filterDataOnExactSearchMatch={false}
                      />
                      <Button
                        style={{ backgroundColor: "rgba(200,150,150,0.7)" }}
                        onClick={() => removeSpeaker(index, speakerIndex)}
                      >
                        x
                      </Button>
                    </div>
                  ))}
                <button type="button" onClick={() => addSpeaker(index)}>
                  Add Speaker
                </button>
              </Group>

              <Group grow>
                <TextInput label="Room" placeholder="Enter Room" {...getInputProps(`sessions.${index}.room`)} />

                <Select
                  label="Modulo"
                  placeholder="Pick one"
                  {...getInputProps(`sessions.${index}.moduleId?._id`)}
                  {...moduleSelectProps}
                  value = {session['moduleId']?._id ?? session['moduleId'] ?? null}
                  onChange={(value) => getInputProps(`sessions.${index}.moduleId`).onChange(value)}
                />
              </Group>
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