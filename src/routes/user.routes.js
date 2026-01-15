import { Router } from "express";
import { addUser, getUser, getUsers, removeUser, updateUser } from "../controllers/user.controller.js";
import { validateCreateUser } from "../middlewares/user.middleware.js";

const userRouter = Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:id', getUser);
userRouter.post('/users', addUser);
userRouter.delete('/users/:id', removeUser);
userRouter.put('/users/:id', updateUser);
userRouter.post('/users', validateCreateUser, addUser);


export { userRouter };