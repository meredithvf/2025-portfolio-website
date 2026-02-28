"use client";

import { datadogRum } from "@datadog/browser-rum";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";

const DATADOG_ENABLED = true;
const DATADOG_APPLICATION_ID = "0a6033c8-9f60-4801-b677-5831ba8176fb";
const DATADOG_CLIENT_TOKEN = "pub8166265dcf567446f1ef64bee2ae4d14";
const DATADOG_SITE = "us5.datadoghq.com";
const DATADOG_SERVICE = "portfolio-website";
const DATADOG_ENV = "production";
const DATADOG_VERSION = "1.0.0";
const DATADOG_SESSION_SAMPLE_RATE = 100;
const DATADOG_SESSION_REPLAY_SAMPLE_RATE = 20;

const getViewName = (pathname: string, searchParams: ReadonlyURLSearchParams) => {
  if (pathname === "/") {
    const restoredProject = searchParams.get("project");
    return restoredProject ? `Home (Project: ${restoredProject})` : "Home";
  }

  if (pathname.startsWith("/work/")) {
    const slug = pathname.replace("/work/", "");
    return slug ? `Project: ${slug}` : "Project Detail";
  }

  return pathname.replace(/\//g, " ").trim() || "Unknown View";
};

export default function DatadogRumInit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!DATADOG_ENABLED || !DATADOG_APPLICATION_ID || !DATADOG_CLIENT_TOKEN) {
      return;
    }

    if (datadogRum.getInitConfiguration()) {
      return;
    }

    datadogRum.init({
      applicationId: DATADOG_APPLICATION_ID,
      clientToken: DATADOG_CLIENT_TOKEN,
      site: DATADOG_SITE,
      service: DATADOG_SERVICE,
      env: DATADOG_ENV,
      version: DATADOG_VERSION,
      sessionSampleRate: DATADOG_SESSION_SAMPLE_RATE,
      sessionReplaySampleRate: DATADOG_SESSION_REPLAY_SAMPLE_RATE,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    });

    datadogRum.startSessionReplayRecording();
  }, []);

  useEffect(() => {
    if (!datadogRum.getInitConfiguration()) {
      return;
    }

    const viewName = getViewName(pathname, searchParams);
    (
      datadogRum as unknown as {
        setViewName?: (name: string) => void;
      }
    ).setViewName?.(viewName);
  }, [pathname, searchParams]);

  return null;
}
