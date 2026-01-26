import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { Select, Button, Group, TextInput, Text, Stack } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useEffect } from "react";

type EventType =
  | "WEBINAR"
  | "SEMINARIO"
  | "CONGRESO"
  | "SIMPOSIO"
  | "CURSO"
  | "OTRO";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEBINAR: "Webinar",
  SEMINARIO: "Seminario",
  CONGRESO: "Congreso",
  SIMPOSIO: "Simposio",
  CURSO: "Curso",
  OTRO: "Otro",
};

const EVENT_TYPE_OPTIONS = (Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(
  (k) => ({
    value: k,
    label: EVENT_TYPE_LABELS[k],
  }),
);

// Definición de tipos para sesiones y subsesiones
interface SubSession {
  title: string;
  startDateTime: string;
  endDateTime: string;
  speakers: any[];
  room: string;
  moduleId: string | null;
}

interface Session {
  title: string;
  type: EventType;
  startDateTime: string;
  endDateTime: string;
  speakers: any[];
  room: string;
  moduleId: string | null;
  subSessions: SubSession[];
}

export const AgendaEdit: React.FC = () => {
  const {
    saveButtonProps,
    getInputProps,
    values,
    setFieldValue,
    refineCore: { query: queryResult },
  } = useForm({
    refineCoreProps: {
      redirect: false,
    },
    initialValues: {
      _id: "",
      eventId: {
        _id: "",
        name: "",
      },
      title: "",
      sessions: [] as Session[],
      startDate: new Date().toString(),
      status: "",
      category: {
        id: "",
      },
      content: "",
    },
    transformValues: (values) => {
      return {
        ...values,
        eventId: values?.eventId?._id || "",
      };
    },
  });

  useEffect(() => {
    console.log("queryResult =>", queryResult?.data?.data);
  }, [queryResult?.data?.data]);
  // -------------------------
  // SESSIONS
  // -------------------------
  const addSession = (): void => {
    const newSession: Session = {
      title: "",
      type: "OTRO",
      startDateTime: "2025-11-14T18:10:00.000Z",
      endDateTime: "2025-11-14T18:10:00.000Z",
      speakers: [],
      room: "",
      moduleId: null,
      subSessions: [],
    };

    setFieldValue("sessions", [...values.sessions, newSession]);
  };

  const removeSession = (index: number): void => {
    setFieldValue(
      "sessions",
      values.sessions.filter((_, i) => i !== index),
    );
  };

  // -------------------------
  // SUBSESSIONS
  // -------------------------
  const addSubSession = (indexSession: number): void => {
    const newSubSession: SubSession = {
      title: "",
      startDateTime: "2025-11-14T18:10:00.000Z",
      endDateTime: "2025-11-14T18:10:00.000Z",
      speakers: [],
      room: "",
      moduleId: null,
    };

    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].subSessions = [
      ...updatedSessions[indexSession].subSessions,
      newSubSession,
    ];

    setFieldValue("sessions", updatedSessions);
  };

  const removeSubSession = (indexSession: number, indexSubSession: number): void => {
    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].subSessions = updatedSessions[
      indexSession
    ].subSessions.filter((_, i) => i !== indexSubSession);

    setFieldValue("sessions", updatedSessions);
  };

  // -------------------------
  // SPEAKERS (SESSION)
  // -------------------------
  const addSpeaker = (indexSession: number): void => {
    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].speakers.push({});

    setFieldValue("sessions", updatedSessions);
  };

  const removeSpeaker = (indexSession: number, indexSpeaker: number): void => {
    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].speakers = updatedSessions[
      indexSession
    ].speakers.filter((_, i) => i !== indexSpeaker);

    setFieldValue("sessions", updatedSessions);
  };

  // -------------------------
  // SPEAKERS (SUBSESSION)
  // -------------------------
  const addSubSpeaker = (indexSession: number, indexSubSession: number): void => {
    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].subSessions[indexSubSession].speakers.push({});

    setFieldValue("sessions", updatedSessions);
  };

  const removeSubSpeaker = (
    indexSession: number,
    indexSubSession: number,
    indexSpeaker: number,
  ): void => {
    const updatedSessions = [...values.sessions];
    updatedSessions[indexSession].subSessions[indexSubSession].speakers = updatedSessions[
      indexSession
    ].subSessions[indexSubSession].speakers.filter((_, i) => i !== indexSpeaker);

    setFieldValue("sessions", updatedSessions);
  };

  // -------------------------
  // SELECT DATA
  // -------------------------
  const { selectProps: speakerSelectProps } = useSelect({
    resource: "speakers",
    optionLabel: "names",
    optionValue: "_id",
    pagination: { pageSize: 1000, current: 1, mode: "server" },
    filters: [
      {
        field: "eventId",
        operator: "eq",
        value: values?.eventId?._id || queryResult?.data?.data?.eventId?._id,
      },
    ],
    queryOptions: {
      enabled: !!(
        values?.eventId?._id || queryResult?.data?.data?.eventId?._id
      ),
    },
  });

  const { selectProps: moduleSelectProps } = useSelect({
    resource: "modules",
    optionLabel: "title",
    optionValue: "_id",
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <Text mt={8}>ID: {queryResult?.data?.data?._id}</Text>
        <Text mt={8}>Nombre: {queryResult?.data?.data?.eventId?.name}</Text>

        <TextInput
          type="hidden"
          mt={8}
          label=""
          placeholder="title"
          {...getInputProps("title")}
          value="{queryResult?.data?.data?.eventId?.name}"
        />

        <Stack spacing="md">
          {values.sessions.map((session, index) => (
            <Stack
              key={index}
              spacing="sm"
              sx={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <Group grow style={{ alignItems: "flex-end" }}>
                {/* Tipo de sesión */}
                <Select
                  style={{ maxWidth: "180px" }}
                  label="Tipo de sesión"
                  placeholder="Selecciona el tipo"
                  data={EVENT_TYPE_OPTIONS}
                  {...getInputProps(`sessions.${index}.type`)}
                  value={session?.type ?? "OTRO"}
                  onChange={(value) =>
                    getInputProps(`sessions.${index}.type`).onChange(value)
                  }
                  searchable
                  required
                />

                <DateTimePicker
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  style={{ maxWidth: "160px" }}
                  label="Start Date and Time"
                  placeholder="Select start date and time"
                  {...getInputProps(`sessions.${index}.startDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.startDateTime`).value
                      ? dayjs(
                          getInputProps(`sessions.${index}.startDateTime`)
                            .value,
                        ).toDate()
                      : null
                  }
                  onChange={(value) =>
                    getInputProps(`sessions.${index}.startDateTime`).onChange(
                      value,
                    )
                  }
                  required
                />

                <DateTimePicker
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  style={{ maxWidth: "160px" }}
                  label="End Date and Time"
                  placeholder="Select end date and time"
                  {...getInputProps(`sessions.${index}.endDateTime`)}
                  value={
                    getInputProps(`sessions.${index}.endDateTime`).value
                      ? dayjs(
                          getInputProps(`sessions.${index}.endDateTime`).value,
                        ).toDate()
                      : null
                  }
                  onChange={(value) =>
                    getInputProps(`sessions.${index}.endDateTime`).onChange(
                      value,
                    )
                  }
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

              {/* Speakers (sesión normal) */}
              <Group>
                {values?.sessions[index]?.speakers &&
                  values.sessions[index].speakers.map(
                    (speaker, speakerIndex) => (
                      <div
                        key={speakerIndex}
                        style={{
                          marginLeft: "20px",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "flex-end",
                        }}
                      >
                        <Select
                          key={speakerIndex}
                          style={{ display: "inline" }}
                          label={`Speaker ${speakerIndex}`}
                          {...getInputProps(
                            `sessions.${index}.speakers.${speakerIndex}._id`,
                          )}
                          data={speakerSelectProps.data}
                          searchable={true}
                          onSearchChange={(search) =>
                            console.log("buscandooo", search)
                          }
                          filterDataOnExactSearchMatch={false}
                        />
                        <Button
                          style={{ backgroundColor: "rgba(200,150,150,0.7)" }}
                          onClick={() => removeSpeaker(index, speakerIndex)}
                        >
                          x
                        </Button>
                      </div>
                    ),
                  )}

                <button type="button" onClick={() => addSpeaker(index)}>
                  Add Speaker
                </button>
              </Group>

              <Group grow>
                <TextInput
                  label="Room"
                  placeholder="Enter Room"
                  {...getInputProps(`sessions.${index}.room`)}
                />

                <Select
                  label="Modulo"
                  placeholder="Pick one"
                  data={moduleSelectProps.data}
                  searchable={moduleSelectProps.searchable}
                  value={
                    session["moduleId"] ?? null
                  }
                  onChange={(value) =>
                    getInputProps(`sessions.${index}.moduleId`).onChange(value)
                  }
                />
              </Group>

              {/* SUBSESSIONS */}
              <Stack
                spacing="md"
                sx={{
                  marginTop: "1rem",
                  padding: "1rem",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                }}
              >
                <Text weight={600}>Subsesiones</Text>

                {(values.sessions[index]?.subSessions || []).map(
                  (sub, subIndex) => (
                    <Stack
                      key={subIndex}
                      spacing="sm"
                      sx={{
                        padding: "1rem",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                      }}
                    >
                      <Group grow style={{ alignItems: "flex-end" }}>
                        <DateTimePicker
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                          style={{ maxWidth: "160px" }}
                          label="Start Date and Time"
                          placeholder="Select start date and time"
                          {...getInputProps(
                            `sessions.${index}.subSessions.${subIndex}.startDateTime`,
                          )}
                          value={
                            getInputProps(
                              `sessions.${index}.subSessions.${subIndex}.startDateTime`,
                            ).value
                              ? dayjs(
                                  getInputProps(
                                    `sessions.${index}.subSessions.${subIndex}.startDateTime`,
                                  ).value,
                                ).toDate()
                              : null
                          }
                          onChange={(value) =>
                            getInputProps(
                              `sessions.${index}.subSessions.${subIndex}.startDateTime`,
                            ).onChange(value)
                          }
                          required
                        />

                        <DateTimePicker
                          onPointerEnterCapture={undefined}
                          onPointerLeaveCapture={undefined}
                          style={{ maxWidth: "160px" }}
                          label="End Date and Time"
                          placeholder="Select end date and time"
                          {...getInputProps(
                            `sessions.${index}.subSessions.${subIndex}.endDateTime`,
                          )}
                          value={
                            getInputProps(
                              `sessions.${index}.subSessions.${subIndex}.endDateTime`,
                            ).value
                              ? dayjs(
                                  getInputProps(
                                    `sessions.${index}.subSessions.${subIndex}.endDateTime`,
                                  ).value,
                                ).toDate()
                              : null
                          }
                          onChange={(value) =>
                            getInputProps(
                              `sessions.${index}.subSessions.${subIndex}.endDateTime`,
                            ).onChange(value)
                          }
                        />

                        <TextInput
                          style={{ minWidth: "500px" }}
                          label="Title"
                          placeholder="Enter session title"
                          {...getInputProps(
                            `sessions.${index}.subSessions.${subIndex}.title`,
                          )}
                          required
                        />

                        <Button
                          color="blue"
                          onClick={() => removeSubSession(index, subIndex)}
                        >
                          Remove
                        </Button>
                      </Group>

                      {/* ✅ Speakers (subsesión) - IGUAL QUE SESIÓN NORMAL */}
                      <Group>
                        {values?.sessions[index]?.subSessions?.[subIndex]
                          ?.speakers &&
                          values.sessions[index].subSessions[
                            subIndex
                          ].speakers.map((sp, spIndex) => (
                            <div
                              key={spIndex}
                              style={{
                                marginLeft: "20px",
                                marginBottom: "10px",
                                display: "flex",
                                alignItems: "flex-end",
                              }}
                            >
                              <Select
                                key={spIndex}
                                style={{ display: "inline" }}
                                label={`Speaker ${spIndex}`}
                                {...getInputProps(
                                  `sessions.${index}.subSessions.${subIndex}.speakers.${spIndex}._id`,
                                )}
                                data={speakerSelectProps.data}
                                searchable={true}
                                onSearchChange={(search) =>
                                  console.log("buscandooo", search)
                                }
                                filterDataOnExactSearchMatch={false}
                              />
                              <Button
                                style={{
                                  backgroundColor: "rgba(200,150,150,0.7)",
                                }}
                                onClick={() =>
                                  removeSubSpeaker(index, subIndex, spIndex)
                                }
                              >
                                x
                              </Button>
                            </div>
                          ))}

                        <button
                          type="button"
                          onClick={() => addSubSpeaker(index, subIndex)}
                        >
                          Add Speaker
                        </button>
                      </Group>

                      <Group grow>
                        <TextInput
                          label="Room"
                          placeholder="Enter Room"
                          {...getInputProps(
                            `sessions.${index}.subSessions.${subIndex}.room`,
                          )}
                        />

                        <Select
                          label="Modulo"
                          placeholder="Pick one"
                          data={moduleSelectProps.data}
                          searchable={moduleSelectProps.searchable}
                          value={
                            sub["moduleId"] ?? null
                          }
                          onChange={(value) =>
                            getInputProps(
                              `sessions.${index}.subSessions.${subIndex}.moduleId`,
                            ).onChange(value)
                          }
                        />
                      </Group>
                    </Stack>
                  ),
                )}

                <Group position="apart">
                  <Button color="teal" onClick={() => addSubSession(index)}>
                    Add New SubSession
                  </Button>
                </Group>
              </Stack>
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
