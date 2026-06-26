import Spinner from "./Spinner";

export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <Spinner />
      <p className="text-gray-500 font-semibold">Loading...</p>
    </div>
  );

}