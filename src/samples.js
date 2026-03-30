import i18next from "i18next";

export function getSamples() {
  return i18next.t("list", { ns: "samples", returnObjects: true }) || [];
}
