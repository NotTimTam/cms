export default function Page({ params }) {
	return (
		<>
			<h1>Dynamic Page</h1>
			<p>Params: {JSON.stringify(params)}</p>
		</>
	);
}
