import * as React from "react";
import { Layout } from "components/Layout";
import { getSessionUser } from "lib/auth";
import { getTranslations } from "lib/getTranslation";
import { requestAll } from "lib/utils";
import type { GetServerSideProps } from "next";
import { useTranslations } from "use-intl";
import { Title } from "components/shared/Title";
import { Permissions } from "hooks/usePermission";
import type { GetEmsFdActiveDeputy, GetIncidentsData } from "@snailycad/types/api";

import { useEmsFdState } from "state/ems-fd-state";
import { IncidentsTable } from "components/leo/incidents/incidents-table";

interface Props {
  incidents: GetIncidentsData<"ems-fd">;
  activeDeputy: GetEmsFdActiveDeputy | null;
}

export default function EmsFdIncidents({ activeDeputy, incidents: initialData }: Props) {
  const t = useTranslations("Leo");
  const setActiveDeputy = useEmsFdState((state) => state.setActiveDeputy);

  const isDeputyOnDuty =
    (activeDeputy && activeDeputy.status?.shouldDo !== "SET_OFF_DUTY") ?? false;

  React.useEffect(() => {
    setActiveDeputy(activeDeputy);
  }, [setActiveDeputy, activeDeputy]);

  return (
    <Layout
      permissions={{
        permissions: [Permissions.ViewEmsFdIncidents, Permissions.ManageEmsFdIncidents],
      }}
      className="dark:text-white"
    >
      <header className="flex items-center justify-between">
        <Title className="!mb-0">{t("incidents")}</Title>
      </header>

      <IncidentsTable initialData={initialData} isUnitOnDuty={isDeputyOnDuty} type="ems-fd" />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const user = await getSessionUser(req);
  const [incidents, activeDeputy, values] = await requestAll(req, [
    ["/ems-fd/incidents", { incidents: [], totalCount: 0 }],
    ["/ems-fd/active-deputy", null],
    ["/admin/values/codes_10", []],
  ]);

  return {
    props: {
      session: user,
      incidents,
      activeDeputy,
      values,
      messages: {
        ...(await getTranslations(["leo", "calls", "common"], user?.locale ?? locale)),
      },
    },
  };
};
