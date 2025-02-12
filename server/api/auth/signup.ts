import { z } from "zod";
import { hash } from "bcrypt";

const signupSchema = z.object({
  emailAddress: z.string().email(),
  familyName: z.string(),
  givenName: z.string(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (b) => signupSchema.safeParse(b));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing login credentials",
    });
  }

  // Check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      emailAddress: body.data.emailAddress,
    },
  });

  if (user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Email address already in use",
    });
  }

  // Create a new user
  const hashedPassword = await hash(body.data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      emailAddress: body.data.emailAddress,
      familyName: body.data.familyName,
      givenName: body.data.givenName,
      password: hashedPassword,
    },
  });

  if (!newUser) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating user",
    });
  }

  // Create a personal workspace for the user
  const workspace = await prisma.workspace.create({
    data: {
      title: body.data.givenName + "'s Personal Workspace",
      description: "Personal workspace for " + body.data.givenName,
      personal: true,
      type: "personal",
      WorkspaceMember: {
        create: {
          admin: false,
          owner: true,
          userId: newUser.id,
        },
      },
    },
  });

  if (!workspace) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating workspace",
    });
  }

  return sendRedirect(event, "/login");
});
