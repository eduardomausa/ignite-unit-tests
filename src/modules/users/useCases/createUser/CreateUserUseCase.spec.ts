import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "Eduardo Mausa",
      email: "eduardomausa@mail.com",
      password: "1234",
    }

    const createdUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    expect(createdUser.name).toBe("Eduardo Mausa");

  });

});