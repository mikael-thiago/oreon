import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/modules/shared/types/backend-error";
import { setFormValidationErrors } from "@/modules/shared/utils/api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuthContext } from "../context/auth-context";
import { loginSchema, type LoginFormData } from "../schemas/login-schema";
import { type LoginRequest } from "../services/auth-service";

export function Login({ className, ...props }: React.ComponentProps<"div">) {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending, error: apiError } = useMutation<
    void,
    ApiError,
    LoginRequest
  >({
    mutationFn: async (request: LoginRequest) => {
      if (auth.state !== "deslogado") return;

      await auth.login(request);
    },
    async onSuccess() {
      await router.invalidate();

      navigate({
        to: "/home",
      });
    },
    onError: (error) => {
      setFormValidationErrors(error, setError, ["email", "senha"]);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form
                className="p-6 md:p-8 group"
                data-isloading={isPending}
                onSubmit={handleSubmit(onSubmit)}
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Seja bem vindo</h1>
                    <p className="text-muted-foreground text-balance">
                      Realize o login na sua conta
                    </p>
                  </div>

                  {apiError && apiError.type !== "validation-error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" />
                      <AlertTitle>Erro ao fazer login</AlertTitle>
                      <AlertDescription>{apiError.mensagem}</AlertDescription>
                    </Alert>
                  )}

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        disabled={isPending}
                        aria-invalid={!!errors.email}
                        {...register("email")}
                      />
                      <FieldError errors={[errors.email]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!errors.senha}>
                    <FieldLabel htmlFor="senha">Senha</FieldLabel>
                    <FieldContent>
                      <Input
                        id="senha"
                        type="password"
                        disabled={isPending}
                        aria-invalid={!!errors.senha}
                        {...register("senha")}
                      />
                      <FieldError errors={[errors.senha]} />
                    </FieldContent>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Spinner />}
                      Login
                    </Button>
                  </Field>
                </FieldGroup>
              </form>

              <div className="bg-muted relative hidden md:block">
                <img
                  src="/imagens/minerva.webp"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
