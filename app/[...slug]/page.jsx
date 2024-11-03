export default async function Page({ params }) {
	params = await params;

	return (
		<>
			<h1>Dynamic Page</h1>
			<p>Params: {JSON.stringify(params)}</p>
		</>
	);
}
