import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { invoke as invokeTauri } from "@tauri-apps/api";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

export function useLocalFile<T>(filename: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readTextFile(filename, {
      dir: BaseDirectory.AppData,
    }).then((text) => {
      setLoaded(true);
      if (text === "") {
        return;
      }
      const data = JSON.parse(text);
      setState(data);
    });
  }, [filename]);

  useEffect(() => {
    if (loaded) {
      writeTextFile(filename, JSON.stringify(state), {
        dir: BaseDirectory.AppData,
      });
    }
  }, [filename, state]);

  return [state, setState] as const;
}

export async function invoke<T>(name: string, payload?: any): Promise<T> {
  try {
    return await invokeTauri<T>(name, payload);
  } catch (e) {
    if (typeof e === "string") {
      notifications.show({
        title: "Error",
        message: e,
        color: "red",
        icon: <IconX />,
      });
    }
    return Promise.reject(e);
  }
}