"use client";

import HeatMap from "@uiw/react-heat-map";

type Props = {
  data: Record<string, number>;
};

export function ContributionCalendar({ data }: Props) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const values = Object.entries(data).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="w-full overflow-x-auto">
      <HeatMap
        value={values}
        startDate={startDate}
        endDate={today}
        width="100%"
        rectSize={14}
        space={3}
        style={{ color: "var(--muted)" }}
        legendCellSize={14}
        weekLabels={["", "Lun", "", "Mer", "", "Ven", ""]}
        monthLabels={["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]}
        panelColors={{
          0: "var(--card-border, #2a2a3a)",
          1: "#6b21a840",
          2: "#6b21a870",
          4: "#9333eaaa",
          8: "#b044e0",
        }}
        rectRender={(props, data) => {
          const title = data.date
            ? `${new Date(data.date).toLocaleDateString("fr-FR")} : ${data.count ?? 0} run${(data.count ?? 0) > 1 ? "s" : ""}`
            : "";
          return <rect {...props}><title>{title}</title></rect>;
        }}
      />
    </div>
  );
}
