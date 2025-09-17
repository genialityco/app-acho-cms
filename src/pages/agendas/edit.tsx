import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack } from "@mantine/core";
import EditSessionsForm from "./editSessionsForm";
import type { ICategory } from "../../interfaces";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useEffect } from "react";
import { parseISO } from "date-fns";

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
      warnWhenUnsavedChanges: false,
    },
    // Remueve o simplifica initialValues si usas useEffect
    initialValues: {
      _id: "",
      eventId: { name: "" },
      title: "",
      sessions: [],
      startDate: "",
      status: "",
      category: { id: "" },
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
    // validate: {
    //   title: (value) => (value.length < 2 ? "Too short title" : null),
    //   status: (value) => (value.length <= 0 ? "Status is required" : null),
    //   category: {
    //     id: (value) => (value.length <= 0 ? "Category is required" : null),
    //   },
    //   content: (value) => (value.length < 10 ? "Too short content" : null),
    // },
  });
  useEffect(() => { console.log("valores a editar: ", values)}, [values]);

  useEffect(() => {
    if (queryResult?.data?.data) {
      const data = queryResult.data.data;
  
      // 🔹 Campos simples
      setFieldValue("_id", data._id || "");
      setFieldValue("title", data.title || "");
      setFieldValue("room", data.room || "");
  
      // 🔹 Fechas (si tu formulario espera objetos Date)
      setFieldValue(
        "startDateTime",
        data.startDateTime ? new Date(data.startDateTime) : null
      );
      setFieldValue(
        "endDateTime",
        data.endDateTime ? new Date(data.endDateTime) : null
      );
  
      // 🔹 Speakers: se mapean a solo los campos que uses en tu formulario
      const mappedSpeakers = (data.speakers || []).map((sp: any) => ({
        _id: sp._id,
        names: sp.names,
        description: sp.description,
        location: sp.location,
        isInternational: sp.isInternational,
        imageUrl: sp.imageUrl,
      }));
      setFieldValue("speakers", mappedSpeakers);
  
      // 🔹 ModuleId: puedes guardar solo el id o el objeto entero
      setFieldValue("moduleId", data.moduleId?._id || data.moduleId);
  
      // 🔹 Si necesitas el objeto completo del módulo
      // setFieldValue("module", data.moduleId || null);
    }
  }, [queryResult?.data, setFieldValue]);
  // Se ejecuta cada vez que los datos de la API cambian


  // Function to add a new session to the array
  const addSession = () => {
    const newSession = {
      //_id: generateFirebaseId(),
      title: "",
      startDateTime: "2024-09-27T18:10:00.000Z",
      endDateTime: "2024-09-27T18:10:00.000Z",
      speakers: [],
      room: "",
      moduleId: null,
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
    //defaultValue: values?.categories.map(category => category.id), // pre-select related categories
  });

  //Fetch categories to allow users to select related categories
  const { selectProps: moduleSelectProps } = useSelect({
    resource: "modules", // your API endpoint for categories
    optionLabel: "title", // property to display
    optionValue: "_id", // property to use as value
    //defaultValue: values?.categories.map(category => category.id), // pre-select related categories
  });

  const toUTCDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
    );
  };

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

        {/*
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

            
              <Group grow style={{ alignItems: "flex-end" }}>
                <DateTimePicker
                  style={{ maxWidth: "160px" }}
                  label="Start Date and Time"
                  placeholder="Select start date and time"
                  {...getInputProps(`sessions.${index}.startDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.startDateTime`).value
                      ? parseISO(getInputProps(`sessions.${index}.startDateTime`).value)
                      : null
                  } // Format date correctly
                  onChange={(value) => getInputProps(`sessions.${index}.startDateTime`).onChange(toUTCDate(value))} // Ensure change updates value
                  required
                />

                <DateTimePicker
                  style={{ maxWidth: "160px" }}
                  label="End Date and Time"
                  placeholder="Select end date and time"
                  {...getInputProps(`sessions.${index}.endDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.endDateTime`).value
                      ? parseISO(getInputProps(`sessions.${index}.endDateTime`).value)
                      : null
                  } // Format date correctly
                  onChange={(value) => getInputProps(`sessions.${index}.endDateTime`).onChange(toUTCDate(value))} // Ensure change updates value
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
                {/* Speakers for each session */}

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
                        //onSearchChange={(search)=>console.log('buscandooo',search)}
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

                {/* Had troubles with this moduleId Field
                  from the API It cames hydratated (full related object)
                  and for some reason getInputProps is not being able to select the apropiate value
                  has to made It manually, and setting the value to only the moduleId String instead
                  of the object, if posible It requieres some improvement     
                  */}
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