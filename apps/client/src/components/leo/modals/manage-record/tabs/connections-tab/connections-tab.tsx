import { AsyncListSearchField, Button, Item, TabsContent } from "@snailycad/ui";
import { useFormikContext } from "formik";
import { useCall911State } from "state/dispatch/call-911-state";
import { useModal } from "state/modalState";
import { ModalIds } from "types/modal-ids";
import { useTranslations } from "use-intl";

import dynamic from "next/dynamic";
import type { Call911, Record } from "@snailycad/types";
import type { Get911CallsData } from "@snailycad/types/api";

const Manage911CallModal = dynamic(
  async () =>
    (await import("components/dispatch/active-calls/modals/manage-911-call-modal"))
      .Manage911CallModal,
);

interface _FormikContext {
  call911Id: string | null;
  incidentId: string | null;

  call911CaseNumber: string;
}

export function ConnectionsTab({
  record,
}: {
  record?: Record | null;
  isReadOnly?: boolean;
}) {
  const t = useTranslations("Leo");
  const { setFieldValue, setValues, errors, values } =
    useFormikContext<_FormikContext>();

  const { calls, setCurrentlySelectedCall } = useCall911State((state) => ({
    calls: state.calls,
    setCurrentlySelectedCall: state.setCurrentlySelectedCall,
  }));
  const modalState = useModal();


  const call =
    (values.call911Id && (record as any)?.call911) ??
    calls.find((call) => call.id === values.call911Id) ??
    null;

  return (
    <TabsContent value="connections-tab">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold">{t("connections")}</h3>
      </header>

      <div className="flex gap-2 items-center">
        <AsyncListSearchField<Call911>
          label={t("call")}
          isClearable
          allowsCustomValue
          isOptional
          errorMessage={errors.call911Id}
          localValue={values.call911CaseNumber}
          selectedKey={values.call911Id}
          className="w-full"
          onInputChange={(value) => setFieldValue("call911CaseNumber", value)}
          onSelectionChange={(node) => {
            if (node) {
              setValues({
                ...values,
                call911CaseNumber: String(node.value?.caseNumber ?? node.textValue),
                call911Id: node.key as string,
              });
            }
          }}
          fetchOptions={{
            apiPath: (query) => `/911-calls?query=${query}&includeEnded=true`,
            onResponse(json: Get911CallsData) {
              return json.calls;
            },
          }}
        >
          {(item) => (
            <Item textValue={`#${item.caseNumber}`} key={item.id}>
              #{item.caseNumber}
            </Item>
          )}
        </AsyncListSearchField>
        {values.call911Id ? (
          <>
            <Button
              onPress={() => {
                setCurrentlySelectedCall(call);
                modalState.openModal(ModalIds.Manage911Call);
              }}
              className="min-w-fit mt-3.5 h-[39px]"
            >
              {t("viewCall")}
            </Button>

            {call ? <Manage911CallModal call={call} forceDisabled /> : null}
          </>
        ) : null}
      </div>
    </TabsContent>
  );
}
