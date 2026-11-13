import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconApple, IconBrandAndroid } from "@tabler/icons-react";
import { API_URL } from "../../components/dataProvider/customGenRestDataProvider";

type DayStat = { day: string; active: number; newUsers: number; returning: number; opens: number };
type Stats = {
  from: string;
  to: string;
  returningGapDays: number;
  trackingSince: string | null;
  totals: { uniqueUsers: number; newUsers: number; returning: number };
  days: DayStat[];
};
type Realtime = {
  available: boolean;
  error?: string;
  activeUsers: number;
  byPlatform: { platform: string; activeUsers: number }[];
  byMinute: { minutesAgo: number; activeUsers: number }[];
  fetchedAt: string;
};

const COLORS = { other: "#4d93d0", newUsers: "#2f9e44", returning: "#f08c00" };
const REALTIME_REFRESH_MS = 60_000;
const PLATFORM_LABEL: Record<string, string> = { ANDROID: "Android", IOS: "iOS", WEB: "Web" };

const bogotaToday = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
const shiftDay = (day: string, delta: number) =>
  new Date(Date.parse(day) + delta * 86400000).toISOString().slice(0, 10);
const formatDay = (day: string) => {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
};
const fmt = (n: number) => n.toLocaleString("es-CO");

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export default function AppStatistics() {
  const [range, setRange] = useState("30");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [realtime, setRealtime] = useState<Realtime | null>(null);

  useEffect(() => {
    const to = bogotaToday();
    const from = shiftDay(to, -(Number(range) - 1));
    setStats(null);
    setStatsError(null);
    getJson<Stats>(`/app-activity/stats?from=${from}&to=${to}`)
      .then(setStats)
      .catch(() => setStatsError("No se pudieron cargar las estadísticas"));
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getJson<Realtime>("/app-activity/realtime")
        .then((r) => !cancelled && setRealtime(r))
        .catch(() => !cancelled && setRealtime(null));
    load();
    const id = setInterval(load, REALTIME_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const today = stats?.days[stats.days.length - 1];

  return (
    <Stack spacing="lg" p="md">
      <Group position="apart">
        <Title order={2}>Estadísticas de la App</Title>
        <SegmentedControl
          value={range}
          onChange={setRange}
          data={[
            { label: "7 días", value: "7" },
            { label: "30 días", value: "30" },
            { label: "90 días", value: "90" },
          ]}
        />
      </Group>

      <RealtimeCard realtime={realtime} />

      {statsError && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {statsError}
        </Alert>
      )}
      {!stats && !statsError && <Loader />}

      {stats && (
        <>
          {stats.trackingSince ? (
            <Text size="sm" color="dimmed">
              Datos registrados desde el {stats.trackingSince}. Cuenta a las personas que abren la app
              con la sesión iniciada (un acceso por persona y día, hora de Colombia).
            </Text>
          ) : (
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              Aún no hay accesos registrados. Los datos empiezan a contarse desde que se despliega el
              registro de actividad en el backend.
            </Alert>
          )}

          <SimpleGrid cols={4} breakpoints={[{ maxWidth: "md", cols: 2 }, { maxWidth: "xs", cols: 1 }]}>
            <StatCard label="Activos hoy" value={today?.active ?? 0} />
            <StatCard
              label={`Personas distintas (${range} días)`}
              value={stats.totals.uniqueUsers}
              color={COLORS.other}
            />
            <StatCard label="Nuevos" value={stats.totals.newUsers} color={COLORS.newUsers} />
            <StatCard
              label={`Volvieron tras ${stats.returningGapDays}+ días`}
              value={stats.totals.returning}
              color={COLORS.returning}
            />
          </SimpleGrid>

          <Paper withBorder radius="md" p="md">
            <Group position="apart" mb="sm">
              <Text weight={600}>Usuarios activos por día</Text>
              <Group spacing="md">
                <Legend color={COLORS.other} label="Recurrentes" />
                <Legend color={COLORS.newUsers} label="Nuevos" />
                <Legend color={COLORS.returning} label={`Volvieron tras ${stats.returningGapDays}+ días`} />
              </Group>
            </Group>
            <DailyChart days={stats.days} />
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Text weight={600} mb="sm">
              Detalle por día
            </Text>
            <Table striped highlightOnHover fontSize="sm">
              <thead>
                <tr>
                  <th>Día</th>
                  <th style={{ textAlign: "right" }}>Activos</th>
                  <th style={{ textAlign: "right" }}>Nuevos</th>
                  <th style={{ textAlign: "right" }}>Volvieron tras {stats.returningGapDays}+ días</th>
                  <th style={{ textAlign: "right" }}>Aperturas</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.days].reverse().map((d) => (
                  <tr key={d.day}>
                    <td>{d.day}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.active)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.newUsers)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.returning)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.opens)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Paper>
        </>
      )}

      <Paper withBorder radius="md" p="md">
        <Text weight={600} mb="xs">
          Descargas e instalaciones (consolas de las tiendas)
        </Text>
        <Group spacing="xl">
          <Anchor
            href="https://play.google.com/console/u/1/developers/5756729651370207928/app/4972985781024468330/tracks/production"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Group spacing={6}>
              <IconBrandAndroid size={20} /> Google Play
            </Group>
          </Anchor>
          <Anchor
            href="https://appstoreconnect.apple.com/analytics/app/d30/6736631927/overview?iaemeasure=totalDownloads"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Group spacing={6}>
              <IconApple size={20} /> App Store
            </Group>
          </Anchor>
        </Group>
      </Paper>
    </Stack>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
        {label}
      </Text>
      <Text size={28} weight={700} style={{ color }}>
        {fmt(value)}
      </Text>
    </Paper>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Group spacing={6}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <Text size="xs">{label}</Text>
    </Group>
  );
}

function RealtimeCard({ realtime }: { realtime: Realtime | null }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group position="apart" align="flex-start">
        <div>
          <Group spacing="xs">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: realtime?.available ? "#2f9e44" : "#adb5bd",
              }}
            />
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Activos ahora (últimos 30 min)
            </Text>
          </Group>
          {!realtime ? (
            <Loader size="sm" mt="xs" />
          ) : realtime.available ? (
            <>
              <Text size={36} weight={700}>
                {fmt(realtime.activeUsers)}
              </Text>
              <Group spacing="xs">
                {realtime.byPlatform.map((p) => (
                  <Badge key={p.platform} variant="light">
                    {PLATFORM_LABEL[p.platform.toUpperCase()] ?? p.platform}: {fmt(p.activeUsers)}
                  </Badge>
                ))}
              </Group>
            </>
          ) : (
            <Text size="sm" color="dimmed" mt="xs">
              No disponible: {realtime.error}
            </Text>
          )}
        </div>
        {realtime?.available && <MinuteChart byMinute={realtime.byMinute} />}
      </Group>
      <Text size="xs" color="dimmed" mt="xs">
        Fuente: Google Analytics (Firebase) de la app. Se actualiza cada minuto.
      </Text>
    </Paper>
  );
}

/** Barras por minuto, de hace 29 min (izquierda) a ahora (derecha). */
function MinuteChart({ byMinute }: { byMinute: Realtime["byMinute"] }) {
  const points = [...byMinute].sort((a, b) => b.minutesAgo - a.minutesAgo);
  const max = Math.max(1, ...points.map((p) => p.activeUsers));
  const W = 240;
  const H = 60;
  const bw = W / points.length;
  return (
    <svg width={W} height={H} role="img" aria-label="Usuarios activos por minuto">
      {points.map((p, i) => {
        const h = (p.activeUsers / max) * (H - 4);
        return (
          <rect key={p.minutesAgo} x={i * bw + 1} y={H - h} width={bw - 2} height={h} fill="#4d93d0" rx={1}>
            <title>
              {p.minutesAgo === 0 ? "Este minuto" : `Hace ${p.minutesAgo} min`}: {p.activeUsers}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}

/** Barras apiladas por día: recurrentes + nuevos + volvieron tras 90+ días = activos. */
function DailyChart({ days }: { days: DayStat[] }) {
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.active)), [days]);
  const H = 220;
  const PAD_BOTTOM = 22;
  const PAD_LEFT = 36;
  const W = Math.max(600, days.length * 18);
  const plotH = H - PAD_BOTTOM - 8;
  const bw = (W - PAD_LEFT) / days.length;
  const labelEvery = Math.ceil(days.length / 15);
  const ticks = [0, Math.round(max / 2), max];

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480 }} role="img" aria-label="Usuarios activos por día">
        {ticks.map((t) => {
          const y = 8 + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={PAD_LEFT} x2={W} y1={y} y2={y} stroke="#e9ecef" />
              <text x={PAD_LEFT - 6} y={y + 4} fontSize={10} textAnchor="end" fill="#868e96">
                {t}
              </text>
            </g>
          );
        })}
        {days.map((d, i) => {
          const x = PAD_LEFT + i * bw + bw * 0.15;
          const w = bw * 0.7;
          const other = Math.max(0, d.active - d.newUsers - d.returning);
          const segs = [
            { v: other, c: COLORS.other },
            { v: d.newUsers, c: COLORS.newUsers },
            { v: d.returning, c: COLORS.returning },
          ];
          let y = 8 + plotH;
          return (
            <g key={d.day}>
              <title>
                {`${d.day}\nActivos: ${d.active}\nNuevos: ${d.newUsers}\nVolvieron tras 90+ días: ${d.returning}\nAperturas: ${d.opens}`}
              </title>
              <rect x={PAD_LEFT + i * bw} y={8} width={bw} height={plotH} fill="transparent" />
              {segs.map((s, k) => {
                const h = (s.v / max) * plotH;
                y -= h;
                return h > 0 ? <rect key={k} x={x} y={y} width={w} height={h} fill={s.c} /> : null;
              })}
              {i % labelEvery === 0 && (
                <text x={x + w / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="#868e96">
                  {formatDay(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
