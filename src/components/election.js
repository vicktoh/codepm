const fetchPollingUnit = async (projectId) => {
  const result = await fetch(
    `https://q7i0osx2aa.execute-api.eu-west-2.amazonaws.com/abuja-prod/elections/63f8f25b594e164f8146a213/pus?ward=${projectId}`,
    {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNjNlOWU4ZmRhMDhlMDYwZTA0NDg0ODcyIiwiaWRlbnRpZmllciI6Ijg3ZmEyMTA1LWZlOTQtNGEyYi1iNWJhLTllZDE1YWNlZTlhOCJ9LCJleHAiOjE2Nzg1OTc4MDMsImlhdCI6MTY3NzQxMzQwM30.GCPC64NHUClyFuwAwZ2kb-JnZ3PcVoq7AJBAjuu3ujs",
      },
    },
  );
  if (result.ok) {
    const response = await result.json();
    return response["data"];
  }
};

const extractData = (data) => {
  return data.map((polling) => {
    const document =
      polling.document && polling.document.url
        ? polling.document.url
        : "unknown";
    const documentUpdatedAt =
      polling.document && polling.document.updated_at
        ? polling.document.updated_at
        : "unknown";
    const pollingUnit = polling.name || "unknown polling unit";
    const lga =
      polling.polling_unit && polling.polling_unit.lga
        ? polling.polling_unit.lga.name
        : "";
    const wardId =
      polling.ward && polling.ward._id ? polling.ward._id : "unknown";

    return {
      wardId,
      document,
      documentUpdatedAt,
      pollingUnit,
      lga,
    };
  });
};

const downloadFile = (data, name) => {
  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const dlAnchorElem = document.createElement("a");
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `${name}.json`);
  dlAnchorElem.click();
};
const wards = [];
const fetchElectionData = async () => {
  let finalData = [];
  try {
    for (let i = 0; i < wards.length; i++) {
      const res = await fetchPollingUnit(wards[i]);
      const data = extractData(res);
      console.log(i);
      finalData = finalData.concat(data);
    }
    downloadFile(finalData);
  } catch {
    downloadFile(finalData);
  }
};
