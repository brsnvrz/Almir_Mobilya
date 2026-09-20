/** Yerel geliştirme ortamı (localhost, LAN IP vb.) */
export function isLocalDevHost(hostname = typeof window !== "undefined" ? window.location.hostname : "") {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

/** LAN IP ile açıldığında OAuth callback localhost'a döner (Lovable izin listesi). */
export function getOAuthRedirectUri(origin = typeof window !== "undefined" ? window.location.origin : "") {
  if (!origin) return "";
  try {
    const url = new URL(origin);
    if (isLocalDevHost(url.hostname) && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      return `${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`;
    }
    return origin;
  } catch {
    return origin;
  }
}

export function isLanHost(hostname = typeof window !== "undefined" ? window.location.hostname : "") {
  return (
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}
