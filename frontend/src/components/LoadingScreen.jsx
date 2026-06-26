import Spinner from "./Spinner";

export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <Spinner />
    </div>
  );

}