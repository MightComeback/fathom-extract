const issueId = "MIG-14";
const apiKey = process.env.LINEAR_API_KEY;

async function check() {
  const query = `query {
    issue(id: "${issueId}") {
      state {
        type
      }
    }
  }`;

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (data.data && data.data.issue && data.data.issue.state) {
      console.log(data.data.issue.state.type);
    } else {
      console.log("unknown");
    }
  } catch (e) {
    console.log("error");
  }
}
check();
