export type ActionState = {
  ok: boolean;
  message: string;
};

export const initialActionState: ActionState = {
  ok: false,
  message: "",
};

export function actionSuccess(message: string): ActionState {
  return {
    ok: true,
    message,
  };
}

export function actionFailure(message: string): ActionState {
  return {
    ok: false,
    message,
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}